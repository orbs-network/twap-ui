import { useMutation } from "@tanstack/react-query";
import { useWidgetContext } from "..";
import { waitForTransactionReceipt } from "viem/actions";
import { Hex, decodeEventLog } from "viem";
import { TwapAbi } from "@orbs-network/twap-sdk";

export function decodeOrderCreatedEvent(topics: Hex[], data: Hex) {
  const decodedLog = (decodeEventLog as any)({
    abi: TwapAbi,
    data,
    topics,
    eventName: "OrderCreated",
  });

  return decodedLog.args;
}

export const useCreateOrder = () => {
  const { account, updateState, twap, dstToken, callbacks, walletClient, publicClient } = useWidgetContext();
  const { createOrderTx } = twap;

  return useMutation(
    async () => {
      if (!dstToken) throw new Error("dstToken is not defined");
      if (!account) throw new Error("account is not defined");

      twap.analytics.onCreateOrderRequest(createOrderTx.params, account);

      const hash = await (walletClient as any).writeContract({
        account,
        address: createOrderTx.contract,
        abi: createOrderTx.abi,
        functionName: createOrderTx.method,
        args: [createOrderTx.params],
      });
      const receipt = await waitForTransactionReceipt(publicClient as any, {
        hash,
        confirmations: 5,
      });

      updateState({ createOrderTxHash: receipt.transactionHash });
      const decodedEvent = decodeOrderCreatedEvent(receipt.logs[0].topics, receipt.logs[0].data);

      const orderId = Number(decodedEvent.id);
      twap.analytics.onCreateOrderSuccess(hash, orderId);
      return {
        orderId,
        txHash: hash,
      };
    },
    {
      onError(error) {
        callbacks?.onCreateOrderFailed?.((error as any).message);
      },
    },
  );
};
