import { useCallback, useMemo } from "react";
import BN from "bignumber.js";
import { useTwapContext } from "../context/twap-context";
import { useTwapStore } from "../useTwapStore";
import { useInputWithPercentage } from "./use-input-with-percentage";
import { InputError, InputErrors, Module } from "../types";
import { useDefaultTriggerPricePercent } from "./use-default-values";
import { getStopLossPriceError, getTakeProfitPriceError, getTriggerPricePerChunk } from "@orbs-network/twap-sdk";
import { useAmountUi } from "./helper-hooks";
import { useTrades } from "./use-trades";
import { useTranslations } from "./use-translations";
import { useInvertTradePanel } from "./use-invert-trade-panel";

const useTriggerPriceError = (triggerPriceWei = "") => {
  const { module, marketPrice } = useTwapContext();
  const t = useTranslations();

  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  return useMemo((): InputError | undefined => {
    if (BN(typedSrcAmount || "0").isZero() || !marketPrice) return;
    if (module !== Module.STOP_LOSS && module !== Module.TAKE_PROFIT) return;
    const stopLossError = getStopLossPriceError(marketPrice || "", triggerPriceWei || "", module);
    if (stopLossError?.isError) {
      return {
        type: InputErrors.STOP_LOSS_TRIGGER_PRICE_GREATER_THAN_MARKET_PRICE,
        value: stopLossError.value,
        message: t("StopLossTriggerPriceError") || "",
      };
    }
    const takeProfitError = getTakeProfitPriceError(marketPrice || "", triggerPriceWei || "", module);

    if (takeProfitError?.isError) {
      return {
        type: InputErrors.TAKE_PROFIT_TRIGGER_PRICE_LESS_THAN_MARKET_PRICE,
        value: takeProfitError.value,
        message: t("TakeProfitTriggerPriceError") || "",
      };
    }

    if (!triggerPriceWei || BN(triggerPriceWei || 0).isZero()) {
      return {
        type: InputErrors.EMPTY_TRIGGER_PRICE,
        value: triggerPriceWei,
        message: t("emptyTriggerPrice") || "",
      };
    }
  }, [marketPrice, triggerPriceWei, module, t, typedSrcAmount]);
};

export const useTriggerAmountPerChunk = (triggerPrice?: string) => {
  const { srcToken, dstToken, module } = useTwapContext();
  const amountPerTrade = useTrades().amountPerTradeWei;
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);

  const result = useMemo(() => {
    return getTriggerPricePerChunk(module, amountPerTrade, triggerPrice, srcToken?.decimals || 0);
  }, [triggerPrice, amountPerTrade, isMarketOrder, srcToken?.decimals, module]);

  return {
    amountWei: result,
    amountUI: useAmountUi(dstToken?.decimals || 0, result),
  };
};

export const useTriggerPrice = () => {
  const { dstToken, marketPrice, module } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);
  const defaultTriggerPricePercent = useDefaultTriggerPricePercent();
  const typedPercent = useTwapStore((s) => s.state.triggerPricePercent);

  const setPercentage = useCallback(
    (triggerPricePercent?: number | null) => {
      updateState({ triggerPricePercent });
    },
    [updateState],
  );

  const percentage = typedPercent === undefined ? defaultTriggerPricePercent : typedPercent;
  const enabled = module === Module.STOP_LOSS || module === Module.TAKE_PROFIT;

  const result = useInputWithPercentage({
    typedValue: useTwapStore((s) => s.state.typedTriggerPrice),
    percentage,
    tokenDecimals: dstToken?.decimals,
    initialPrice: enabled ? marketPrice : undefined,
    setValue: useCallback((typedTriggerPrice?: string) => updateState({ typedTriggerPrice }), [updateState]),
    setPercentage,
  });
  const error = useTriggerPriceError(result.amountWei);
  const { amountWei: triggerAmountPerChunk, amountUI: triggerAmountPerChunkUI } = useTriggerAmountPerChunk(result.amountWei);

  return useMemo(() => {
    return {
      ...result,
      error,
      pricePerChunkWei: triggerAmountPerChunk,
      pricePerChunkUI: triggerAmountPerChunkUI,
    };
  }, [result, error, triggerAmountPerChunk, triggerAmountPerChunkUI]);
};

export const useTriggerPricePanel = () => {
  const { module, marketPrice, marketPriceLoading } = useTwapContext();
  const t = useTranslations();
  const { amountUI, onChange, onPercentageChange, usd, selectedPercentage, error } = useTriggerPrice();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const updateState = useTwapStore((s) => s.updateState);
  const { isInverted, onInvert, fromToken, toToken } = useInvertTradePanel();

  const onSetDefault = useCallback(() => {
    updateState({ triggerPricePercent: undefined, typedTriggerPrice: undefined });
  }, [updateState]);

  const hide = module !== Module.STOP_LOSS && module !== Module.TAKE_PROFIT;

  return {
    price: amountUI,
    error,
    label: t("stopLossLabel"),
    tooltip: t("stopLossTooltip"),
    onChange,
    onPercentageChange,
    selectedPercentage,
    isActive: !isMarketOrder,
    onSetDefault,
    usd,
    fromToken,
    toToken,
    prefix: "",
    isLoading: marketPriceLoading || !marketPrice,
    isInverted,
    hide,
    onInvert,
  };
};
