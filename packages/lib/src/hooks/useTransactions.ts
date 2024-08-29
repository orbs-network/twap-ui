import { sendAndWaitForConfirmations, web3, erc20, iwethabi, maxUint256, isNativeAddress } from "@defi.org/web3-candies";
import { useMutation } from "@tanstack/react-query";
import { useTwapContext } from "../context/context";
import { useGetHasAllowance, useNetwork, useResetAfterSwap, useTwapContract } from "./hooks";
import { query, useGasPrice, useOrdersHistory } from "./query";
import BN from "bignumber.js";
import { isTxRejected, logger } from "../utils";
import { useCallback } from "react";
import { analytics } from "../analytics";
import { useSwitchNativeToWrapped } from "../context/actions";
import { useDeadline, useDstMinAmountOut, useFillDelay, useShouldOnlyWrap, useShouldWrap, useSrcAmount, useSrcChunkAmount, useSwapData } from "./lib";
import { approveToken, wrapToken, createOrder, waitForUpdatedOrders } from "@orbs-network/twap-sdk";

export const useCreateOrder = () => {
  const { account, dstToken, srcToken, config, updateState, web3 } = useTwapContext();
  const dstMinAmountOut = useDstMinAmountOut().amount;
  const srcChunkAmount = useSrcChunkAmount().amount;
  const deadline = useDeadline().millis;
  const fillDelayMillisUi = useFillDelay().millis;
  const srcAmount = useSrcAmount().amount;
  const wToken = useNetwork()?.wToken;

  return useMutation(
    async () => {
      const srcTokenAddress = isNativeAddress(srcToken?.address || "") ? wToken?.address : srcToken?.address;

      if (!srcTokenAddress || !dstToken || !web3 || !account) {
        throw new Error("srcToken, dstToken, web3 or account is not defined");
      }
      const order = await createOrder({
        account,
        dstTokenMinAmount: dstMinAmountOut,
        srcChunkAmount,
        deadlineMillis: deadline,
        fillDelayMillis: fillDelayMillisUi,
        srcAmount,
        srcTokenAddress,
        dstTokenAddress: dstToken.address,
        config,
        onTxHash: (createOrdertxHash: string) => updateState({ createOrdertxHash }),
        provider: web3.givenProvider,
      });
      return order;
    },
    {
      onError: (error) => {
        logger("order create failed:", error);
        analytics.onTxError(error, "create");
      },
    },
  );
};

export const useWrapToken = () => {
  const srcAmount = useSrcAmount().amount;
  const { config, account, updateState, web3 } = useTwapContext();
  const network = useNetwork();
  const wrapOnly = useShouldOnlyWrap();

  return useMutation(
    async () => {
      if (!account || !web3) {
        throw new Error("account is not defined");
      }

      const txHash = await wrapToken({
        config,
        provider: web3.givenProvider,
        srcAmount,
        account,
      });
      analytics.onWrapSuccess(txHash);
      return txHash;
    },
    {
      onError: (error) => {
        logger("token wrap failed:", error);
        analytics.onTxError(error, wrapOnly ? "wrap-only" : "wrap");
      },
    },
  );
};

export const useWrapOnly = () => {
  const { mutateAsync } = useWrapToken();
  const onSuccess = useResetAfterSwap();

  return useMutation(async () => {
    analytics.updateAction("wrap-only");
    await mutateAsync();
    await onSuccess();
  });
};

export const useUnwrapToken = () => {
  const { account, updateState } = useTwapContext();
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

      analytics.updateAction("unwrap");

      await sendAndWaitForConfirmations(
        erc20<any>(network.wToken.symbol, network.wToken.address, network.wToken.decimals, iwethabi).methods.withdraw(BN(srcAmount).toFixed(0)),
        { from: account, maxPriorityFeePerGas: priorityFeePerGas, maxFeePerGas },
        undefined,
        undefined,
        {
          onTxHash: (hash) => {
            txHash = hash;
            updateState({ unwrapTxHash: hash });
          },
        },
      );
      analytics.onUnwrapSuccess(txHash);
      await onSuccess();
    },
    {
      onError: (error) => {
        analytics.onTxError(error, "unwrap");
      },
    },
  );
};

export const useApproveToken = () => {
  const { config, account, isExactAppoval, web3, srcToken } = useTwapContext();
  const srcAmount = useSrcAmount().amount;
  const network = useNetwork();

  const approvalAmount = isExactAppoval ? srcAmount : maxUint256;

  return useMutation(
    async () => {
      if (!account) {
        throw new Error("account is not defined");
      }

      const srcTokenAddress = isNativeAddress(srcToken?.address || "") ? network?.wToken?.address : srcToken?.address;
      if (!srcTokenAddress || !web3) {
        throw new Error("srcTokenAddress is not defined");
      }
      logger("approving token...");
      analytics.updateAction("approve");

      const txHash = await approveToken({
        config,
        account,
        approvalAmount,
        srcTokenAddress,
        provider: web3?.givenProvider,
      });
      logger("token approve success:", txHash);
      analytics.onApproveSuccess(txHash);
    },
    {
      onError: (error) => {
        logger("token approve failed:", error);
        analytics.onTxError(error, "approve");
      },
    },
  );
};

