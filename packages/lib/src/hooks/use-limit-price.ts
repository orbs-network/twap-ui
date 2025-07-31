import { useCallback, useMemo } from "react";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { useInputWithPercentage } from "./use-input-with-percentage";
import { DEFAULT_STOP_LOSS_LIMIT_PERCENTAGE } from "../consts";
import { InputErrors, InputError, Module } from "../types";
import BN from "bignumber.js";
import { useInvertTrade } from "./use-invert-trade";

export const useLimitPriceError = () => {
  const { translations: t } = useTwapContext();
  const typedLimitPrice = useTwapStore((s) => s.state.typedLimitPrice);
  return useMemo((): InputError | undefined => {
    if (typedLimitPrice !== undefined && BN(typedLimitPrice || 0).isZero()) {
      return {
        type: InputErrors.MISSING_LIMIT_PRICE,
        value: typedLimitPrice,
        message: t.enterLimitPrice,
      };
    }
  }, [typedLimitPrice, t]);
};

export const useLimitPrice = () => {
  const { dstToken, marketPrice, module } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);
  const error = useLimitPriceError();

  const result = useInputWithPercentage({
    typedValue: useTwapStore((s) => s.state.typedLimitPrice),
    percentage: useTwapStore((s) => s.state.limitPricePercent),
    tokenDecimals: dstToken?.decimals,
    initialPrice: marketPrice,
    setValue: useCallback((typedLimitPrice?: string) => updateState({ typedLimitPrice }), [updateState]),
    setPercentage: useCallback(
      (limitPricePercent?: number) => {
        const result = module === Module.STOP_LOSS ? -Math.abs(limitPricePercent || 0) : Math.abs(limitPricePercent || 0);
        updateState({ limitPricePercent: !limitPricePercent ? undefined : result });
      },
      [updateState, module],
    ),
  });

  return useMemo(() => {
    return {
      ...result,
      error,
    };
  }, [result, error]);
};

export const useLimitPricePanel = () => {
  const { translations: t, module, srcToken, dstToken } = useTwapContext();
  const { amountUI, onChange, onPercentageChange, usd, percentDiffFromMarketPrice, percentage, error } = useLimitPrice();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const updateState = useTwapStore((s) => s.updateState);
  const { isInverted } = useInvertTrade();

  const reset = useCallback(() => {
    updateState({ typedLimitPrice: undefined });
    if (module === Module.STOP_LOSS) {
      updateState({ limitPricePercent: DEFAULT_STOP_LOSS_LIMIT_PERCENTAGE });
    } else {
      updateState({ limitPricePercent: undefined });
    }
  }, [updateState, module]);

  const tooltip = useMemo(() => {
    if (module === Module.STOP_LOSS) {
      return t.stopLossLimitPriceTooltip;
    }
    return t.limitPriceTooltip;
  }, [t, module]);

  return {
    price: amountUI,
    error,
    label: t.limitPrice,
    tooltip,
    onChange,
    onPercentageChange,
    marketDiffPercentage: percentDiffFromMarketPrice,
    isActive: !isMarketOrder,
    onReset: reset,
    usd,
    srcToken: isInverted ? dstToken : srcToken,
    dstToken: isInverted ? srcToken : dstToken,
    selectedPercentage: percentage,
    isInverted,
  };
};
