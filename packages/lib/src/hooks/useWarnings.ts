import { useMemo } from "react";
import { useAmountBN, useWidgetContext } from "..";
import { useMaxSrcInputAmount } from "./useMaxSrcInputAmount";
import BN from "bignumber.js";

export const useBalanceWaning = () => {
  const maxSrcInputAmount = useMaxSrcInputAmount();
  const { translations: t, srcToken, srcBalance, state } = useWidgetContext();
  const srcAmount = useAmountBN(srcToken?.decimals, state.typedSrcAmount);

  return useMemo(() => {
    const isNativeTokenAndValueBiggerThanMax = maxSrcInputAmount && BN(srcAmount)?.gt(maxSrcInputAmount);

    if ((srcBalance && BN(srcAmount).gt(srcBalance)) || isNativeTokenAndValueBiggerThanMax) {
      return t.insufficientFunds;
    }
  }, [srcBalance?.toString(), srcAmount, maxSrcInputAmount?.toString(), t]);
};
