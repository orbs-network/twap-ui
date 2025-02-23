import { useMutation } from "@tanstack/react-query";
import { useWidgetContext } from "..";
import { logger } from "../utils";
import { waitForTransactionReceipt } from "viem/actions";
import { useHandleNativeAddress } from "./useHandleNativeAddress";
import BN from "bignumber.js";
import { erc20Abi, maxUint256 } from "viem";

export const useApproveToken = () => {
  const { account, isExactAppoval, config, twap, srcToken, walletClient, publicClient, callbacks } = useWidgetContext();
  const { srcAmount, srcAmountUI } = twap.values;
  const approvalAmount = isExactAppoval ? srcAmount : maxUint256.toString();
  const tokenAddress = useHandleNativeAddress(srcToken?.address);

  return useMutation(
    async () => {
      if (!account) throw new Error("account is not defined");
      if (!approvalAmount) throw new Error("approvalAmount is not defined");
      if (!tokenAddress) throw new Error("tokenAddress is not defined");
      callbacks?.approve?.onRequest?.({ token: srcToken!, amount: srcAmountUI });
      const hash = await (walletClient as any).writeContract({
        abi: erc20Abi,
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
      callbacks?.approve.onSuccess?.({ token: srcToken!, txHash: hash, amount: isExactAppoval ? srcAmountUI : maxUint256.toString() });
    },
    {
      onError: (error) => {
        callbacks?.approve.onFailed?.((error as any).message);
      },
    },
  );
};
