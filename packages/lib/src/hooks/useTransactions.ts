import { zero, sendAndWaitForConfirmations, TokenData, erc20, iwethabi, maxUint256, hasWeb3Instance, setWeb3Instance } from "@defi.org/web3-candies";
import { useMutation } from "@tanstack/react-query";
import { useGetHasAllowance, useNetwork, useRefetchBalances, useTwapContract } from "./hooks";
import BN from "bignumber.js";
import { isTxRejected, logger } from "../utils";
import { useShouldWrap } from "./lib";
import { SwapStatus } from "@orbs-network/swap-ui";
import { SwapSteps, Token } from "../types";
import { useWidgetContext } from "../widget/widget-context";
import { useGasPrice } from "./useGasPrice";
import { useOrderHistoryManager } from "./useOrderHistoryManager";
import { useAllowance } from "./useAllowance";

export const useCreateOrder = () => {
  const { maxFeePerGas, priorityFeePerGas } = useGasPrice();
  const { account, updateState, twap, dstToken, onCreateOrderSuccess, onCreateOrderFailed } = useWidgetContext();
  const {
    values: { createOrderArgs },
  } = twap;
  const twapContract = useTwapContract();

  return useMutation(
    async (srcToken: TokenData) => {
      if (!dstToken) {
        throw new Error("dstToken is not defined");
      }

      if (!twapContract) {
        throw new Error("twapContract is not defined");
      }

      if (!account) {
        throw new Error("account is not defined");
      }

      twap.analytics.onCreateOrderRequest(createOrderArgs, account);

      const tx = await sendAndWaitForConfirmations(
        twapContract.methods.ask(createOrderArgs as any),
        {
          from: account,
          maxPriorityFeePerGas: priorityFeePerGas || zero,
          maxFeePerGas,
        },
        undefined,
        undefined,
        {
          onTxHash: (createOrderTxHash) => {
            updateState({ createOrderTxHash });
          },
        },
      );

      const orderId = Number(tx.events.OrderCreated.returnValues.id);
      const txHash = tx.transactionHash;
      twap.analytics.onCreateOrderSuccess(txHash, orderId);
      logger("order created:", "orderId:", orderId, "txHash:", txHash);
      return {
        orderId,
        txHash,
      };
    },
    {
      onError(error) {
        onCreateOrderFailed?.((error as any).message);
      },
    },
  );
};

export const useWrapToken = () => {
  const { account, twap, onWrapSuccess, onWrapFailed, srcToken } = useWidgetContext();
  const srcAmount = twap.values.srcAmount;

  const network = useNetwork();
  const { priorityFeePerGas, maxFeePerGas } = useGasPrice();

  return useMutation(
    async () => {
      let txHash: string = "";
      if (!network) {
        throw new Error("network is not defined");
      }
      if (!account) {
        throw new Error("account is not defined");
      }

      await sendAndWaitForConfirmations(
        erc20<any>(network.wToken.symbol, network.wToken.address, network.wToken.decimals, iwethabi).methods.deposit(),
        {
          from: account,
          maxPriorityFeePerGas: priorityFeePerGas,
          maxFeePerGas,
          value: srcAmount,
        },
        undefined,
        undefined,
        {
          onTxHash: (hash) => {
            txHash = hash;
          },
        },
      );
      logger("token wrap success:", txHash);
      twap.analytics.onWrapSuccess(txHash);
      onWrapSuccess?.(srcToken!, txHash);
    },
    {
      onError: (error) => {
        onWrapFailed?.((error as any).message);
      },
    },
  );
};

export const useWrapOnly = () => {
  const { mutateAsync } = useWrapToken();

  const onSuccess = useRefetchBalances();

  return useMutation(async () => {
    await mutateAsync();
    await onSuccess();
  });
};

export const useUnwrapToken = () => {
  const { account, twap } = useWidgetContext();
  const { priorityFeePerGas, maxFeePerGas } = useGasPrice();
  const onSuccess = useRefetchBalances();
  const srcAmount = twap.values.srcAmount;
  const network = useNetwork();

  return useMutation(
    async () => {
      if (!network) {
        throw new Error("network is not defined");
      }
      if (!account) {
        throw new Error("account is not defined");
      }
      await sendAndWaitForConfirmations(
        erc20<any>(network.wToken.symbol, network.wToken.address, network.wToken.decimals, iwethabi).methods.withdraw(BN(srcAmount).toFixed(0)),
        { from: account, maxPriorityFeePerGas: priorityFeePerGas, maxFeePerGas },
        undefined,
        undefined,
      );
      await onSuccess();
    },
    {
      onError: (error) => {},
    },
  );
};

