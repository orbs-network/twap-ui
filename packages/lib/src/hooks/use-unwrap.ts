import { IWETH_ABI } from "@orbs-network/twap-sdk";
import { useMutation } from "@tanstack/react-query";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { useNetwork } from "./helper-hooks";
import { useSrcAmount } from "./use-src-amount";
import BN from "bignumber.js";
import { useGetTransactionReceipt } from "./use-get-transaction-receipt";

export const useUnwrapToken = () => {
  const { account, walletClient, publicClient, overrides } = useTwapContext();
  const resetState = useTwapStore((s) => s.resetState);
  const updateState = useTwapStore((s) => s.updateState);
  const wTokenAddress = useNetwork()?.wToken.address;
  const { amountWei } = useSrcAmount();
  const getTransactionReceipt = useGetTransactionReceipt();

  return useMutation(
    async () => {
      if (!wTokenAddress) throw new Error("wTokenAddress is not defined");
      if (!account) throw new Error("account is not defined");
      if (!walletClient) throw new Error("walletClient is not defined");
      if (!publicClient) throw new Error("publicClient is not defined");
      const value = BigInt(BN(amountWei).decimalPlaces(0).toFixed());

      let hash: `0x${string}` | undefined;
      if (overrides?.unwrap) {
        hash = await overrides.unwrap(value);
      } else {
        hash = await walletClient.writeContract({
          abi: IWETH_ABI,
          functionName: "withdraw",
          account: account,
          address: wTokenAddress as `0x${string}`,
          args: [value],
          chain: walletClient.chain,
        });
      }
      updateState({ unwrapTxHash: hash });
      const receipt = await getTransactionReceipt(hash);
      if (!receipt) {
        throw new Error("failed to get transaction receipt");
      }

      return receipt;
    },
    {
      onSuccess: resetState,
    },
  );
};
