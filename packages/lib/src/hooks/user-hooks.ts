import { amountUi, Module, TimeDuration, TimeUnit } from "@orbs-network/twap-sdk";
import { useCallback, useMemo, useState } from "react";
import { useTwapContext } from "../context";
import { useFillDelay } from "./use-fill-delay";
import { useChunks } from "./use-chunks";
import { useDuration } from "./use-duration";
import BN from "bignumber.js";
import { useTwapStore } from "../useTwapStore";
import { ORBS_WEBSITE_URL } from "../consts";
import { useLimitPrice } from "./use-limit-price";
import { formatDecimals, InputError, InputErrors, OrderHistoryCallbacks, useLimitPriceToggle, useOrders } from "..";
import { useDefaultLimitPricePercent, useDefaultTriggerPricePercent } from "./use-default-values";
import { useCancelOrderMutation } from "./use-cancel-order";
import { useTriggerPrice } from "./use-trigger-price";
import { useAmountBN, useAmountUi, useShouldWrapOrUnwrapOnly, useUsdAmount } from "./helper-hooks";
import { useMaxSrcAmount } from "./use-src-amount";

export const useFillDelayPanel = () => {
  const { onChange, fillDelay, error } = useFillDelay();
  const { translations: t } = useTwapContext();
  const onInputChange = useCallback((value: string) => onChange({ unit: fillDelay.unit, value: Number(value) }), [onChange, fillDelay]);
  const onUnitSelect = useCallback((unit: TimeUnit) => onChange({ unit, value: fillDelay.value }), [onChange, fillDelay]);

  return {
    onInputChange,
    onUnitSelect,
    onChange,
    milliseconds: fillDelay.unit * fillDelay.value,
    value: fillDelay,
    error,
    label: t.tradeIntervalTitle,
    tooltip: t.tradeIntervalTootlip,
  };
};

export const useTradesPanel = () => {
  const { translations: t, srcToken, dstToken } = useTwapContext();
  const { onChange, amount, amountPerTradeUsd, amountPerTrade, error, maxAmount } = useChunks();

  return {
    error,
    maxAmount,
    value: amount,
    amountPerTrade,
    onChange,
    label: t.tradesAmountTitle,
    tooltip: t.totalTradesTooltip,
    amountPerTradeUsd,
    sellToken: srcToken,
    buyToken: dstToken,
  };
};

export const useDurationPanel = (chunks: number, fillDelay: TimeDuration) => {
  const { translations: t, module } = useTwapContext();
  const { duration, setDuration, error } = useDuration(chunks, fillDelay);

  const onInputChange = useCallback(
    (value: string) => {
      setDuration({ unit: duration.unit, value: Number(value) });
    },
    [setDuration, duration]
  );

  const onUnitSelect = useCallback(
    (unit: TimeUnit) => {
      setDuration({ unit, value: duration.value });
    },
    [setDuration, duration]
  );

  const tooltip = useMemo(() => {
    if (module === Module.STOP_LOSS) {
      return t.stopLossDurationTooltip;
    }
    return t.maxDurationTooltip;
  }, [t, module]);

  return {
    value: duration,
    onChange: setDuration,
    milliseconds: duration.unit * duration.value,
    onInputChange,
    onUnitSelect,
    label: t.expiry,
    tooltip,
    error,
  };
};

export const useMarketPriceDisplay = () => {
  const { srcToken, dstToken, marketPrice } = useTwapContext();
  const [invert, setInvert] = useState(false);

  const price = useMemo(() => {
    const amountUI = amountUi(dstToken?.decimals, marketPrice);
    if (invert) {
      return BN(1)
        .div(amountUI || 0)
        .toFixed();
    }
    return amountUI;
  }, [invert, marketPrice, srcToken?.decimals, dstToken?.decimals]);

  return {
    sellToken: invert ? dstToken : srcToken,
    buyToken: invert ? srcToken : dstToken,
    price,
    onInvert: useCallback(() => setInvert(!invert), [invert]),
  };
};

export const useDisclaimer = () => {
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const { translations: t } = useTwapContext();
  return useMemo(() => {
    return {
      type: isMarketOrder ? "market" : "limit",
      text: isMarketOrder ? t.marketOrderWarning : t.limitPriceMessage,
      url: "https://www.orbs.com/dtwap-and-dlimit-faq/",
    };
  }, [isMarketOrder, t]);
};

export const useTriggerPriceWarning = () => {
  const { triggerPricePercent } = useTwapStore((s) => s.state);
  const { translations: t, module } = useTwapContext();

  return useMemo(() => {
    if (module !== Module.STOP_LOSS) return;

    return {
      text: t.triggerMarketPriceDisclaimer,
      url: ORBS_WEBSITE_URL,
    };
  }, [triggerPricePercent, t, module]);
};

