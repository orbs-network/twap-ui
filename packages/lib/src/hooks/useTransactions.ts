import { zero, sendAndWaitForConfirmations, TokenData, erc20, iwethabi, maxUint256, hasWeb3Instance, setWeb3Instance, account } from "@defi.org/web3-candies";
import { useMutation } from "@tanstack/react-query";
import { useTwapContext } from "../context/context";
import { useGetHasAllowance, useNetwork, useResetAfterSwap, useTwapContract } from "./hooks";
import { query, useGasPrice, useOrdersHistory } from "./query";
import BN from "bignumber.js";
import { isTxRejected, logger } from "../utils";
import { useShouldWrap, useSrcAmount, useSwapData } from "./lib";
import { useTwapContext as useTwapContextUI } from "@orbs-network/twap-ui-sdk";
import { SwapStatus } from "@orbs-network/swap-ui";
import { SwapSteps } from "../types";

export const useCreateOrder = () => {
  const { maxFeePerGas, priorityFeePerGas } = useGasPrice();
  const {
    parsedDstToken,
    derivedValues: { createOrderArgs },
    sdk,
  } = useTwapContextUI();
  const { account, updateState } = useTwapContext();
  const twapContract = useTwapContract();

  return useMutation(async (srcToken: TokenData) => {
    if (!parsedDstToken) {
      throw new Error("dstToken is not defined");
    }

    if (!twapContract) {
      throw new Error("twapContract is not defined");
    }

    if (!account) {
      throw new Error("account is not defined");
    }

    sdk.analytics.onCreateOrderRequest(createOrderArgs, account);

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
    sdk.analytics.onCreateOrderSuccess(txHash, orderId);
    logger("order created:", "orderId:", orderId, "txHash:", txHash);
    return {
      orderId,
      txHash,
    };
  });
};

export const useWrapToken = () => {
  const srcAmount = useSrcAmount().amount;
  const { account } = useTwapContext();
  const { sdk } = useTwapContextUI();
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
      },
    );
    logger("token wrap success:", txHash);
    sdk.analytics.onWrapSuccess(txHash);
  });
};

export const useWrapOnly = () => {
  const { mutateAsync } = useWrapToken();
  const onSuccess = useResetAfterSwap();

  return useMutation(async () => {
    await mutateAsync();
    await onSuccess();
  });
};

export const useUnwrapToken = () => {
  const { account } = useTwapContext();
  const { priorityFeePerGas, maxFeePerGas } = useGasPrice();
  const onSuccess = useResetAfterSwap();
  const srcAmount = useSrcAmount().amount;
  const network = useNetwork();

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
  const { account, isExactAppoval, web3 } = useTwapContext();
  const { sdk } = useTwapContextUI();
  const srcAmount = useSrcAmount().amount;

  const { priorityFeePerGas, maxFeePerGas } = useGasPrice();

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
      contract.methods.approve(sdk.config.twapAddress, BN(approvalAmount).decimalPlaces(0).toFixed(0)),
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
    sdk.analytics.onApproveSuccess(txHash);
  });
};
const useUpdatedOrders = () => {
  const { account, updateState } = useTwapContext();
  const { sdk } = useTwapContextUI();

  const { refetch, updateData } = useOrdersHistory();
  const reset = useResetAfterSwap();
  return useMutation({
    mutationFn: async (order: { txHash: string; orderId?: number }) => {
      if (!order.orderId || !account) {
        await refetch();
      } else {
        const updatedOrders = await sdk.waitForOrdersUpdate(order.orderId, account);
        updateData(updatedOrders);
      }
      updateState({
        swapStatus: SwapStatus.SUCCESS,
        createOrderSuccess: true,
      });
      reset();
    },
  });
};


const getSteps = (shouldWrap?: boolean, shouldApprove?: boolean) => {

  let steps: number[] = []

  if(shouldWrap) {
    steps.push(SwapSteps.WRAP)
  }
  if(shouldApprove) {
    steps.push(SwapSteps.APPROVE)
  }

  steps.push(SwapSteps.CREATE)
  return steps
}

export const useSubmitOrderFlow = () => {
  const { minNativeTokenBalance, state, updateState } = useTwapContext();

  const { swapStatus, swapStep, createOrderTxHash, approveTxHash, wrapTxHash, wrapSuccess } = state;
  const { data: haveAllowance } = query.useAllowance();
  const { ensureData: ensureNativeBalance } = query.useMinNativeTokenBalance(minNativeTokenBalance);
  const shouldWrap = useShouldWrap();
  const { mutateAsync: updateOrders } = useUpdatedOrders();
  const network = useNetwork();
  const wToken = network?.wToken;
  const nativeSymbol = network?.native.symbol;
  const { refetch: refetchAllowance } = query.useAllowance();
  const approve = useApproveToken().mutateAsync;
  const wrapToken = useWrapToken().mutateAsync;
  const createOrder = useCreateOrder().mutateAsync;
  const getHasAllowance = useGetHasAllowance();
  const swapData = useSwapData();
  const { srcAmount, srcToken, dstToken } = swapData;

  const mutate = useMutation(
    async () => {
      if (!srcToken || !dstToken) {
        throw new Error("Please select a token to swap");
      }

      if (!wToken) {
        throw new Error("WToken not defined");
      }

      const steps = getSteps(shouldWrap, !haveAllowance);
      logger(`Create order request`);
      updateState({ swapStatus: SwapStatus.LOADING, swapSteps: steps });

      if (minNativeTokenBalance) {
        const hasMinNativeTokenBalance = await ensureNativeBalance();
        if (!hasMinNativeTokenBalance.data) {
          throw new Error(`Insufficient ${nativeSymbol} balance, you need at least ${minNativeTokenBalance}${nativeSymbol} to cover the transaction fees.`);
        }
      }

      let token = srcToken;

      if (shouldWrap) {
        updateState({ swapStep: SwapSteps.WRAP });
        await wrapToken();
        updateState({ wrapSuccess: true });
        token = wToken;
      }

      if (!haveAllowance) {
        updateState({ swapStep: SwapSteps.APPROVE});
        await approve(token);
        const res = await getHasAllowance(token, srcAmount.amount);
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
  const { priorityFeePerGas, maxFeePerGas } = query.useGasPrice();
  const { account } = useTwapContext();
  const { sdk } = useTwapContextUI();

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

      sdk.analytics.onCancelOrderRequest(orderId);
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
        sdk.analytics.onCancelOrderSuccess();
        updateCanceledOrder(orderId);
      },
      onError: (error: Error) => {
        console.log(`cancel error order`, error);
        sdk.analytics.onCreateOrderError(error);
      },
    },
  );
};
