import { maxUint256, erc20abi } from "@defi.org/web3-candies";
import { useMutation } from "@tanstack/react-query";
import { useWidgetContext } from "..";
import { logger } from "../utils";
import { waitForTransactionReceipt } from "viem/actions";
import { useHandleNativeAddress } from "./useHandleNativeAddress";
import BN from "bignumber.js";

export const useApproveToken = () => {
  const { account, isExactAppoval, config, twap, callbacks, srcToken, walletClient, publicClient } = useWidgetContext();
  const { srcAmount, srcAmountUI } = twap.values;
  const approvalAmount = isExactAppoval ? srcAmount : maxUint256;
  const tokenAddress = useHandleNativeAddress(srcToken?.address);

  return useMutation(
    async () => {
      if (!account) throw new Error("account is not defined");
      if (!approvalAmount) throw new Error("approvalAmount is not defined");
      if (!tokenAddress) throw new Error("tokenAddress is not defined");
      const hash = await (walletClient as any).writeContract({
        abi: erc20abi,
        functionName: "approve",
        args: [config.twapAddress as `0x${string}`, BigInt(BN(approvalAmount).decimalPlaces(0).toFixed())],
        account: account,
        address: tokenAddress,
      });

      await waitForTransactionReceipt(publicClient as any, {
        hash,
        confirmations: 5,
      });

      logger("token approve success:", hash);
      twap.analytics.onApproveSuccess(hash);
      callbacks?.onApproveSuccess?.({ token: srcToken!, txHash: hash, amount: isExactAppoval ? srcAmountUI : undefined });
    },
    {
      onError: (error) => {
        callbacks?.onApproveFailed?.((error as any).message);
      },
    },
  );
};
