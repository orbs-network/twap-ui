import { analytics, IWETH_ABI } from "@orbs-network/twap-sdk";
import { useMutation } from "@tanstack/react-query";
import { useTwapContext } from "../context";
import { useGetTransactionReceipt } from "./use-get-transaction-receipt";
import BN from "bignumber.js";
import { useNetwork } from "./helper-hooks";

export const useWrapToken = () => {
  const { account, walletClient, publicClient, overrides } = useTwapContext();
  const wToken = useNetwork()?.wToken;
  const getTransactionReceipt = useGetTransactionReceipt();

  return useMutation(async ({ amount, onHash }: { amount: string; onHash?: (hash: string) => void }) => {
    if (!account || !walletClient || !publicClient) {
      throw new Error("missing required parameters");
    }
    if (!wToken) {
      throw new Error("tokenAddress is not defined");
    }

    const amountWei = BigInt(BN(amount).decimalPlaces(0).toFixed());

    let hash: `0x${string}` | undefined;
    if (overrides?.wrap) {
      hash = await overrides.wrap(amountWei);
    } else {
      hash = await walletClient.writeContract({
        abi: IWETH_ABI,
        functionName: "deposit",
        account,
        address: wToken.address as `0x${string}`,
        value: amountWei,
        chain: walletClient.chain,
      });
    }
    onHash?.(hash);
    const receipt = await getTransactionReceipt(hash);
    if (!receipt) {
      throw new Error("failed to get transaction receipt");
    }

    if (receipt.status === "reverted") {
      throw new Error("failed to wrap token");
    }

    analytics.onWrapSuccess(hash);
    return receipt;
  });
};
