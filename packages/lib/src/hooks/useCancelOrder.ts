import { sendAndWaitForConfirmations } from "@defi.org/web3-candies";
import { useMutation } from "@tanstack/react-query";
import { useWidgetContext } from "..";
import { logger } from "../utils";
import { useTwapContract } from "./useContracts";
import { useGasPrice } from "./useGasPrice";
import { useOrderHistoryManager } from "./useOrderHistoryManager";

export const useCancelOrder = () => {
  const { priorityFeePerGas, maxFeePerGas } = useGasPrice();
  const { account, twap, callbacks } = useWidgetContext();

  const twapContract = useTwapContract();
  const { waitForOrderCancellation } = useOrderHistoryManager();
  return useMutation(
    async (orderId: number) => {
      if (!twapContract) {
        throw new Error("twap contract not defined");
      }

      if (!account) {
        throw new Error("account not defined");
      }

      logger(`canceling order...`, orderId);

      twap.analytics.onCancelOrderRequest(orderId);
      let txHash = "";
      await sendAndWaitForConfirmations(
        twapContract.methods.cancel(orderId),
        {
          from: account,
          maxPriorityFeePerGas: priorityFeePerGas,
          maxFeePerGas,
        },
        undefined,
        undefined,
        {
          onTxHash: (value) => {
            txHash = value;
          },
        },
      );
      await waitForOrderCancellation(orderId);
      console.log(`order canceled`);
      callbacks?.onCancelOrderSuccess?.({ orderId, txHash });
    },
    {
      onSuccess: () => {
        logger(`order canceled`);
        twap.analytics.onCancelOrderSuccess();
      },
      onError: (error: Error) => {
        console.log(`cancel error order`, error);
        twap.analytics.onCreateOrderError(error);
        callbacks?.onCancelOrderFailed?.(error.message);
      },
    },
  );
};
