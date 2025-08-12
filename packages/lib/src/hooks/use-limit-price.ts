import { useCallback, useMemo } from "react";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { useInputWithPercentage } from "./use-input-with-percentage";
import { InputErrors, InputError, Module } from "../types";
import BN from "bignumber.js";
import { useInvertTrade } from "./use-invert-trade";
import { useTriggerPrice } from "./use-trigger-price";
import { useDefaultLimitPricePercent } from "./use-default-values";
import { getStopLossLimitPriceError, getTakeProfitLimitPriceError } from "@orbs-network/twap-sdk";

export const useLimitPriceError = () => {
  const { translations: t, module } = useTwapContext();
  const { amountWei: triggerPrice } = useTriggerPrice();
  const limitPrice = useLimitPrice().amountWei;
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  return useMemo((): InputError | undefined => {
    if (!typedSrcAmount || !triggerPrice) return;
    const _stopLossError = getStopLossLimitPriceError(triggerPrice, limitPrice, isMarketOrder, module);
    const _takeProfitError = getTakeProfitLimitPriceError(triggerPrice, limitPrice, isMarketOrder, module);

    if (_stopLossError?.isError) {
      return {
        type: InputErrors.TRIGGER_LIMIT_PRICE_GREATER_THAN_TRIGGER_PRICE,
        message: t.triggerLimitPriceError,
        value: _stopLossError.value,
      };
    }

    if (_takeProfitError?.isError) {
      return {
        type: InputErrors.TRIGGER_LIMIT_PRICE_GREATER_THAN_TRIGGER_PRICE,
        message: t.triggerLimitPriceError,
        value: _takeProfitError.value,
      };
    }

    if (limitPrice && BN(limitPrice || 0).isZero()) {
      return {
        type: InputErrors.MISSING_LIMIT_PRICE,
        message: t.emptyLimitPrice,
        value: limitPrice || "",
      };
    }
  }, [limitPrice, t, triggerPrice, module, isMarketOrder, typedSrcAmount]);
};

export const useLimitPrice = () => {
  const { dstToken, marketPrice, module } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);
  const defaultLimitPricePercent = useDefaultLimitPricePercent();
  const typedPercent = useTwapStore((s) => s.state.limitPricePercent);
  const percentage = typedPercent === undefined ? defaultLimitPricePercent : typedPercent;
  return useInputWithPercentage({
    typedValue: useTwapStore((s) => s.state.typedLimitPrice),
    percentage,
    tokenDecimals: dstToken?.decimals,
    initialPrice: marketPrice,
    setValue: useCallback((typedLimitPrice?: string) => updateState({ typedLimitPrice }), [updateState]),
    setPercentage: useCallback(
      (limitPricePercent?: number | null) => {
        const result = module === Module.STOP_LOSS ? -Math.abs(limitPricePercent || 0) : Math.abs(limitPricePercent || 0);
        updateState({ limitPricePercent: limitPricePercent === null ? null : result });
      },
      [updateState, module],
    ),
  });
};

export const useLimitPricePanel = () => {
  const { translations: t, module, srcToken, dstToken, marketPrice, marketPriceLoading } = useTwapContext();
  const { amountUI, onChange, onPercentageChange, usd, percentDiffFromMarketPrice, percentage } = useLimitPrice();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const updateState = useTwapStore((s) => s.updateState);
  const { isInverted } = useInvertTrade();
  const error = useLimitPriceError();
  const defaultLimitPricePercent = useDefaultLimitPricePercent();

  const reset = useCallback(() => {
    updateState({ typedLimitPrice: undefined });
    updateState({ limitPricePercent: defaultLimitPricePercent });
  }, [updateState, module, defaultLimitPricePercent]);

  const tooltip = useMemo(() => {
    if (module === Module.STOP_LOSS) {
      return t.stopLossLimitPriceTooltip;
    }
    return t.limitPriceTooltip;
  }, [t, module]);

  const stopLossPrefix = isInverted ? "+" : "-";
  const takeProfitPrefix = isInverted ? "-" : "+";

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
    prefix: module === Module.STOP_LOSS ? stopLossPrefix : takeProfitPrefix,
    isLoading: marketPriceLoading || !marketPrice,
  };
};
