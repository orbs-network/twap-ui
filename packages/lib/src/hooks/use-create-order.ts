import { useMutation } from "@tanstack/react-query";
import { Abi, TransactionReceipt } from "viem";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { getOrderIdFromCreateOrderEvent } from "../utils";
import { useGetTransactionReceipt } from "./use-get-transaction-receipt";
import { useOrderSubmissionArgs } from "./use-order-submission-args";
import { useCallback } from "react";
import { useOptimisticAddOrder, useOrders } from "./order-hooks";
import { Token } from "../types";
import { useDstAmount } from "./use-dst-amount";
import { usePermitData } from "./use-permit-data";
import { _TypedDataEncoder } from "@ethersproject/hash";

const useCallbacks = () => {
  const { twapSDK, account, callbacks, srcToken, dstToken } = useTwapContext();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const optimisticAddOrder = useOptimisticAddOrder();
  const destTokenAmountUI = useDstAmount().amountUI;
  const { refetch: refetchOrders } = useOrders();
  const onRequest = useCallback((params: string[]) => twapSDK.analytics.onCreateOrderRequest(params, account), [twapSDK, account]);
  const onSuccess = useCallback(
    async (receipt: TransactionReceipt, params: string[], srcToken: Token, orderId?: number) => {
      twapSDK.analytics.onCreateOrderSuccess(receipt.transactionHash, orderId);
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
    [callbacks, srcToken, dstToken, typedSrcAmount, destTokenAmountUI, twapSDK, optimisticAddOrder, refetchOrders],
  );

  const onError = useCallback(
    (error: any) => {
      callbacks?.createOrder?.onFailed?.((error as any).message);
      twapSDK.analytics.onCreateOrderError(error);
    },
    [callbacks, twapSDK],
  );

  return {
    onRequest,
    onSuccess,
    onError,
  };
};

export const useCreateOrder = () => {
  const { account, walletClient, publicClient, chainId, dstToken } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);
  const callbacks = useCallbacks();
  const orderSubmissionArgs = useOrderSubmissionArgs();
  const getTransactionReceipt = useGetTransactionReceipt();
  const permitData = usePermitData();

  return useMutation(async (srcToken: Token) => {
    try {
      if (!account) throw new Error("account is not defined");
      if (!walletClient) throw new Error("walletClient is not defined");
      if (!publicClient) throw new Error("publicClient is not defined");
      if (!chainId) throw new Error("chainId is not defined");
      if (!dstToken) throw new Error("dstToken is not defined");
      if (!permitData) throw new Error("permit is not defined");
      if (!orderSubmissionArgs?.params) throw new Error("failed to get params for ask method");

      callbacks.onRequest(orderSubmissionArgs.params);
      const typedDataMessage = _TypedDataEncoder.getPayload(permitData.domain, permitData.types, permitData.message);

      const signature = await walletClient?.signTypedData({
        account: account as `0x${string}`,
        types: typedDataMessage.types,
        primaryType: typedDataMessage.primaryType,
        message: typedDataMessage.message,
        domain: typedDataMessage.domain,
      });

      updateState({ createOrderTxHash: "" });

      // const receipt = await getTransactionReceipt("");
      // if (!receipt) {
      //   throw new Error("failed to get transaction receipt");
      // }

      // if (receipt.status === "reverted") {
      //   throw new Error("failed to create order");
      // }
      // const orderId = getOrderIdFromCreateOrderEvent(receipt);

      await callbacks.onSuccess({} as TransactionReceipt, orderSubmissionArgs.params, srcToken, 100);

      return {
        orderId: 100,
        receipt: undefined,
      };
    } catch (error) {
      console.error(error);
      callbacks.onError(error);
      throw error;
    }
  });
};
