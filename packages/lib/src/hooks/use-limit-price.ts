import { useCallback, useMemo } from "react";
import { useTwapContext } from "../context/twap-context";
import { useTwapStore } from "../useTwapStore";
import { useInputWithPercentage } from "./use-input-with-percentage";
import { InputErrors, InputError, Module } from "../types";
import BN from "bignumber.js";
import { useTriggerPrice } from "./use-trigger-price";
import { useDefaultLimitPricePercent } from "./use-default-values";
import { getStopLossLimitPriceError, getTakeProfitLimitPriceError, ORBS_TWAP_FAQ_URL } from "@orbs-network/twap-sdk";
import { useTranslations } from "./use-translations";
import { useInvertTradePanel } from "./use-invert-trade-panel";

export const useLimitPriceError = (limitPriceWei?: string) => {
  const { module, marketPrice } = useTwapContext();
  const t = useTranslations();
  const { amountWei: triggerPrice } = useTriggerPrice();

  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  return useMemo((): InputError | undefined => {
    if (BN(typedSrcAmount || "0").isZero() || !triggerPrice || !marketPrice) return;
    const _stopLossError = getStopLossLimitPriceError(triggerPrice, limitPriceWei, isMarketOrder, module);
    const _takeProfitError = getTakeProfitLimitPriceError(triggerPrice, limitPriceWei, isMarketOrder, module);

    if (_stopLossError?.isError) {
      return {
        type: InputErrors.TRIGGER_LIMIT_PRICE_GREATER_THAN_TRIGGER_PRICE,
        message: t("triggerLimitPriceError") || "",
        value: _stopLossError.value,
      };
    }

    if (_takeProfitError?.isError) {
      return {
        type: InputErrors.TRIGGER_LIMIT_PRICE_GREATER_THAN_TRIGGER_PRICE,
        message: t("triggerLimitPriceError") || "",
        value: _takeProfitError.value,
      };
    }

    if (limitPriceWei && BN(limitPriceWei || 0).isZero()) {
      return {
        type: InputErrors.MISSING_LIMIT_PRICE,
        message: t("emptyLimitPrice") || "",
        value: limitPriceWei || "",
      };
    }
  }, [limitPriceWei, t, triggerPrice, module, isMarketOrder, typedSrcAmount, marketPrice]);
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
      (limitPricePercent?: string | null) => {
        updateState({ limitPricePercent });
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
  const defaultLimitPricePercent = useDefaultLimitPricePercent();
  const triggerPricePercent = useTwapStore((s) => s.state.triggerPricePercent) || 0;
  const hide = module === Module.LIMIT;

  const toggleLimitPrice = useCallback(() => {
    if (!isMarketOrder && module === Module.STOP_LOSS) {
      updateState({ limitPricePercent: defaultLimitPricePercent });
    }

    updateState({ isMarketOrder: !isMarketOrder });
  }, [updateState, triggerPricePercent, module, isMarketOrder, defaultLimitPricePercent]);

  return {
    isLimitPrice: !isMarketOrder,
    toggleLimitPrice,
    hide,
  };
};

export const useLimitPricePanel = () => {
  const { module, marketPriceLoading } = useTwapContext();
  const t = useTranslations();
  const { amountUI, onChange, onPercentageChange, usd, selectedPercentage, error } = useLimitPrice();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);

  const updateState = useTwapStore((s) => s.updateState);
  const defaultLimitPricePercent = useDefaultLimitPricePercent();
  const { isLimitPrice, toggleLimitPrice } = useLimitPriceToggle();
  const { triggerPricePercent } = useTwapStore((s) => s.state);
  const { isInverted, onInvert, fromToken, toToken } = useInvertTradePanel();

  const warning = useMemo(() => {
    if (module !== Module.STOP_LOSS || !isMarketOrder) return;

    return {
      text: t("triggerMarketPriceDisclaimer"),
      url: ORBS_TWAP_FAQ_URL,
    };
  }, [triggerPricePercent, t, module, isMarketOrder]);

  const reset = useCallback(() => {
    updateState({ typedLimitPrice: undefined });
    updateState({ limitPricePercent: defaultLimitPricePercent });
  }, [updateState, module, defaultLimitPricePercent]);

  const tooltip = useMemo(() => {
    if (module === Module.STOP_LOSS) {
      return t("stopLossLimitPriceTooltip");
    }
    return t("limitPriceTooltip");
  }, [t, module]);

  return {
    price: amountUI,
    error,
    warning,
    label: t("limitPrice"),
    tooltip,
    onChange,
    onPercentageChange,
    onReset: reset,
    usd,
    fromToken,
    toToken,
    percentage: selectedPercentage,
    isInverted,
    isLoading: marketPriceLoading,
    isLimitPrice,
    toggleLimitPrice,
    onInvert,
  };
};
