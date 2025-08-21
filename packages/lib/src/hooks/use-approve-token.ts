import { useMutation } from "@tanstack/react-query";
import { useTwapStore } from "../useTwapStore";
import { useTwapContext } from "../context";
import { useGetTransactionReceipt } from "./use-get-transaction-receipt";
import { Token } from "../types";
import { amountUi, analytics, REPERMIT_ADDRESS } from "@orbs-network/twap-sdk";
import { erc20Abi, maxUint256 } from "viem";
import { ensureWrappedToken } from "../utils";
import { useEnsureAllowanceCallback } from "./use-allowance";
import BN from "bignumber.js";

export const useApproveToken = () => {
  const { account, walletClient, publicClient, callbacks, overrides, chainId } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);
  const getTransactionReceipt = useGetTransactionReceipt();
  const { refetch: refetchAllowance } = useEnsureAllowanceCallback();

  return useMutation(
    async ({ token: _token, amount }: { token: Token; amount: string }) => {
      if (!account || !walletClient || !publicClient || !chainId) {
        throw new Error("missing required parameters");
      }

      const token = ensureWrappedToken(_token, chainId);

      callbacks?.approve?.onRequest?.(token, amountUi(token?.decimals, maxUint256.toString()));
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
      updateState({ approveTxHash: hash });
      const receipt = await getTransactionReceipt(hash);

      if (!receipt) {
        throw new Error("failed to get transaction receipt");
      }

      if (receipt.status === "reverted") {
        throw new Error("failed to approve token");
      }

      let hasAllowance = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        const allowance = await refetchAllowance();
        const hasAllowance = BN(allowance || "0").gte(amount);
        if (hasAllowance) break;
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 3000)); // 3s delay
        }
      }

      if (!hasAllowance) {
        throw new Error("Insufficient allowance to perform the swap. Please approve the token first.");
      }

      analytics.onApproveSuccess(hash);
      callbacks?.approve?.onSuccess?.(receipt, token!, amountUi(token?.decimals, maxUint256.toString()));
    },
    {
      onError: (error) => {
        callbacks?.approve?.onFailed?.((error as any).message);
      },
    },
  );
};
