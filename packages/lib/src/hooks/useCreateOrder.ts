import { sendAndWaitForConfirmations, zero } from "@defi.org/web3-candies";
import { useMutation } from "@tanstack/react-query";
import { useWidgetContext } from "..";
import { logger } from "../utils";
import { useTwapContract } from "./useContracts";
import { useGasPrice } from "./useGasPrice";

export const useCreateOrder = () => {
  const { maxFeePerGas, priorityFeePerGas } = useGasPrice();
  const { account, updateState, twap, dstToken, callbacks } = useWidgetContext();
  const {
    values: { createOrderArgs },
  } = twap;
  const twapContract = useTwapContract();

  return useMutation(
    async () => {
      if (!dstToken) throw new Error("dstToken is not defined");
      if (!twapContract) throw new Error("twapContract is not defined");
      if (!account) throw new Error("account is not defined");

      twap.analytics.onCreateOrderRequest(createOrderArgs, account);

      const tx = await sendAndWaitForConfirmations(
        twapContract.methods.ask(createOrderArgs as any),
        {
          from: account,
          maxPriorityFeePerGas: priorityFeePerGas || zero,
          maxFeePerGas,
        },
        undefined,
        undefined,
        {
          onTxHash: (createOrderTxHash) => {
            updateState({ createOrderTxHash });
          },
        },
      );

      const orderId = Number(tx.events.OrderCreated.returnValues.id);
      const txHash = tx.transactionHash;
      twap.analytics.onCreateOrderSuccess(txHash, orderId);
      logger("order created:", "orderId:", orderId, "txHash:", txHash);
      return {
        orderId,
        txHash,
      };
    },
    {
      onError(error) {
        callbacks?.onCreateOrderFailed?.((error as any).message);
      },
    },
  );
};
