import { useMutation } from "@tanstack/react-query";
import { Abi, TransactionReceipt } from "viem";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { getOrderIdFromCreateOrderEvent } from "../utils";
import { useGetTransactionReceipt } from "./use-get-transaction-receipt";
import { useOrderSubmissionArgs } from "./use-order-submission-args";
import { useCallback } from "react";
import { useDestTokenAmount } from "./logic-hooks";
import { useOptimisticAddOrder, useOrders } from "./order-hooks";
import { Token } from "../types";

const useCallbacks = () => {
  const { twapSDK, account, callbacks, srcToken, dstToken } = useTwapContext();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const optimisticAddOrder = useOptimisticAddOrder();
  const destTokenAmountUI = useDestTokenAmount().amountUI;
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
  const { account, walletClient, publicClient, chainId, dstToken, transactions } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);
  const callbacks = useCallbacks();
  const orderSubmissionArgs = useOrderSubmissionArgs();
  const getTransactionReceipt = useGetTransactionReceipt();

  return useMutation(async (srcToken: Token) => {
    try {
      if (!account) throw new Error("account is not defined");
      if (!walletClient) throw new Error("walletClient is not defined");
      if (!publicClient) throw new Error("publicClient is not defined");
      if (!chainId) throw new Error("chainId is not defined");
      if (!dstToken) throw new Error("dstToken is not defined");

      if (!orderSubmissionArgs?.params) throw new Error("failed to get params for ask method");

      callbacks.onRequest(orderSubmissionArgs.params);
      let txHash: `0x${string}` | undefined;
      if (transactions?.createOrder) {
        txHash = await transactions.createOrder({
          contractAddress: orderSubmissionArgs.contractAddress,
          abi: orderSubmissionArgs.abi as Abi,
          functionName: orderSubmissionArgs.functionName,
          args: [orderSubmissionArgs.params],
        });
      } else {
        txHash = await walletClient.writeContract({
          account: account.toLowerCase() as `0x${string}`,
          address: orderSubmissionArgs.contractAddress.toLowerCase() as `0x${string}`,
          abi: orderSubmissionArgs.abi,
          functionName: orderSubmissionArgs.functionName,
          args: [orderSubmissionArgs.params],
          chain: walletClient.chain,
        });
      }
      updateState({ createOrderTxHash: txHash });

      const receipt = await getTransactionReceipt(txHash);
      if (!receipt) {
        throw new Error("failed to get transaction receipt");
      }

      if (receipt.status === "reverted") {
        throw new Error("failed to create order");
      }
      const orderId = getOrderIdFromCreateOrderEvent(receipt);

      await callbacks.onSuccess(receipt, orderSubmissionArgs.params, srcToken, orderId);

      return {
        orderId,
        receipt,
      };
    } catch (error) {
      console.error(error);
      callbacks.onError(error);
      throw error;
    }
  });
};
