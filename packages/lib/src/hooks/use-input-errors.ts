import { useMemo } from "react";
import BN from "bignumber.js";
import { useTwapContext } from "../context/twap-context";
import { useTwapStore } from "../useTwapStore";
import { InputError, InputErrors } from "../types";
import { useMaxSrcAmount, useSrcAmount } from "./use-src-amount";
import { useTriggerPrice } from "./use-trigger-price";
import { useLimitPrice } from "./use-limit-price";
import { useTrades } from "./use-trades";
import { useFillDelay } from "./use-fill-delay";
import { useDuration } from "./use-duration";

export const useBalanceError = () => {
  const maxSrcInputAmount = useMaxSrcAmount();
  const { srcBalance, translations: t } = useTwapContext();
  const srcAmountWei = useSrcAmount().amountWei;

  return useMemo((): InputError | undefined => {
    const isNativeTokenAndValueBiggerThanMax = maxSrcInputAmount && BN(srcAmountWei)?.gt(maxSrcInputAmount);

    if ((srcBalance && BN(srcAmountWei).gt(srcBalance)) || isNativeTokenAndValueBiggerThanMax) {
      return {
        type: InputErrors.INSUFFICIENT_BALANCE,
        message: t.insufficientFunds,
        value: srcBalance || "",
      };
    }
  }, [srcBalance?.toString(), srcAmountWei, maxSrcInputAmount?.toString(), t]);
};

export function useInputErrors() {
  const { marketPrice } = useTwapContext();
  const srcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const balanceError = useBalanceError();
  const { error: triggerPriceError } = useTriggerPrice();
  const { error: limitPriceError } = useLimitPrice();
  const { error: tradesError } = useTrades();
  const { error: fillDelayError } = useFillDelay();
  const { error: durationError } = useDuration();

  if (BN(marketPrice || 0).isZero() || BN(srcAmount || 0).isZero()) {
    return undefined;
  }

  return balanceError || triggerPriceError || limitPriceError || tradesError || fillDelayError || durationError;
}
