import { useMemo } from "react";
import { useTwapContext } from "../context";
import { useMaxSrcAmount, useSrcAmount } from "./use-src-amount";
import BN from "bignumber.js";

export const useBalanceError = () => {
  const maxSrcInputAmount = useMaxSrcAmount();
  const { translations: t, srcBalance } = useTwapContext();
  const srcAmountWei = useSrcAmount().amountWei;

  return useMemo(() => {
    const isNativeTokenAndValueBiggerThanMax = maxSrcInputAmount && BN(srcAmountWei)?.gt(maxSrcInputAmount);

    if ((srcBalance && BN(srcAmountWei).gt(srcBalance)) || isNativeTokenAndValueBiggerThanMax) {
      return t.insufficientFunds;
    }
  }, [srcBalance?.toString(), srcAmountWei, maxSrcInputAmount?.toString(), t]);
};
