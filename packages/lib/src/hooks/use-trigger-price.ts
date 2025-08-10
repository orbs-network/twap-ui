import { useCallback, useMemo } from "react";
import BN from "bignumber.js";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { useInputWithPercentage } from "./use-input-with-percentage";
import { InputError, InputErrors, Module } from "../types";
import { useInvertTrade } from "./use-invert-trade";
import { useDefaultTriggerPricePercent } from "./use-default-values";

export const useTriggerPriceError = () => {
  const { module, marketPrice, twapSDK, translations: t } = useTwapContext();
  const triggerPrice = useTriggerPrice().amountWei;
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  return useMemo((): InputError | undefined => {
    if (!typedSrcAmount || !marketPrice) return;
    if (module !== Module.STOP_LOSS && module !== Module.TAKE_PROFIT) return;
    const stopLossError = twapSDK.getStopLossPriceError(marketPrice || "", triggerPrice || "", module);
    if (stopLossError?.isError) {
      return {
        type: InputErrors.STOP_LOSS_TRIGGER_PRICE_GREATER_THAN_MARKET_PRICE,
        value: stopLossError.value,
        message: t.StopLossTriggerPriceError,
      };
    }
    const takeProfitError = twapSDK.getTakeProfitPriceError(marketPrice || "", triggerPrice || "", module);

    if (takeProfitError?.isError) {
      return {
        type: InputErrors.TAKE_PROFIT_TRIGGER_PRICE_LESS_THAN_MARKET_PRICE,
        value: takeProfitError.value,
        message: t.TakeProfitTriggerPriceError,
      };
    }

    if (!triggerPrice || BN(triggerPrice || 0).isZero()) {
      return {
        type: InputErrors.EMPTY_TRIGGER_PRICE,
        value: triggerPrice,
        message: t.emptyTriggerPrice,
      };
    }
  }, [twapSDK, marketPrice, triggerPrice, module, t, typedSrcAmount]);
};

export const useTriggerPrice = () => {
  const { dstToken, marketPrice, module } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);
  const defaultTriggerPricePercent = useDefaultTriggerPricePercent();
  const typedPercent = useTwapStore((s) => s.state.triggerPricePercent);

  const setPercentage = useCallback(
    (triggerPricePercent?: number | null) => {
      if (module === Module.STOP_LOSS) {
        updateState({ triggerPricePercent: triggerPricePercent === null ? null : -Math.abs(triggerPricePercent || 0) });
      } else {
        updateState({ triggerPricePercent });
      }
    },
    [updateState, module],
  );

  const percentage = typedPercent === undefined ? defaultTriggerPricePercent : typedPercent;
  const enabled = module === Module.STOP_LOSS || module === Module.TAKE_PROFIT;

  return useInputWithPercentage({
    typedValue: useTwapStore((s) => s.state.typedTriggerPrice),
    percentage,
    tokenDecimals: dstToken?.decimals,
    initialPrice: enabled ? marketPrice : undefined,
    setValue: useCallback((typedTriggerPrice?: string) => updateState({ typedTriggerPrice }), [updateState]),
    setPercentage,
  });
};

export const useTriggerPricePanel = () => {
  const { translations: t, srcToken, dstToken, module, marketPrice, marketPriceLoading } = useTwapContext();
  const { amountUI, onChange, onPercentageChange, usd, percentDiffFromMarketPrice, percentage } = useTriggerPrice();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const updateState = useTwapStore((s) => s.updateState);
  const error = useTriggerPriceError();

  const { isInverted } = useInvertTrade();
  const defaultTriggerPricePercent = useDefaultTriggerPricePercent();

  const onSetMarketRate = useCallback(() => {
    updateState({ triggerPricePercent: null, typedTriggerPrice: undefined });
  }, [updateState, defaultTriggerPricePercent]);

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
    onSetMarketRate,
    usd,
    srcToken: isInverted ? dstToken : srcToken,
    dstToken: isInverted ? srcToken : dstToken,
    selectedPercentage: percentage,
    prefix: module === Module.STOP_LOSS ? prefixStopsLoss : prefixTakeProfit,
    isLoading: marketPriceLoading || !marketPrice,
  };
};
