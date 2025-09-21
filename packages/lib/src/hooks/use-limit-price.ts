import { useCallback, useMemo } from "react";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { useInputWithPercentage } from "./use-input-with-percentage";
import { InputErrors, InputError, Module } from "../types";
import BN from "bignumber.js";
import { useTriggerPrice } from "./use-trigger-price";
import { useDefaultLimitPricePercent } from "./use-default-values";
import { getStopLossLimitPriceError, getTakeProfitLimitPriceError } from "@orbs-network/twap-sdk";

export const useLimitPriceError = (limitPriceWei?: string) => {
  const { translations: t, module } = useTwapContext();
  const { amountWei: triggerPrice } = useTriggerPrice();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  return useMemo((): InputError | undefined => {
    if (!typedSrcAmount || !triggerPrice) return;
    const _stopLossError = getStopLossLimitPriceError(triggerPrice, limitPriceWei, isMarketOrder, module);
    const _takeProfitError = getTakeProfitLimitPriceError(triggerPrice, limitPriceWei, isMarketOrder, module);

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

    if (limitPriceWei && BN(limitPriceWei || 0).isZero()) {
      return {
        type: InputErrors.MISSING_LIMIT_PRICE,
        message: t.emptyLimitPrice,
        value: limitPriceWei || "",
      };
    }
  }, [limitPriceWei, t, triggerPrice, module, isMarketOrder, typedSrcAmount]);
};

export const useLimitPrice = () => {
  const { dstToken, marketPrice, module } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);
  const defaultLimitPricePercent = useDefaultLimitPricePercent();
  const typedPercent = useTwapStore((s) => s.state.limitPricePercent);
  const percentage = typedPercent === undefined ? defaultLimitPricePercent : typedPercent;

  const result = useInputWithPercentage({
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
  const error = useLimitPriceError(result.amountWei);

  return useMemo(() => {
    return {
      ...result,
      error,
    };
  }, [result, error]);
};

export const useLimitPriceToggle = () => {
  const { module } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const triggerPricePercent = useTwapStore((s) => s.state.triggerPricePercent) || 0;

  const toggleLimitPrice = useCallback(() => {
    const value = !isMarketOrder;
    if (!value && module === Module.STOP_LOSS) {
      updateState({ limitPricePercent: triggerPricePercent - 5 });
    }

    updateState({ isMarketOrder: value });
  }, [updateState, triggerPricePercent, module]);

  return {
    isLimitPrice: !isMarketOrder,
    toggleLimitPrice,
  };
};
