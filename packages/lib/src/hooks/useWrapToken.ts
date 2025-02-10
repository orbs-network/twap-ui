import { iwethabi } from "@defi.org/web3-candies";
import { useMutation } from "@tanstack/react-query";
import { useWidgetContext } from "..";
import { logger } from "../utils";
import { useRefetchBalances } from "./useBalances";
import { useNetwork } from "./useNetwork";
import BN from "bignumber.js";
import { waitForTransactionReceipt } from "viem/actions";

export const useWrapToken = () => {
  const { account, twap, srcToken, callbacks, walletClient, publicClient } = useWidgetContext();
  const { srcAmount, srcAmountUI } = twap.values;

  const tokenAddress = useNetwork()?.wToken.address;

  return useMutation(
    async () => {
      if (!srcAmount) throw new Error("srcAmount is not defined");
      if (!account) throw new Error("account is not defined");

      const hash = await (walletClient as any).writeContract({
        abi: iwethabi,
        functionName: "deposit",
        account: account,
        address: tokenAddress,
        value: BN(srcAmount).decimalPlaces(0).toFixed(),
      });

      await waitForTransactionReceipt(publicClient as any, {
        hash,
        confirmations: 5,
      });

      logger("token wrap success:", hash);
      twap.analytics.onWrapSuccess(hash);
      callbacks?.onWrapSuccess?.({ token: srcToken!, txHash: hash, amount: srcAmountUI });
    },
    {
      onError: (error) => {
        callbacks?.onWrapFailed?.((error as any).message);
      },
    },
  );
};

export const useWrapOnly = () => {
  const { mutateAsync } = useWrapToken();
  const { resetState } = useWidgetContext();

  const onSuccess = useRefetchBalances();

  return useMutation(async () => {
    await mutateAsync();
    resetState();
    await onSuccess();
  });
};
