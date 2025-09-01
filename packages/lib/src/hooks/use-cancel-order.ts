import { SwapStatus } from "@orbs-network/swap-ui";
import { analytics, REPERMIT_ADDRESS, RePermitAbi } from "@orbs-network/twap-sdk";
import { useMutation } from "@tanstack/react-query";
import { useTwapContext } from "../context";
import { isTxRejected } from "../utils";
import { useGetTransactionReceipt } from "./use-get-transaction-receipt";
import { useTwapStore } from "../useTwapStore";
import { OrderHistoryCallbacks } from "../types";

export const useCancelOrderMutation = () => {
  const { account, walletClient, publicClient, overrides } = useTwapContext();
  const getTransactionReceipt = useGetTransactionReceipt();
  const updateState = useTwapStore((s) => s.updateState);

  const mutation = useMutation(async ({ orderIds, callbacks }: { orderIds: string[]; callbacks?: OrderHistoryCallbacks }) => {
    try {
      if (!account || !walletClient || !publicClient) {
        throw new Error("missing required parameters");
      }

      updateState({
        cancelOrderStatus: SwapStatus.LOADING,
        cancelOrderTxHash: undefined,
        cancelOrderError: undefined,
        // cancelOrderId: order.id,
      });
      // analytics.onCancelOrderRequest(order.id);
      callbacks?.onCancelRequest?.(orderIds);
      let hash: `0x${string}` | undefined;
      if (overrides?.cancelOrder) {
        // hash = await transactions.cancelOrder({ contractAddress: order.twapAddress, abi: TwapAbi as Abi, functionName: "cancel", args: [order.id], orderId: order.id });
      } else {
        hash = await walletClient.writeContract({
          account: account as `0x${string}`,
          address: REPERMIT_ADDRESS as `0x${string}`,
          abi: RePermitAbi,
          functionName: "cancel",
          args: orderIds, // pass nonce, that is part of the order
          chain: walletClient.chain,
        });
      }
      updateState({ cancelOrderTxHash: hash });
      const receipt = await getTransactionReceipt(hash!);

      if (!receipt) {
        throw new Error("failed to get transaction receipt");
      }

      if (receipt.status === "reverted") {
        throw new Error("failed to cancel order");
      }

      // optimisticCancelOrder(order.id);
      updateState({ cancelOrderStatus: SwapStatus.SUCCESS });
      analytics.onCancelOrderSuccess(hash);
      callbacks?.onCancelSuccess?.(orderIds, receipt);

      return receipt;
    } catch (error) {
      console.log(`cancel error order`, error);
      callbacks?.onCancelFailed?.((error as Error).message);
      if (isTxRejected(error)) {
        updateState({ cancelOrderStatus: undefined });
      } else {
        updateState({ cancelOrderStatus: SwapStatus.FAILED });
        analytics.onCancelOrderError(error);
        callbacks?.onCancelFailed?.((error as Error).message);
      }
    }
  });

  return mutation;
};
