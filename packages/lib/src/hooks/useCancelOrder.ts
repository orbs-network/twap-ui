import { TwapAbi } from "@orbs-network/twap-sdk";
import { useMutation } from "@tanstack/react-query";
import { useWidgetContext } from "..";
import { logger } from "../utils";
import { useOrderHistoryManager } from "./useOrderHistoryManager";
import { waitForTransactionReceipt } from "viem/actions";

export const useCancelOrder = () => {
  const { account, twap, config, callbacks, walletClient, publicClient } = useWidgetContext();

  const { onOrderCancelled } = useOrderHistoryManager();
  return useMutation(
    async (orderId: number) => {
      if (!account) {
        throw new Error("account not defined");
      }

      logger(`canceling order...`, orderId);

      twap.analytics.onCancelOrderRequest(orderId);
      callbacks?.cancelOrder.onRequest?.(orderId);
      const hash = await (walletClient as any).writeContract({
        account,
        address: config.twapAddress,
        abi: TwapAbi,
        functionName: "cancel",
        args: [orderId],
      });
      await waitForTransactionReceipt(publicClient as any, {
        hash,
        confirmations: 5,
      });

      onOrderCancelled(orderId);
      console.log(`order canceled`);
      callbacks?.cancelOrder.onSuccess?.({ orderId, txHash: hash });
    },
    {
      onSuccess: () => {
        logger(`order canceled`);
        twap.analytics.onCancelOrderSuccess();
      },
      onError: (error: Error) => {
        console.log(`cancel error order`, error);
        twap.analytics.onCreateOrderError(error);
        callbacks?.cancelOrder.onFailed?.(error.message);
      },
    },
  );
};
