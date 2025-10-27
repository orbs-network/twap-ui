import { useMemo } from "react";
import BN from "bignumber.js";
import { useTwapContext } from "../context/twap-context";
import { useTwapStore } from "../useTwapStore";
import { InputError, InputErrors } from "../types";
import { useSrcAmount } from "./use-src-amount";
import { useTriggerPrice } from "./use-trigger-price";
import { useLimitPrice } from "./use-limit-price";
import { useTrades } from "./use-trades";
import { useFillDelay } from "./use-fill-delay";
import { useDuration } from "./use-duration";
import { useUsdAmount } from "./helper-hooks";
import { MAX_ORDER_SIZE_USD } from "../consts";
import { useTranslations } from "./use-translations";

export const useMaxOrderSizeError = () => {
  const { srcUsd1Token } = useTwapContext();
  const t = useTranslations();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const usdAmount = useUsdAmount(typedSrcAmount, srcUsd1Token);

  return useMemo(() => {
    if (BN(usdAmount || "0").gt(MAX_ORDER_SIZE_USD)) {
      return {
        type: InputErrors.MAX_ORDER_SIZE,
        value: MAX_ORDER_SIZE_USD,
        message: t("maxOrderSizeError", { maxOrderSize: `${MAX_ORDER_SIZE_USD}` }),
      };
    }
  }, [usdAmount, t]);
};

export const useBalanceError = () => {
  const { srcBalance } = useTwapContext();
  const t = useTranslations();
  const srcAmountWei = useSrcAmount().amountWei;

  return useMemo((): InputError | undefined => {
    if (srcBalance && BN(srcAmountWei).gt(srcBalance)) {
      return {
        type: InputErrors.INSUFFICIENT_BALANCE,
        message: t("insufficientFunds"),
        value: srcBalance || "",
      };
    }
  }, [srcBalance?.toString(), srcAmountWei, t]);
};

export function useInputErrors() {
  const { marketPrice, marketPriceLoading } = useTwapContext();
  const srcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const balanceError = useBalanceError();
  const { error: triggerPriceError } = useTriggerPrice();
  const { error: limitPriceError } = useLimitPrice();
  const { error: tradesError } = useTrades();
  const { error: fillDelayError } = useFillDelay();
  const { error: durationError } = useDuration();
  const maxOrderSizeError = useMaxOrderSizeError();

  const ignoreErrors = useMemo(() => new URLSearchParams(window.location.search)?.get("ignore-errors"), []);

  if (BN(marketPrice || 0).isZero() || BN(srcAmount || 0).isZero() || marketPriceLoading || ignoreErrors) {
    return undefined;
  }

  return balanceError || triggerPriceError || limitPriceError || tradesError || fillDelayError || durationError || maxOrderSizeError;
}
