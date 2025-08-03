import { useCallback, useMemo } from "react";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { useInputWithPercentage } from "./use-input-with-percentage";
import { InputError, InputErrors, Module } from "../types";
import { useInvertTrade } from "./use-invert-trade";

export const useTriggerPriceError = () => {
  const { module, marketPrice, twapSDK, translations: t } = useTwapContext();
  const triggerPrice = useTriggerPrice().amountWei;
  return useMemo((): InputError | undefined => {
    const stopLossError = twapSDK.getStopLossPriceError(marketPrice || "", triggerPrice || "", module);
    if (stopLossError.isError) {
      return {
        type: InputErrors.STOP_LOSS_TRIGGER_PRICE_GREATER_THAN_MARKET_PRICE,
        value: stopLossError.value,
        message: t.StopLossTriggerPriceError,
      };
    }
    const takeProfitError = twapSDK.getTakeProfitPriceError(marketPrice || "", triggerPrice || "", module);
    if (takeProfitError.isError) {
      return {
        type: InputErrors.STOP_LOSS_TRIGGER_PRICE_GREATER_THAN_MARKET_PRICE,
        value: stopLossError.value,
        message: t.StopLossTriggerPriceError,
      };
    }
  }, [twapSDK, marketPrice, triggerPrice, module, t]);
};

export const useTriggerPrice = () => {
  const { dstToken, marketPrice } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);

  return useInputWithPercentage({
    typedValue: useTwapStore((s) => s.state.typedTriggerPrice),
    percentage: useTwapStore((s) => s.state.triggerPricePercent),
    tokenDecimals: dstToken?.decimals,
    initialPrice: marketPrice,
    setValue: useCallback((typedTriggerPrice?: string) => updateState({ typedTriggerPrice }), [updateState]),
    setPercentage: useCallback((triggerPricePercent?: number) => updateState({ triggerPricePercent: -Math.abs(triggerPricePercent || 0) }), [updateState]),
  });
};

export const useTriggerPricePanel = () => {
  const { translations: t, srcToken, dstToken, module } = useTwapContext();
  const { amountUI, onChange, onPercentageChange, usd, percentDiffFromMarketPrice, percentage } = useTriggerPrice();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const updateState = useTwapStore((s) => s.updateState);
  const error = useTriggerPriceError();

  const { isInverted } = useInvertTrade();

  const reset = useCallback(() => {
    updateState({ triggerPricePercent: undefined, typedTriggerPrice: undefined });
  }, [updateState]);

  const prefixStopsLoss = isInverted ? "+" : "-";
  const prefixTakeProfit = isInverted ? "-" : "+";

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
    prefix: module === Module.STOP_LOSS ? prefixStopsLoss : prefixTakeProfit,
  };
};