export const useApproveToken = () => {
  const { account, isExactAppoval, web3, config, twap, onApproveSuccess, onApproveFailed } = useWidgetContext();
  const { priorityFeePerGas, maxFeePerGas } = useGasPrice();
  const srcAmount = twap.values.srcAmount;
  const approvalAmount = isExactAppoval ? srcAmount : maxUint256;

  return useMutation(
    async (token: Token) => {
      if (!account) {
        throw new Error("account is not defined");
      }

      logger("approving token...");

      let txHash: string = "";
      if (!hasWeb3Instance()) {
        setWeb3Instance(web3);
      }
      const contract = erc20(token.symbol, token.address, token.decimals);

      await sendAndWaitForConfirmations(
        contract.methods.approve(config.twapAddress, BN(approvalAmount).decimalPlaces(0).toFixed(0)),
        {
          from: account,
          maxPriorityFeePerGas: priorityFeePerGas,
          maxFeePerGas,
        },
        undefined,
        undefined,
        {
          onTxHash: (value) => {
            txHash = value;
          },
        },
      );
      logger("token approve success:", txHash);
      twap.analytics.onApproveSuccess(txHash);
      onApproveSuccess?.(token!, txHash);
    },
    {
      onError: (error) => {
        onApproveFailed?.((error as any).message);
      },
    },
  );
};

const getSteps = (shouldWrap?: boolean, shouldApprove?: boolean) => {
  let steps: number[] = [];

  if (shouldWrap) {
    steps.push(SwapSteps.WRAP);
  }
  if (shouldApprove) {
    steps.push(SwapSteps.APPROVE);
  }

  steps.push(SwapSteps.CREATE);
  return steps;
};

export const useSubmitOrderFlow = () => {
  const { state, updateState, twap, onCreateOrderSuccess } = useWidgetContext();
  const { swapStatus, swapStep, createOrderTxHash, approveTxHash, wrapTxHash, wrapSuccess, swapData } = state;
  const { data: haveAllowance, refetch: refetchAllowance } = useAllowance();
  const shouldWrap = useShouldWrap();
  const { waitForNewOrder } = useOrderHistoryManager();
  const wToken = useNetwork()?.wToken;
  const refetchBalances = useRefetchBalances();
  const approve = useApproveToken().mutateAsync;
  const wrapToken = useWrapToken().mutateAsync;
  const createOrder = useCreateOrder().mutateAsync;
  const getHasAllowance = useGetHasAllowance();

  const srcAmount = twap.values.srcAmount;

  const mutate = useMutation(
    async () => {
      if (!swapData?.srcToken || !swapData?.dstToken) {
        throw new Error("Please select a token to swap");
      }

      if (!wToken) {
        throw new Error("WToken not defined");
      }

      const steps = getSteps(shouldWrap, !haveAllowance);
      logger(`Create order request`);
      updateState({ swapStatus: SwapStatus.LOADING, swapSteps: steps });

      let token = swapData.srcToken;

      if (shouldWrap) {
        updateState({ swapStep: SwapSteps.WRAP });
        await wrapToken();
        updateState({ wrapSuccess: true });
        token = wToken as Token;
      }

      if (!haveAllowance) {
        updateState({ swapStep: SwapSteps.APPROVE });
        await approve(token);
        const res = await getHasAllowance(token, srcAmount);
        if (!res) {
          throw new Error("Insufficient allowance to perform the swap. Please approve the token first.");
        }
        updateState({ approveSuccess: true });
      }

      updateState({ swapStep: SwapSteps.CREATE });
      const order = await createOrder(token);
      onCreateOrderSuccess?.(swapData.srcToken!, swapData!.dstToken!, swapData.srcAmount!, swapData.outAmount!, order.orderId);
      updateState({
        swapStatus: SwapStatus.SUCCESS,
      });
      waitForNewOrder(order.orderId);

      await refetchBalances();
    },
    {
      onError(error) {
        if (isTxRejected(error) && !wrapSuccess) {
          updateState({ swapStep: undefined, swapStatus: undefined });
        } else {
          updateState({ swapStatus: SwapStatus.FAILED });
        }
      },

      onSettled() {
        refetchAllowance();
      },
    },
  );

  const error = !mutate.error ? undefined : (mutate.error as any).message || "Failed to create order";

  return {
    ...mutate,
    error,
    swapStep,
    approveTxHash,
    wrapTxHash,
    createOrderTxHash,
    swapStatus,
  };
};

export const useCancelOrder = () => {
  const { priorityFeePerGas, maxFeePerGas } = useGasPrice();
  const { account, twap } = useWidgetContext();

  const twapContract = useTwapContract();
  const { waitForOrderCancellation } = useOrderHistoryManager();
  return useMutation(
    async (orderId: number) => {
      if (!twapContract) {
        throw new Error("twap contract not defined");
      }

      if (!account) {
        throw new Error("account not defined");
      }

      logger(`canceling order...`, orderId);

      twap.analytics.onCancelOrderRequest(orderId);
      await sendAndWaitForConfirmations(twapContract.methods.cancel(orderId), {
        from: account,
        maxPriorityFeePerGas: priorityFeePerGas,
        maxFeePerGas,
      });
      await waitForOrderCancellation(orderId);
      console.log(`order canceled`);
    },
    {
      onSuccess: () => {
        logger(`order canceled`);
        twap.analytics.onCancelOrderSuccess();
      },
      onError: (error: Error) => {
        console.log(`cancel error order`, error);
        twap.analytics.onCreateOrderError(error);
      },
    },
  );
};
