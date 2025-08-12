import { useMutation } from "@tanstack/react-query";
import {
  Abi,
  concatHex,
  getTypesForEIP712Domain,
  numberToHex,
  padHex,
  parseSignature,
  recoverTypedDataAddress,
  serializeTypedData,
  TransactionReceipt,
  validateTypedData,
  verifyMessage,
  verifyTypedData,
} from "viem";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { getOrderIdFromCreateOrderEvent } from "../utils";
import { useGetTransactionReceipt } from "./use-get-transaction-receipt";
import { useCallback } from "react";
import { useOptimisticAddOrder, useOrders } from "./order-hooks";
import { Token } from "../types";
import { useDstAmount } from "./use-dst-amount";
import { _TypedDataEncoder } from "@ethersproject/hash";
import { analytics, EIP712_TYPES, REPERMIT_PRIMARY_TYPE, submitOrder } from "@orbs-network/twap-sdk";
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
    [callbacks, srcToken, dstToken, typedSrcAmount, destTokenAmountUI, optimisticAddOrder, refetchOrders]
  );

  const onError = useCallback(
    (error: any) => {
      callbacks?.createOrder?.onFailed?.((error as any).message);
      analytics.onCreateOrderError(error);
    },
    [callbacks]
  );

  return {
    onRequest,
    onSuccess,
    onError,
  };
};

const useSignOrder = () => {
  const { account, walletClient, chainId, dstToken } = useTwapContext();
  const buildRePermitOrderData = useBuildRePermitOrderDataCallback();

  return useMutation(async () => {
    if (!account || !walletClient || !chainId || !dstToken) {
      throw new Error("missing required parameters");
    }

    const { orderData, domain } = buildRePermitOrderData();

    console.log({ orderData, domain });

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

export const useCreateOrder = () => {
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

      const response = await submitOrder(orderData, signature || "");
      console.log({ response });
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

const logData = (parameters: any) => {
  const types = {
    EIP712Domain: getTypesForEIP712Domain({ domain: parameters.domain }),
    ...parameters.types,
  };

  // Need to do a runtime validation check on addresses, byte ranges, integer ranges, etc
  // as we can't statically check this with TypeScript.
  validateTypedData({ domain: parameters.domain, message: parameters.message, primaryType: parameters.primaryType, types });

  const typedData = serializeTypedData({ domain: parameters.domain, message: parameters.message, primaryType: parameters.primaryType, types });
  console.log({ serializeTypedData: typedData });
};
