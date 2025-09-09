import { SwapStatus } from "@orbs-network/swap-ui";
import { Order, TwapAbi } from "@orbs-network/twap-sdk";
import { useMutation } from "@tanstack/react-query";
import { Abi } from "viem";
import { useTwapContext } from "../context";
import { isTxRejected } from "../utils";
import { useOptimisticCancelOrder } from "./order-hooks";
import { useGetTransactionReceipt } from "./use-get-transaction-receipt";
import { useCancelOrderState, useTwapStore } from "../useTwapStore";
import { useMemo } from "react";

const useCancelOrderMutation = () => {
  const { account, callbacks, walletClient, publicClient, twapSDK, transactions } = useTwapContext();
  const getTransactionReceipt = useGetTransactionReceipt();
  const updateCancelOrderState = useTwapStore((s) => s.updateCancelOrderState);

  const optimisticCancelOrder = useOptimisticCancelOrder();
  const mutation = useMutation(async (order: Order) => {
    try {
      if (!account) throw new Error("account not defined");
      if (!walletClient) throw new Error("walletClient not defined");
      if (!publicClient) throw new Error("publicClient not defined");
      updateCancelOrderState(order.id, {
        status: SwapStatus.LOADING,
        txHash: undefined,
        error: undefined,
        id: order.id,
      });
      twapSDK.analytics.onCancelOrderRequest(order.id);
      callbacks?.cancelOrder?.onRequest?.(order.id);
      let hash: `0x${string}` | undefined;
      if (transactions?.cancelOrder) {
        hash = await transactions.cancelOrder({ contractAddress: order.twapAddress, abi: TwapAbi as Abi, functionName: "cancel", args: [order.id], orderId: order.id });
      } else {
        hash = await walletClient.writeContract({
          account: account as `0x${string}`,
          address: order.twapAddress as `0x${string}`,
          abi: TwapAbi,
          functionName: "cancel",
          args: [order.id],
          chain: walletClient.chain,
        });
      }
      updateCancelOrderState(order.id, { txHash: hash });
      const receipt = await getTransactionReceipt(hash);

      if (!receipt) {
        throw new Error("failed to get transaction receipt");
      }

      if (receipt.status === "reverted") {
        throw new Error("failed to cancel order");
      }

      callbacks?.cancelOrder?.onSuccess?.(receipt, order.id);
      optimisticCancelOrder(order.id);
      twapSDK.analytics.onCancelOrderSuccess();
      updateCancelOrderState(order.id, { status: SwapStatus.SUCCESS });
      return hash;
    } catch (error) {
      console.log(`cancel error order`, error);
      if (isTxRejected(error)) {
        updateCancelOrderState(order.id, { status: undefined });
      } else {
        updateCancelOrderState(order.id, { status: SwapStatus.FAILED });
        twapSDK.analytics.onCancelOrderError(error);
        callbacks?.cancelOrder?.onFailed?.((error as Error).message);
      }
    }
  });

  return mutation;
};

export const useCancelOrder = (order?: Order) => {
  const { mutateAsync: cancelOrder } = useCancelOrderMutation();
  const { state } = useCancelOrderState(order?.id);

  return useMemo(() => {
    return {
      callback: () => {
        if (!order) throw new Error("order is not defined");
        return cancelOrder(order);
      },
      status: state?.status,
      txHash: state?.txHash,
      error: state?.error,
      orderId: state?.id,
    };
  }, [state, cancelOrder, order]);
};
