import { useMemo } from "react";
import { useTwapContext } from "../context/twap-context";
import { useMaxSrcAmount, useSrcAmount } from "./use-src-amount";
import BN from "bignumber.js";
import { InputErrors } from "../types";
import { useTranslations } from "./use-translations";

export const useBalanceError = () => {
  const maxSrcInputAmount = useMaxSrcAmount();
  const { srcBalance } = useTwapContext();
  const t = useTranslations();
  const srcAmountWei = useSrcAmount().amountWei;

  const error = useMemo(() => {
    const isNativeTokenAndValueBiggerThanMax = maxSrcInputAmount && BN(srcAmountWei)?.gt(maxSrcInputAmount);

    return (srcBalance && BN(srcAmountWei).gt(srcBalance)) || isNativeTokenAndValueBiggerThanMax;
  }, [srcBalance?.toString(), srcAmountWei, maxSrcInputAmount?.toString(), t]);

  if (error) {
    return {
      type: InputErrors.INSUFFICIENT_BALANCE,
      message: t("insufficientFunds") || "",
      value: srcBalance,
    };
  }
};
