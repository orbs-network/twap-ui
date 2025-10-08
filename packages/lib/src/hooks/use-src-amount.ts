import { useMemo } from "react";
import { useTwapContext } from "../context/twap-context";
import { useTwapStore } from "../useTwapStore";
import { useAmountBN } from "./helper-hooks";
import BN from "bignumber.js";
import { amountBN, isNativeAddress } from "@orbs-network/twap-sdk";
import { getMinNativeBalance } from "../utils";

export const useMaxSrcAmount = () => {
  const { srcToken, srcBalance, chainId } = useTwapContext();

  return useMemo(() => {
    if (srcBalance && isNativeAddress(srcToken?.address || "") && chainId) {
      const srcTokenMinimum = amountBN(srcToken?.decimals, getMinNativeBalance(chainId).toString());
      return BN.max(0, BN.min(BN(srcBalance).minus(srcTokenMinimum))).toString();
    }
  }, [srcToken, srcBalance, chainId]);
};

export const useSrcAmount = () => {
  const { srcToken, translations: t } = useTwapContext();

  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const acceptedSrcAmount = useTwapStore((s) => s.state.acceptedSrcAmount);

  const value = acceptedSrcAmount || typedSrcAmount;

  return {
    amountWei: useAmountBN(srcToken?.decimals, value),
    amountUI: value,
    error: BN(value || 0).isZero() ? t.enterAmount : undefined,
  };
};
