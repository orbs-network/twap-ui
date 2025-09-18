import { useMutation } from "@tanstack/react-query";
import { useTwapContext } from "../context";
import { useGetTransactionReceipt } from "./use-get-transaction-receipt";
import { Token } from "../types";
import { REPERMIT_ADDRESS } from "@orbs-network/twap-sdk";
import { erc20Abi, maxUint256 } from "viem";
import { ensureWrappedToken } from "../utils";
import { useEnsureAllowanceCallback } from "./use-allowance";
import BN from "bignumber.js";

export const useApproveToken = () => {
  const { account, walletClient, publicClient, overrides, chainId } = useTwapContext();
  const getTransactionReceipt = useGetTransactionReceipt();
  const { refetch: refetchAllowance } = useEnsureAllowanceCallback();

  return useMutation(async ({ token: _token, onHash }: { token: Token; onHash: (hash: string) => void }) => {
    if (!account || !walletClient || !publicClient || !chainId) {
      throw new Error("missing required parameters");
    }

    const token = ensureWrappedToken(_token, chainId);

    let hash: `0x${string}` | undefined;
    if (overrides?.approveOrder) {
      hash = await overrides.approveOrder({ tokenAddress: token.address, spenderAddress: REPERMIT_ADDRESS, amount: maxUint256 });
    } else {
      hash = await walletClient.writeContract({
        abi: erc20Abi,
        functionName: "approve",
        account: account as `0x${string}`,
        address: token.address as `0x${string}`,
        args: [REPERMIT_ADDRESS as `0x${string}`, maxUint256],
        chain: walletClient.chain,
      });
    }
    onHash(hash);
    const receipt = await getTransactionReceipt(hash);

    if (!receipt) {
      throw new Error("failed to get transaction receipt");
    }

    if (receipt.status === "reverted") {
      throw new Error("failed to approve token");
    }

    const hasAllowance = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      const allowance = await refetchAllowance();
      const hasAllowance = BN(allowance || "0").gte(maxUint256.toString());
      if (hasAllowance) break;
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 3000)); // 3s delay
      }
    }

    if (!hasAllowance) {
      throw new Error("Insufficient allowance to perform the swap. Please approve the token first.");
    }
    return receipt;
  });
};
