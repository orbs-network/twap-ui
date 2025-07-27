import { useMutation } from "@tanstack/react-query";
import { useTwapStore } from "../useTwapStore";
import { useTwapContext } from "../context";
import { useGetTransactionReceipt } from "./use-get-transaction-receipt";
import { Token } from "../types";
import { amountUi } from "@orbs-network/twap-sdk";
import { erc20Abi } from "viem";
import BN from "bignumber.js";

export const useApproveToken = () => {
  const { account, config, walletClient, publicClient, callbacks, twapSDK, transactions } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);
  const getTransactionReceipt = useGetTransactionReceipt();
  return useMutation(
    async ({ token, amount }: { token: Token; amount: string }) => {
      if (!account) throw new Error("account is not defined");
      if (!walletClient) throw new Error("walletClient is not defined");
      if (!publicClient) throw new Error("publicClient is not defined");

      callbacks?.approve?.onRequest?.(token, amountUi(token?.decimals, amount));
      let hash: `0x${string}` | undefined;
      const amountWei = BigInt(BN(amount).decimalPlaces(0).toFixed());
      if (transactions?.approveOrder) {
        hash = await transactions.approveOrder({ tokenAddress: token.address, spenderAddress: config.twapAddress, amount: amountWei });
      } else {
        hash = await walletClient.writeContract({
          abi: erc20Abi,
          functionName: "approve",
          account: account as `0x${string}`,
          address: token.address as `0x${string}`,
          args: [config.twapAddress as `0x${string}`, amountWei],
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

      twapSDK.analytics.onApproveSuccess(hash);
      callbacks?.approve?.onSuccess?.(receipt, token!, amountUi(token?.decimals, amount));
    },
    {
      onError: (error) => {
        callbacks?.approve?.onFailed?.((error as any).message);
      },
    },
  );
};
