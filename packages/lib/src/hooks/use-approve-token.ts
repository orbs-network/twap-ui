import { useMutation } from "@tanstack/react-query";
import { useTwapStore } from "../useTwapStore";
import { useTwapContext } from "../context";
import { useGetTransactionReceipt } from "./use-get-transaction-receipt";
import { Token } from "../types";
import { amountUi, analytics, REPERMIT_ADDRESS } from "@orbs-network/twap-sdk";
import { erc20Abi, maxUint256 } from "viem";
import { ensureWrappedToken } from "../utils";

export const useApproveToken = () => {
  const { account, walletClient, publicClient, callbacks, transactions, chainId } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);
  const getTransactionReceipt = useGetTransactionReceipt();
  return useMutation(
    async (_token: Token) => {
      if (!account || !walletClient || !publicClient || !chainId) {
        throw new Error("missing required parameters");
      }

      const token = ensureWrappedToken(_token, chainId);

      callbacks?.approve?.onRequest?.(token, amountUi(token?.decimals, maxUint256.toString()));
      let hash: `0x${string}` | undefined;
      if (transactions?.approveOrder) {
        hash = await transactions.approveOrder({ tokenAddress: token.address, spenderAddress: REPERMIT_ADDRESS, amount: maxUint256 });
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
