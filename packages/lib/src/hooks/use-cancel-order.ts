import { SwapStatus } from "@orbs-network/swap-ui";
import { analytics, Order, REPERMIT_ABI, TWAP_ABI } from "@orbs-network/twap-sdk";
import { useMutation } from "@tanstack/react-query";
import { useTwapContext } from "../context/twap-context";
import { isTxRejected } from "../utils";
import { useGetTransactionReceipt } from "./use-get-transaction-receipt";
import { useTwapStore } from "../useTwapStore";
import { useOptimisticCancelOrder } from "./order-hooks";

export const useCancelOrderMutation = () => {
  const { account, walletClient, publicClient, config, callbacks } = useTwapContext();
  const getTransactionReceipt = useGetTransactionReceipt();
  const updateState = useTwapStore((s) => s.updateState);
  const optimisticCancelOrder = useOptimisticCancelOrder();

  const cancelOrdersV1 = async (orders: Order[]) => {
    const hashes = await Promise.all(
      orders.map((order) =>
        walletClient!.writeContract({
          account: account as `0x${string}`,
          address: order.twapAddress as `0x${string}`,
          abi: TWAP_ABI,
          functionName: "cancel",
          args: [order.id],
          chain: walletClient!.chain,
        }),
      ),
    );

    const receipts = await Promise.all(hashes.map((hash) => getTransactionReceipt(hash)));

    return receipts.filter((receipt) => receipt !== undefined);
  };

  const cancelOrdersV2 = async (orders: Order[]) => {
    const hash = await walletClient!.writeContract({
      account: account as `0x${string}`,
      address: config!.repermit,
      abi: REPERMIT_ABI,
      functionName: "cancel",
      args: [orders.map((order) => order.hash)],
      chain: walletClient!.chain,
    });

    const receipt = await getTransactionReceipt(hash!);
    if (!receipt) throw new Error("failed to get transaction receipt");
    if (receipt.status === "reverted") throw new Error("failed to cancel order");

    analytics.onCancelOrderSuccess(hash);
    callbacks?.onCancelOrderSuccess?.(orders, receipt);

    return receipt;
  };

  return useMutation(async ({ orders }: { orders: Order[] }) => {
    if (!account || !walletClient || !publicClient || !config) {
      throw new Error("missing required parameters");
    }

    try {
      callbacks?.onCancelOrderRequest?.(orders);

      updateState({
        cancelOrderStatus: SwapStatus.LOADING,
        cancelOrderTxHash: undefined,
        cancelOrderError: undefined,
      });

      const ordersV1 = orders.filter((o) => o.version === 1);
      const ordersV2 = orders.filter((o) => o.version === 2);

      const [v1Results, v2Result] = await Promise.all([
        ordersV1.length ? cancelOrdersV1(ordersV1) : Promise.resolve([]),
        ordersV2.length ? cancelOrdersV2(ordersV2) : Promise.resolve(undefined),
      ]);
      updateState({ cancelOrderStatus: SwapStatus.SUCCESS, orderIdsToCancel: [] });
      optimisticCancelOrder(orders.map((o) => o.id));
      return [...v1Results, v2Result];
    } catch (error) {
      console.error("cancel order error", error);
      callbacks?.onCancelOrderFailed?.((error as Error).message);

      if (isTxRejected(error)) {
        updateState({ cancelOrderStatus: undefined });
      } else {
        updateState({ cancelOrderStatus: SwapStatus.FAILED });
        analytics.onCancelOrderError(error);
      }
    }
  });
};
