import { useMutation } from "@tanstack/react-query";
import { useWidgetContext } from "..";
import { logger } from "../utils";
import { useNetwork } from "./useNetwork";
import BN from "bignumber.js";
import { waitForTransactionReceipt } from "viem/actions";
import { iwethabi } from "@orbs-network/twap-sdk";

export const useWrapToken = () => {
  const {
    account,
    twap,
    walletClient,
    publicClient,
    callbacks,
    state: { typedSrcAmount },
    srcAmount,
  } = useWidgetContext();

  const tokenAddress = useNetwork()?.wToken.address;

  return useMutation(
    async () => {
      if (!srcAmount) throw new Error("srcAmount is not defined");
      if (!account) throw new Error("account is not defined");
      callbacks?.wrap.onRequest?.(typedSrcAmount || "");
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
      callbacks?.wrap.onSuccess?.({ txHash: hash, amount: typedSrcAmount || "" });
    },
    {
      onError: (error) => {
        callbacks?.wrap?.onFailed?.((error as any).message);
      },
    },
  );
};

export const useWrapOnly = () => {
  const { mutateAsync } = useWrapToken();
  const { resetState, actions } = useWidgetContext();

  return useMutation(async () => {
    await mutateAsync();
    resetState();
    await actions.refetchBalances?.();
  });
};
