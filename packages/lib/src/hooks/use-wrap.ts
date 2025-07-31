import { iwethabi } from "@orbs-network/twap-sdk";
import { useMutation } from "@tanstack/react-query";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { useGetTransactionReceipt } from "./use-get-transaction-receipt";
import BN from "bignumber.js";
import { useNetwork } from "./helper-hooks";

export const useWrapToken = () => {
  const { account, walletClient, publicClient, callbacks, twapSDK, transactions } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount || "");
  const tokenAddress = useNetwork()?.wToken.address;
  const getTransactionReceipt = useGetTransactionReceipt();

  return useMutation(
    async (amount: string) => {
      if (!account) throw new Error("account is not defined");
      if (!tokenAddress) throw new Error("tokenAddress is not defined");
      if (!walletClient) throw new Error("walletClient is not defined");
      if (!publicClient) throw new Error("publicClient is not defined");
      const amountWei = BigInt(BN(amount).decimalPlaces(0).toFixed());

      let hash: `0x${string}` | undefined;
      if (transactions?.wrap) {
        hash = await transactions.wrap(amountWei);
      } else {
        hash = await walletClient.writeContract({
          abi: iwethabi,
          functionName: "deposit",
          account,
          address: tokenAddress as `0x${string}`,
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

      twapSDK.analytics.onWrapSuccess(hash);
      await callbacks?.wrap?.onSuccess?.(receipt, typedSrcAmount);
      return receipt;
    },
    {
      onMutate: () => {
        callbacks?.wrap?.onRequest?.(typedSrcAmount);
      },
      onError: (error) => {
        callbacks?.wrap?.onFailed?.((error as any).message);
      },
    },
  );
};
