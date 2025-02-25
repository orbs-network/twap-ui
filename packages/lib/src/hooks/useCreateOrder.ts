import { useMutation } from "@tanstack/react-query";
import { useWidgetContext } from "..";
import { waitForTransactionReceipt } from "viem/actions";
import { Hex, decodeEventLog } from "viem";
import { amountUi, TwapAbi } from "@orbs-network/twap-sdk";

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
  const {
    account,
    updateState,
    twap,
    srcToken,
    dstToken,
    walletClient,
    publicClient,
    callbacks,
    state: { typedSrcAmount },
  } = useWidgetContext();
  const { submitOrderArgs } = twap;

  return useMutation(
    async () => {
      if (!dstToken) throw new Error("dstToken is not defined");
      if (!account) throw new Error("account is not defined");

      twap.analytics.onCreateOrderRequest(submitOrderArgs.params, account);

      const hash = await (walletClient as any).writeContract({
        account,
        address: submitOrderArgs.contract,
        abi: submitOrderArgs.abi,
        functionName: submitOrderArgs.method,
        args: [submitOrderArgs.params],
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
      onSuccess: (data) => {
        callbacks?.createOrder?.onSuccess?.({
          srcToken: srcToken!,
          dstToken: dstToken!,
          orderId: data.orderId,
          srcAmount: typedSrcAmount || "0",
          dstAmount: amountUi(dstToken?.decimals, twap.derivedState.destTokenAmount || "0"),
          txHash: data.txHash,
        });
      },
      onError(error) {
        console.log({ error });

        callbacks?.createOrder?.onFailed?.((error as any).message);
      },
    },
  );
};
