import { amountUi, analytics, iwethabi } from "@orbs-network/twap-sdk";
import { useMutation } from "@tanstack/react-query";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { useGetTransactionReceipt } from "./use-get-transaction-receipt";
import BN from "bignumber.js";
import { useNetwork } from "./helper-hooks";

export const useWrapToken = () => {
  const { account, walletClient, publicClient, callbacks, transactions } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);
  const wToken = useNetwork()?.wToken;
  const getTransactionReceipt = useGetTransactionReceipt();

  return useMutation(
    async (amount: string) => {
      if (!account || !walletClient || !publicClient) {
        throw new Error("missing required parameters");
      }
      if (!wToken) {
        throw new Error("tokenAddress is not defined");
      }
      callbacks?.wrap?.onRequest?.(amount);
      const amountWei = BigInt(BN(amount).decimalPlaces(0).toFixed());
      const amountUI = amountUi(wToken?.decimals, amount);

      let hash: `0x${string}` | undefined;
      if (transactions?.wrap) {
        hash = await transactions.wrap(amountWei);
      } else {
        hash = await walletClient.writeContract({
          abi: iwethabi,
          functionName: "deposit",
          account,
          address: wToken.address as `0x${string}`,
          value: amountWei,
          chain: walletClient.chain,
        });
      }
      updateState({ wrapTxHash: hash });

      const receipt = await getTransactionReceipt(hash);
      if (!receipt) {
        throw new Error("failed to get transaction receipt");
      }

      if (receipt.status === "reverted") {
        throw new Error("failed to wrap token");
      }

      analytics.onWrapSuccess(hash);
      await callbacks?.wrap?.onSuccess?.(receipt, amountUI);
      return receipt;
    },
    {
      onError: (error) => {
        callbacks?.wrap?.onFailed?.((error as any).message);
      },
    },
  );
};
