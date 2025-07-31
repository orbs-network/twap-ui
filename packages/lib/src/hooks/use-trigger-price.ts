import { useCallback, useMemo } from "react";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { useInputWithPercentage } from "./use-input-with-percentage";
import { useLimitPrice } from "./use-limit-price";
import { InputErrors, Module } from "../types";
import { useInvertTrade } from "./use-invert-trade";

export const useStopLossLimitPriceError = (triggerPrice?: string) => {
  const { twapSDK, translations: t } = useTwapContext();
  const limitPrice = useLimitPrice().amountWei;
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);

  return useMemo(() => {
    const { isError, value } = twapSDK.getStopLossLimitPriceError(triggerPrice || "", limitPrice || "", Boolean(isMarketOrder));

    if (!isError) return undefined;
    return {
      type: InputErrors.STOP_LOSS_LIMIT_PRICE_GREATER_THAN_TRIGGER_PRICE,
      value: value,
      message: t.stopLossLimitPriceGreaterThanTriggerPrice,
    };
  }, [twapSDK, triggerPrice, limitPrice, isMarketOrder, t]);
};

export const useStopLossError = (triggerPrice?: string) => {
  const { twapSDK, marketPrice, translations: t } = useTwapContext();

  return useMemo(() => {
    const { isError, value } = twapSDK.getStopLossError(marketPrice || "", triggerPrice || "");
    if (!isError) return undefined;
    return {
      type: InputErrors.STOP_LOSS_TRIGGER_PRICE_GREATER_THAN_MARKET_PRICE,
      value: value,
      message: t.stopLossTriggerPriceGreaterThanMarketPrice,
    };
  }, [twapSDK, marketPrice, triggerPrice]);
};

const useTriggerPriceError = (triggerPrice?: string) => {
  const { module } = useTwapContext();

  const stopLossError = useStopLossError(triggerPrice);
  const stopLossLimitPriceError = useStopLossLimitPriceError(triggerPrice);

  if (module !== Module.STOP_LOSS) return;

  return stopLossError || stopLossLimitPriceError;
};

export const useTriggerPrice = () => {
  const { dstToken, marketPrice } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);

  const result = useInputWithPercentage({
    typedValue: useTwapStore((s) => s.state.typedTriggerPrice),
    percentage: useTwapStore((s) => s.state.triggerPricePercent),
    tokenDecimals: dstToken?.decimals,
    initialPrice: marketPrice,
    setValue: useCallback((typedTriggerPrice?: string) => updateState({ typedTriggerPrice }), [updateState]),
    setPercentage: useCallback((triggerPricePercent?: number) => updateState({ triggerPricePercent: -Math.abs(triggerPricePercent || 0) }), [updateState]),
  });
  const error = useTriggerPriceError(result.amountWei);

  return useMemo(() => {
    return {
      ...result,
      error,
    };
  }, [result, error]);
};

export const useTriggerPricePanel = () => {
  const { translations: t, srcToken, dstToken } = useTwapContext();
  const { amountUI, onChange, onPercentageChange, usd, percentDiffFromMarketPrice, percentage, error } = useTriggerPrice();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const updateState = useTwapStore((s) => s.updateState);
  const { isInverted } = useInvertTrade();

  const reset = useCallback(() => {
    updateState({ triggerPricePercent: undefined, typedTriggerPrice: undefined });
  }, [updateState]);

  return {
    price: amountUI,
    error,
    label: t.stopLossLabel,
    tooltip: t.stopLossTooltip,
    onChange,
    onPercentageChange,
    marketDiffPercentage: percentDiffFromMarketPrice,
    isActive: !isMarketOrder,
    onReset: reset,
    usd,
    srcToken: isInverted ? dstToken : srcToken,
    dstToken: isInverted ? srcToken : dstToken,
    selectedPercentage: percentage,
    prefix: isInverted ? "+" : "-",
  };
};
