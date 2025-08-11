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
  const { account, walletClient, publicClient, chainId, dstToken, twapSDK } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);
  const callbacks = useCallbacks();
  const permitData = usePermitData();

  return useMutation(async () => {
    try {
      if (!account) throw new Error("account is not defined");
      if (!walletClient) throw new Error("walletClient is not defined");
      if (!publicClient) throw new Error("publicClient is not defined");
      if (!chainId) throw new Error("chainId is not defined");
      if (!dstToken) throw new Error("dstToken is not defined");
      if (!permitData) throw new Error("permit is not defined");

      // callbacks.onRequest(orderSubmissionArgs.params);

      console.log({ permitData });

      logData(permitData);
      const { domain, types, primaryType, message } = permitData;

      const signature = await walletClient?.signTypedData({
        account: account as `0x${string}`,
        types: types,
        primaryType: primaryType,
        message: message as Record<string, any>,
        domain: domain,
      });
      console.log({ signature });

      const { r, s, v } = parseSignature(signature);

      const signatureObj = {
        v: numberToHex(v!, { size: 1 }),
        r: padHex(r, { size: 32 }),
        s: padHex(s, { size: 32 }),
      };
      const sig = concatHex([padHex(r!, { size: 32 }), padHex(s!, { size: 32 }), numberToHex(v! === 0n || v! === 1n ? v! + 27n : v!, { size: 1 })]);

      const signer = await recoverTypedDataAddress({
        domain: domain,
        types: types,
        primaryType: primaryType,
        message: message as Record<string, any>,
        signature: sig,
      });

      console.log({ signer });

      const response = await twapSDK.submitOrder(permitData, signatureObj);
      console.log({ response });
      updateState({ createOrderTxHash: "" });

      // const receipt = await getTransactionReceipt("");
      // if (!receipt) {
      //   throw new Error("failed to get transaction receipt");
      // }

      // if (receipt.status === "reverted") {
      //   throw new Error("failed to create order");
      // }
      // const orderId = getOrderIdFromCreateOrderEvent(receipt);

      // await callbacks.onSuccess({} as TransactionReceipt, orderSubmissionArgs.params, srcToken, 100);

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