export const useLimitPricePanel = () => {
  const { translations: t, module, srcToken, dstToken, marketPrice, marketPriceLoading } = useTwapContext();
  const { amountUI, onChange, onPercentageChange, usd, percentDiffFromMarketPrice, percentage, error } = useLimitPrice();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const updateState = useTwapStore((s) => s.updateState);
  const isInverted = useTwapStore((s) => s.state.isInvertedTrade);
  const defaultLimitPricePercent = useDefaultLimitPricePercent();
  const { isLimitPrice, toggleLimitPrice } = useLimitPriceToggle();

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
    sellToken: isInverted ? dstToken : srcToken,
    buyToken: isInverted ? srcToken : dstToken,
    selectedPercentage: percentage,
    isInverted,
    prefix: module === Module.STOP_LOSS ? stopLossPrefix : takeProfitPrefix,
    isLoading: marketPriceLoading || !marketPrice,
    isLimitPrice,
    toggleLimitPrice,
  };
};

export const useTriggerPricePanel = () => {
  const { translations: t, srcToken, dstToken, module, marketPrice, marketPriceLoading } = useTwapContext();
  const { amountUI, onChange, onPercentageChange, usd, percentDiffFromMarketPrice, percentage, error } = useTriggerPrice();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const updateState = useTwapStore((s) => s.updateState);

  const isInverted = useTwapStore((s) => s.state.isInvertedTrade);
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
    sellToken: isInverted ? dstToken : srcToken,
    buyToken: isInverted ? srcToken : dstToken,
    selectedPercentage: percentage,
    prefix: module === Module.STOP_LOSS ? prefixStopsLoss : prefixTakeProfit,
    isLoading: marketPriceLoading || !marketPrice,
  };
};

export const useOrderHistoryPanel = () => {
  const { orders, isLoading: orderLoading, refetch, isRefetching } = useOrders();
  const { mutateAsync: cancelOrder, isLoading: isCancelOrdersLoading } = useCancelOrderMutation();
  const updateState = useTwapStore((s) => s.updateState);

  const onClosePreview = useCallback(() => {
    updateState({ selectedOrderID: undefined });
  }, [updateState]);

  const onCancelOrders = useCallback(
    (orderIds: string[], callbacks?: OrderHistoryCallbacks) => {
      return cancelOrder({ orderIds, callbacks });
    },
    [cancelOrder]
  );

  return {
    orders,
    isLoading: orderLoading,
    refetch,
    isRefetching,
    onClosePreview,
    onCancelOrders,
    openOrdersCount: orders?.OPEN?.length || 0,
    isCancelOrdersLoading,
  };
};

const useTokenPanel = (isSrcToken: boolean, dstAmount?: string) => {
  const { marketPriceLoading, srcToken, dstToken, srcBalance, dstBalance, translations: t } = useTwapContext();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const updateState = useTwapStore((s) => s.updateState);
  const { srcUsd1Token, dstUsd1Token } = useTwapContext();
  const srcUsd = useUsdAmount(typedSrcAmount, srcUsd1Token);
  const dstUsd = useUsdAmount(dstAmount, dstUsd1Token);
  const isWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();
  const maxSrcInputAmount = useMaxSrcAmount();
  const srcAmountWei = useAmountBN(srcToken?.decimals, typedSrcAmount);

  const token = isSrcToken ? srcToken : dstToken;
  const balance = useAmountUi(token?.decimals, isSrcToken ? srcBalance : dstBalance);
  const error = useMemo((): InputError | undefined => {
    const isNativeTokenAndValueBiggerThanMax = maxSrcInputAmount && BN(srcAmountWei)?.gt(maxSrcInputAmount);

    if ((srcBalance && BN(srcAmountWei).gt(srcBalance)) || isNativeTokenAndValueBiggerThanMax) {
      return {
        type: InputErrors.INSUFFICIENT_BALANCE,
        message: t.insufficientFunds,
        value: srcBalance || "",
      };
    }
  }, [srcBalance?.toString(), srcAmountWei, maxSrcInputAmount?.toString(), t]);

  const onChange = useCallback(
    (value: string) => {
      if (!isSrcToken) return;
      updateState({ typedSrcAmount: value });
    },
    [updateState, isSrcToken]
  );

  return {
    balance,
    usd: isSrcToken ? srcUsd : isWrapOrUnwrapOnly ? srcUsd : dstUsd,
    value: isWrapOrUnwrapOnly || isSrcToken ? typedSrcAmount : formatDecimals(dstAmount || "", 8),
    onChange,
    isLoading: isSrcToken ? false : marketPriceLoading,
    token,
    isInsufficientBalance: isSrcToken ? error : undefined,
  };
};

export const useSrcTokenPanel = () => {
  return useTokenPanel(true);
};

export const useDstTokenPanel = (dstAmount?: string) => {
  return useTokenPanel(false, dstAmount);
};
