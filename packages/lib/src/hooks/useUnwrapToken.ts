import { iwethabi } from "@defi.org/web3-candies";
import { useMutation } from "@tanstack/react-query";
import BN from "bignumber.js";
import { useRefetchBalances } from "./useBalances";
import { useWidgetContext } from "../widget/widget-context";
import { waitForTransactionReceipt } from "viem/actions";
import { useNetwork } from "./useNetwork";

export const useUnwrapToken = () => {
  const { account, twap, resetState, walletClient, publicClient } = useWidgetContext();
  const onSuccess = useRefetchBalances();
  const srcAmount = twap.values.srcAmount;
  const tokenAddress = useNetwork()?.wToken.address;

  return useMutation(async () => {
    if (!tokenAddress) {
      throw new Error("address is not defined");
    }
    if (!account) {
      throw new Error("account is not defined");
    }

    const hash = await (walletClient as any).writeContract({
      abi: iwethabi,
      functionName: "withdraw",
      account: account,
      address: tokenAddress,
      params: [BN(srcAmount).decimalPlaces(0).toFixed()],
    });

    await waitForTransactionReceipt(publicClient as any, {
      hash,
      confirmations: 5,
    });

    resetState();
    await onSuccess();
  });
};
