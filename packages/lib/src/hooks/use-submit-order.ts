import { SwapStatus } from "@orbs-network/swap-ui";
import { isNativeAddress } from "@orbs-network/twap-sdk";
import { useRef } from "react";
import { Steps } from "../types";
import { getTotalSteps, isTxRejected } from "../utils";
import { useApproveToken } from "./use-approve-token";
import { useWrapToken } from "./use-wrap";
import { useSrcAmount } from "./use-src-amount";
import { useEnsureAllowanceCallback } from "./use-allowance";
import BN from "bignumber.js";
import { useMutation } from "@tanstack/react-query";
import { TransactionReceipt } from "viem";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { useCallback } from "react";
import { useOptimisticAddOrder, useOrders } from "./order-hooks";
import { Token } from "../types";
import { useDstAmount } from "./use-dst-amount";
import { analytics, EIP712_TYPES, REPERMIT_PRIMARY_TYPE } from "@orbs-network/twap-sdk";
import { useBuildRePermitOrderDataCallback } from "./use-build-repermit-order-data-callback.ts";

const useCallbacks = () => {
  const { account, callbacks, srcToken, dstToken } = useTwapContext();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const optimisticAddOrder = useOptimisticAddOrder();
  const destTokenAmountUI = useDstAmount().amountUI;
  const { refetch: refetchOrders } = useOrders();
  const onRequest = useCallback((params: string[]) => analytics.onCreateOrderRequest(params, account), [account]);
  const onSuccess = useCallback(
    async (receipt: TransactionReceipt, params: string[], srcToken: Token, orderId?: number) => {
      analytics.onCreateOrderSuccess(receipt.transactionHash, orderId);
      callbacks?.createOrder?.onSuccess?.({
        srcToken: srcToken!,
        dstToken: dstToken!,
        orderId,
        srcAmount: typedSrcAmount || "0",
        dstAmount: destTokenAmountUI,
        receipt,
      });

      if (orderId === undefined || orderId === null) {
        return await refetchOrders();
      }

      optimisticAddOrder(orderId, receipt.transactionHash, params, srcToken, dstToken!);
    },
    [callbacks, srcToken, dstToken, typedSrcAmount, destTokenAmountUI, optimisticAddOrder, refetchOrders],
  );

  const onError = useCallback(
    (error: any) => {
      callbacks?.createOrder?.onFailed?.((error as any).message);
      analytics.onCreateOrderError(error);
    },
    [callbacks],
  );

  return {
    onRequest,
    onSuccess,
    onError,
  };
};

const useSignOrder = () => {
  const { account, walletClient, chainId } = useTwapContext();
  const buildRePermitOrderData = useBuildRePermitOrderDataCallback();

  return useMutation(async () => {
    if (!account || !walletClient || !chainId) {
      throw new Error("missing required parameters");
    }

    const { orderData, domain } = buildRePermitOrderData();

    console.log(`Using domain:`, domain);
    console.log(`Using types:`, EIP712_TYPES);
    console.log(`Order data to sign:`, JSON.stringify(orderData, null, 2));
    console.log(`Account address: ${account}`);

    const signature = await walletClient?.signTypedData({
      domain,
      types: EIP712_TYPES,
      primaryType: REPERMIT_PRIMARY_TYPE,
      message: orderData as Record<string, any>,
      account: account as `0x${string}`,
    });

    return {
      signature,
      orderData,
    };
  });
};

const useCreateOrder = () => {
  const { account, walletClient, chainId, dstToken } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);
  const callbacks = useCallbacks();
  const signOrder = useSignOrder();

  return useMutation(async () => {
    try {
      if (!account || !walletClient || !chainId || !dstToken) {
        throw new Error("missing required parameters");
      }

      const { signature, orderData } = await signOrder.mutateAsync();
      console.log({ signature, orderData });

      // const response = await submitOrder(orderData, signature || "");

      updateState({ createOrderTxHash: "" });

      return {
        orderId: 0,
        receipt: undefined,
      };
    } catch (error) {
      console.error(error);
      callbacks.onError(error);
      throw error;
    }
  });
};

export const useSubmitOrder = () => {
  const { srcToken, dstToken, chainId } = useTwapContext();
  const ensureAllowance = useEnsureAllowanceCallback();
  const updateState = useTwapStore((s) => s.updateState);
  const approve = useApproveToken().mutateAsync;
  const wrapToken = useWrapToken().mutateAsync;
  const createOrder = useCreateOrder().mutateAsync;
  const srcAmount = useSrcAmount().amountWei;
  const wrappedRef = useRef(false);

  return useMutation(async () => {
    try {
      if (!srcToken || !dstToken || !chainId) {
        throw new Error("missing required parameters");
      }

      const getHasAllowance = async () => {
        const allowance = await ensureAllowance();
        return BN(allowance).gte(srcAmount);
      };

      const shouldWrap = isNativeAddress(srcToken.address);

      updateState({ fetchingAllowance: true });
      const haveAllowance = await getHasAllowance();

      let stepIndex = 0;
      updateState({ swapStatus: SwapStatus.LOADING, totalSteps: getTotalSteps(shouldWrap, !haveAllowance), fetchingAllowance: false });

      if (shouldWrap) {
        updateState({ activeStep: Steps.WRAP });
        await wrapToken(srcAmount);
        stepIndex++;
        updateState({ currentStepIndex: stepIndex });
      }

      if (!haveAllowance) {
        updateState({ activeStep: Steps.APPROVE });
        await approve(srcToken);
        // make sure the allowance was set
        if (!(await getHasAllowance())) {
          throw new Error("Insufficient allowance to perform the swap. Please approve the token first.");
        }
        stepIndex++;
        updateState({ currentStepIndex: stepIndex });
      }
      updateState({ activeStep: Steps.CREATE });
      const order = await createOrder();

      updateState({ swapStatus: SwapStatus.SUCCESS });
      return order;
    } catch (error) {
      if (isTxRejected(error) && !wrappedRef.current) {
        updateState({ activeStep: undefined, swapStatus: undefined, currentStepIndex: undefined });
      } else {
        updateState({ swapStatus: SwapStatus.FAILED, swapError: (error as any).message });
      }
    }
  });
};