const useSubmitAnalytics = () => {
  const swapData = useSwapData();

  return useCallback(() => {
    analytics.onSubmitOrder(swapData);
  }, [swapData]);
};

export const useSubmitOrderFlow = () => {
  const { minNativeTokenBalance, updateState, state, srcToken, config, account } = useTwapContext();
  const { swapState, swapStep, createOrdertxHash, approveTxHash, wrapTxHash, wrapSuccess } = state;
  const { data: haveAllowance } = query.useAllowance();
  const { ensureData: ensureNativeBalance } = query.useMinNativeTokenBalance(minNativeTokenBalance);
  const shouldWrap = useShouldWrap();
  const network = useNetwork();
  const wToken = network?.wToken;
  const nativeSymbol = network?.native.symbol;
  const { refetch: refetchAllowance } = query.useAllowance();
  const { updateData: updateOrders } = useOrdersHistory();
  const submitAnalytics = useSubmitAnalytics();
  const nativeToWrapped = useSwitchNativeToWrapped();
  const approve = useApproveToken().mutateAsync;
  const wrapToken = useWrapToken().mutateAsync;
  const createOrder = useCreateOrder().mutateAsync;
  const getHasAllowance = useGetHasAllowance();
  const swapData = useSwapData();
  const { srcAmount } = swapData;

  const mutate = useMutation(
    async () => {
      if (!srcToken) {
        throw new Error("Please select a token to swap");
      }

      if (!wToken) {
        throw new Error("WToken not defined");
      }
      logger(`Create order request`);
      updateState({ swapState: "loading", swapData });
      submitAnalytics();

      if (minNativeTokenBalance) {
        const hasMinNativeTokenBalance = await ensureNativeBalance();
        if (!hasMinNativeTokenBalance.data) {
          throw new Error(`Insufficient ${nativeSymbol} balance, you need at least ${minNativeTokenBalance}${nativeSymbol} to cover the transaction fees.`);
        }
      }

      let token = srcToken;

      if (shouldWrap) {
        updateState({ swapStep: "wrap" });
        await wrapToken();
        updateState({ wrapSuccess: true });
        token = wToken;
      }

      if (!haveAllowance) {
        updateState({ swapStep: "approve" });
        await approve();
        const res = await getHasAllowance(token, srcAmount.amount);
        if (!res) {
          throw new Error("Insufficient allowance to perform the swap. Please approve the token first.");
        }
        updateState({ approveSuccess: true });
      }

      updateState({ swapStep: "createOrder" });
      const order = await createOrder();
      const res = await waitForUpdatedOrders(config, order.id, account!);
      updateOrders(res?.orders);
    },

    {
      onSuccess: () => {
        updateState({ swapState: "success", createOrderSuccess: true, selectedOrdersTab: 0, srcAmountUi: "" });
      },
      onError(error) {
        if (wrapSuccess) {
          nativeToWrapped();
        }
        if (isTxRejected(error)) {
          updateState({ swapState: undefined, swapData: undefined });
        } else {
          updateState({ swapState: "failed" });
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
    swapState,
    error,
    swapStep,
    createOrdertxHash,
    approveTxHash,
    wrapTxHash,
  };
};

export const useCancelOrder = () => {
  const { priorityFeePerGas, maxFeePerGas } = useGasPrice();
  const { account } = useTwapContext();
  const twapContract = useTwapContract();
  const { refetch } = useOrdersHistory();
  return useMutation(
    async (orderId: number) => {
      if (!twapContract) {
        throw new Error("twap contract not defined");
      }

      if (!account) {
        throw new Error("account not defined");
      }

      logger(`canceling order...`, orderId);

      analytics.onCancelOrder(orderId);
      await sendAndWaitForConfirmations(twapContract.methods.cancel(orderId), {
        from: account,
        maxPriorityFeePerGas: priorityFeePerGas,
        maxFeePerGas,
      });
      console.log(`order canceled`);
    },
    {
      onSuccess: () => {
        logger(`order canceled`);
        analytics.onCancelOrderSuccess();
        refetch();
      },
      onError: (error: Error) => {
        console.log(`cancel error order`, error);
        analytics.onTxError(error, "cancel");
      },
    },
  );
};
