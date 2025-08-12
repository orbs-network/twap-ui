import { SwapStatus } from "@orbs-network/swap-ui";
import { analytics, Order, REPERMIT_ADDRESS, RePermitAbi, TwapAbi } from "@orbs-network/twap-sdk";
import { useMutation } from "@tanstack/react-query";
import { Abi } from "viem";
import { useTwapContext } from "../context";
import { isTxRejected } from "../utils";
import { useOptimisticCancelOrder } from "./order-hooks";
import { useGetTransactionReceipt } from "./use-get-transaction-receipt";
import { useTwapStore } from "../useTwapStore";
import { useMemo } from "react";

const useCancelOrderMutation = () => {
  const { account, callbacks, walletClient, publicClient, transactions } = useTwapContext();
  const getTransactionReceipt = useGetTransactionReceipt();
  const updateState = useTwapStore((s) => s.updateState);

  const optimisticCancelOrder = useOptimisticCancelOrder();
  const mutation = useMutation(async (order: Order) => {
    try {
      if (!account || !walletClient || !publicClient) {
        throw new Error("missing required parameters");
      }
      updateState({
        cancelOrderStatus: SwapStatus.LOADING,
        cancelOrderTxHash: undefined,
        cancelOrderError: undefined,
        cancelOrderId: order.id,
      });
      analytics.onCancelOrderRequest(order.id);
      callbacks?.cancelOrder?.onRequest?.(order.id);
      let hash: `0x${string}` | undefined;
      if (transactions?.cancelOrder) {
        hash = await transactions.cancelOrder({ contractAddress: order.twapAddress, abi: TwapAbi as Abi, functionName: "cancel", args: [order.id], orderId: order.id });
      } else {
        hash = await walletClient.writeContract({
          account: account as `0x${string}`,
          address: REPERMIT_ADDRESS as `0x${string}`,
          abi: RePermitAbi,
          functionName: "cancel",
          args: [order.id], // pass nonce, that is part of the order
          chain: walletClient.chain,
        });
      }
      updateState({ cancelOrderTxHash: hash });
      const receipt = await getTransactionReceipt(hash);

      if (!receipt) {
        throw new Error("failed to get transaction receipt");
      }

      if (receipt.status === "reverted") {
        throw new Error("failed to cancel order");
      }

      optimisticCancelOrder(order.id);
      updateState({ cancelOrderStatus: SwapStatus.SUCCESS });
      analytics.onCancelOrderSuccess(hash);
      callbacks?.cancelOrder?.onSuccess?.(receipt, order.id);

      return hash;
    } catch (error) {
      console.log(`cancel error order`, error);
      if (isTxRejected(error)) {
        updateState({ cancelOrderStatus: undefined });
      } else {
        updateState({ cancelOrderStatus: SwapStatus.FAILED });
        analytics.onCancelOrderError(error);
        callbacks?.cancelOrder?.onFailed?.((error as Error).message);
      }
    }
  });

  return mutation;
};

export const useCancelOrder = () => {
  const { state } = useTwapStore();
  const { mutateAsync: cancelOrder } = useCancelOrderMutation();

  return useMemo((): {
    status?: SwapStatus;
    txHash?: string;
    error?: string;
    orderId?: number;
    callback: (order: Order) => Promise<string>;
  } => {
    return {
      callback: (order: Order) => cancelOrder(order).then((hash) => hash || ""),
      status: state.cancelOrderStatus,
      txHash: state.cancelOrderTxHash,
      error: state.cancelOrderError,
      orderId: state.cancelOrderId,
    };
  }, [state, cancelOrder]);
};
