import { zero, sendAndWaitForConfirmations, TokenData, erc20, iwethabi, maxUint256, hasWeb3Instance, setWeb3Instance, account } from "@defi.org/web3-candies";
import { useMutation } from "@tanstack/react-query";
import { useGetHasAllowance, useNetwork, useRefetchBalances, useTwapContract } from "./hooks";
import { query, useGasPrice, useOrdersHistory } from "./query";
import BN from "bignumber.js";
import { isTxRejected, logger } from "../utils";
import { useShouldWrap } from "./lib";
import { SwapStatus } from "@orbs-network/swap-ui";
import { SwapSteps, Token } from "../types";
import { useWidgetContext } from "../widget/widget-context";

export const useCreateOrder = () => {
  const { maxFeePerGas, priorityFeePerGas } = useGasPrice();
  const { account, updateState, twap, dstToken } = useWidgetContext();
  const {
    values: { createOrderArgs },
  } = twap;
  const twapContract = useTwapContract();

  return useMutation(async (srcToken: TokenData) => {
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
      }
    );

    const orderId = Number(tx.events.OrderCreated.returnValues.id);
    const txHash = tx.transactionHash;
    twap.analytics.onCreateOrderSuccess(txHash, orderId);
    logger("order created:", "orderId:", orderId, "txHash:", txHash);
    return {
      orderId,
      txHash,
    };
  });
};

export const useWrapToken = () => {
  const { account, twap } = useWidgetContext();
  const srcAmount = twap.values.srcAmount;

  const network = useNetwork();
  const { priorityFeePerGas, maxFeePerGas } = useGasPrice();

  return useMutation(async () => {
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
      }
    );
    logger("token wrap success:", txHash);
    twap.analytics.onWrapSuccess(txHash);
  });
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
        undefined
      );
      await onSuccess();
    },
    {
      onError: (error) => {},
    }
  );
};

export const useApproveToken = () => {
  const { account, isExactAppoval, web3, config, twap } = useWidgetContext();
  const { priorityFeePerGas, maxFeePerGas } = useGasPrice();
  const srcAmount = twap.values.srcAmount;
  const approvalAmount = isExactAppoval ? srcAmount : maxUint256;

  return useMutation(async (token: TokenData) => {
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
      }
    );
    logger("token approve success:", txHash);
    twap.analytics.onApproveSuccess(txHash);
  });
};
const useUpdatedOrders = () => {
  const { account, updateState, twap } = useWidgetContext();

  const { data, updateData } = useOrdersHistory();
  const reset = useRefetchBalances();
  return useMutation({
    mutationFn: async (order: { txHash: string; orderId?: number }) => {
      if (!account) return;
      const orders = await twap.orders.waitForCreatedOrder({ orderId: order.orderId, account, currentOrdersLength: data?.length });
      updateData(orders);
      updateState({
        swapStatus: SwapStatus.SUCCESS,
        createOrderSuccess: true,
      });
      reset();
    },
  });
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
  const { state, updateState, twap } = useWidgetContext();

  const { swapStatus, swapStep, createOrderTxHash, approveTxHash, wrapTxHash, wrapSuccess, swapData } = state;

  const { data: haveAllowance, refetch: refetchAllowance } = query.useAllowance();
  const shouldWrap = useShouldWrap();
  const { mutateAsync: updateOrders } = useUpdatedOrders();
  const wToken = useNetwork()?.wToken;

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
      await updateOrders(order);
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
    }
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
  const { priorityFeePerGas, maxFeePerGas } = query.useGasPrice();
  const { account, twap } = useWidgetContext();

  const twapContract = useTwapContract();
  const updateCanceledOrder = query.useUpdateOrderStatusToCanceled();
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
      console.log(`order canceled`);
    },
    {
      onSuccess: (_, orderId) => {
        logger(`order canceled`);
        twap.analytics.onCancelOrderSuccess();
        updateCanceledOrder(orderId);
      },
      onError: (error: Error) => {
        console.log(`cancel error order`, error);
        twap.analytics.onCreateOrderError(error);
      },
    }
  );
};
