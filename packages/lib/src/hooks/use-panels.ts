import { amountUi, Module, Order, OrderStatus, TimeUnit } from "@orbs-network/twap-sdk";
import { useCallback, useMemo, useState } from "react";
import { useTwapContext } from "../context/twap-context";
import { useFillDelay } from "./use-fill-delay";
import { useDuration } from "./use-duration";
import BN from "bignumber.js";
import { useTwapStore } from "../useTwapStore";
import { ORBS_WEBSITE_URL } from "../consts";
import { useLimitPrice, useLimitPriceToggle } from "./use-limit-price";
import { formatDecimals, InputError, InputErrors, OrderHistoryCallbacks, SwapCallbacks, SwapExecution, SwapStatus } from "..";
import { useDefaultLimitPricePercent } from "./use-default-values";
import { useCancelOrderMutation } from "./use-cancel-order";
import { useTriggerPrice } from "./use-trigger-price";
import { useAmountBN, useAmountUi, useShouldWrapOrUnwrapOnly, useUsdAmount } from "./helper-hooks";
import { useMaxSrcAmount, useSrcAmount } from "./use-src-amount";
import { useDstTokenAmount } from "./use-dst-amount";
import { useMinChunkSizeUsd } from "./use-min-chunk-size-usd";
import { useTrades } from "./use-trades";
import { useOrders, useOrderToDisplay, useSelectedOrderIdsToCancel } from "./order-hooks";
import { useMutation } from "@tanstack/react-query";
import { useSubmitOrderMutation } from "./use-submit-order";
import { useCurrentOrderDetails } from "./use-current-order";
import { useHistoryOrder } from "./use-history-order";
import { useInputErrors } from "./use-input-errors";

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
    fillDelay,
    error,
    label: t.tradeIntervalTitle,
    tooltip: t.tradeIntervalTootlip,
  };
};

export const useTradesPanel = () => {
  const { translations: t, srcToken, dstToken } = useTwapContext();
  const { onChange, totalTrades, amountPerTradeUsd, amountPerTradeUI, error, maxTrades, amountPerTradeWei } = useTrades();

  return {
    error,
    maxTrades,
    totalTrades,
    amountPerTrade: amountPerTradeUI,
    amountPerTradeWei,
    onChange,
    label: t.tradesAmountTitle,
    tooltip: t.totalTradesTooltip,
    amountPerTradeUsd,
    fromToken: srcToken,
    toToken: dstToken,
  };
};

export const useDurationPanel = () => {
  const { translations: t, module } = useTwapContext();
  const { duration, setDuration, error } = useDuration();

  const onInputChange = useCallback(
    (value: string) => {
      setDuration({ unit: duration.unit, value: Number(value) });
    },
    [setDuration, duration],
  );

  const onUnitSelect = useCallback(
    (unit: TimeUnit) => {
      setDuration({ unit, value: duration.value });
    },
    [setDuration, duration],
  );

  const tooltip = useMemo(() => {
    if (module === Module.STOP_LOSS) {
      return t.stopLossDurationTooltip;
    }
    return t.maxDurationTooltip;
  }, [t, module]);

  return {
    duration,
    onChange: setDuration,
    milliseconds: duration.unit * duration.value,
    onInputChange,
    onUnitSelect,
    label: t.expiry,
    tooltip,
    error,
  };
};

export const useMarketPricePanel = () => {
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
    fromToken: invert ? dstToken : srcToken,
    toToken: invert ? srcToken : dstToken,
    price,
    priceWei: useAmountBN(dstToken?.decimals, marketPrice),
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

export const useLimitPricePanel = () => {
  const { translations: t, module, srcToken, dstToken, marketPrice, marketPriceLoading } = useTwapContext();
  const { amountUI, onChange, onPercentageChange, usd, percentDiffFromMarketPrice, percentage, error } = useLimitPrice();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const updateState = useTwapStore((s) => s.updateState);
  const isInverted = useTwapStore((s) => s.state.isInvertedTrade);
  const defaultLimitPricePercent = useDefaultLimitPricePercent();
  const { isLimitPrice, toggleLimitPrice } = useLimitPriceToggle();
  const { triggerPricePercent } = useTwapStore((s) => s.state);

  const hide = module === Module.LIMIT;

  const warning = useMemo(() => {
    if (module !== Module.STOP_LOSS) return;

    return {
      text: t.triggerMarketPriceDisclaimer,
      url: ORBS_WEBSITE_URL,
    };
  }, [triggerPricePercent, t, module]);

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
    warning,
    label: t.limitPrice,
    tooltip,
    onChange,
    onPercentageChange,
    marketDiffPercentage: percentDiffFromMarketPrice,
    isActive: !isMarketOrder,
    onReset: reset,
    usd,
    fromToken: isInverted ? dstToken : srcToken,
    toToken: isInverted ? srcToken : dstToken,
    selectedPercentage: percentage,
    isInverted,
    prefix: module === Module.STOP_LOSS ? stopLossPrefix : takeProfitPrefix,
    isLoading: marketPriceLoading || !marketPrice,
    isLimitPrice,
    toggleLimitPrice,
    hide,
  };
};

export const useTriggerPricePanel = () => {
  const { translations: t, srcToken, dstToken, module, marketPrice, marketPriceLoading } = useTwapContext();
  const { amountUI, onChange, onPercentageChange, usd, percentDiffFromMarketPrice, percentage, error } = useTriggerPrice();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const updateState = useTwapStore((s) => s.updateState);

  const isInverted = useTwapStore((s) => s.state.isInvertedTrade);

  const onSetDefault = useCallback(() => {
    updateState({ triggerPricePercent: undefined, typedTriggerPrice: undefined });
  }, [updateState]);

  const prefixStopsLoss = isInverted ? "+" : "-";
  const prefixTakeProfit = isInverted ? "-" : "+";
  const hide = module !== Module.STOP_LOSS && module !== Module.TAKE_PROFIT;

  return {
    price: amountUI,
    error,
    label: t.stopLossLabel,
    tooltip: t.stopLossTooltip,
    onChange,
    onPercentageChange,
    marketDiffPercentage: percentDiffFromMarketPrice,
    isActive: !isMarketOrder,
    onSetDefault,
    usd,
    fromToken: isInverted ? dstToken : srcToken,
    toToken: isInverted ? srcToken : dstToken,
    selectedPercentage: percentage,
    prefix: module === Module.STOP_LOSS ? prefixStopsLoss : prefixTakeProfit,
    isLoading: marketPriceLoading || !marketPrice,
    isInverted,
    hide,
  };
};

export const useOrderHistoryPanel = () => {
  const { translations: t } = useTwapContext();
  const { orders, isLoading: orderLoading, refetch, isRefetching } = useOrders();
  const { mutateAsync: cancelOrder, isLoading: isCancelOrdersLoading } = useCancelOrderMutation();
  const ordersToDisplay = useOrderToDisplay();
  const updateState = useTwapStore((s) => s.updateState);
  const selectedStatus = useTwapStore((s) => s.state.orderHistoryStatusFilter);
  const cancelOrdersMode = useTwapStore((s) => s.state.cancelOrdersMode);
  const orderIdsToCancel = useTwapStore((s) => s.state.orderIdsToCancel);
  const onToggleCancelOrdersMode = useCallback((cancelOrdersMode: boolean) => updateState({ cancelOrdersMode, orderIdsToCancel: [] }), [updateState]);
  const onClosePreview = useCallback(() => updateState({ selectedOrderID: undefined }), [updateState]);
  const onCancelOrders = useCallback((orders: Order[], callbacks?: OrderHistoryCallbacks) => cancelOrder({ orders, callbacks }), [cancelOrder]);
  const onSelectStatus = useCallback((status?: OrderStatus) => updateState({ orderHistoryStatusFilter: status }), []);

  const statuses = useMemo(() => {
    const result = Object.keys(OrderStatus).map((it) => {
      return {
        text: it,
        value: it,
      };
    });
    return [{ text: t.allOrders, value: "" }, ...result];
  }, [t]);

  const onSelectOrder = useSelectedOrderIdsToCancel();
  const selectedOrderID = useTwapStore((s) => s.state.selectedOrderID);
  const selectedOrder = useHistoryOrder(selectedOrderID);
  const ordersToCancel = useMemo(() => orders.all.filter((order) => orderIdsToCancel?.includes(order.id)), [orders, orderIdsToCancel]);

  return {
    refetch,
    onClosePreview,
    onCancelOrders,
    onSelectStatus,
    onToggleCancelOrdersMode,
    onSelectOrder,
    isRefetching,
    orders,
    ordersToDisplay,
    isLoading: orderLoading,
    selectedOrder: selectedOrderID ? selectedOrder : undefined,
    openOrdersCount: orders?.open?.length || 0,
    isCancelOrdersLoading,
    selectedStatus: selectedStatus || statuses[0].value,
    statuses,
    cancelOrdersMode,
    ordersToCancel,
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
    [updateState, isSrcToken],
  );

  const value = isWrapOrUnwrapOnly || isSrcToken ? typedSrcAmount : formatDecimals(dstAmount || "", 8);

  return {
    balance,
    usd: isSrcToken ? srcUsd : isWrapOrUnwrapOnly ? srcUsd : dstUsd,
    value,
    valueWei: useAmountBN(token?.decimals, value),
    onChange,
    isLoading: isSrcToken ? false : marketPriceLoading,
    token,
    isInsufficientBalance: isSrcToken ? error : undefined,
  };
};

export const useSrcTokenPanel = () => useTokenPanel(true);

export const useDstTokenPanel = () => {
  const dstAmount = useDstTokenAmount().amountUI;
  return useTokenPanel(false, dstAmount);
};

export const useSubmitSwapPanel = () => {
  const { marketPrice, srcToken, dstToken, marketPriceLoading, srcBalance, srcUsd1Token, noLiquidity, translations: t } = useTwapContext();
  const submitOrderMutation = useSubmitOrderMutation();
  const updateState = useTwapStore((s) => s.updateState);
  const { amountUI: srcAmountUI, amountWei: srcAmountWei } = useSrcAmount();
  const resetSwap = useTwapStore((s) => s.resetState);
  const swapExecution = useTwapStore((s) => s.state.swapExecution);
  const fetchingAllowance = useTwapStore((s) => s.state.fetchingAllowance);
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const minChunkSizeUsd = useMinChunkSizeUsd();
  const isPropsLoading = marketPriceLoading || BN(srcUsd1Token || "0").isZero() || srcBalance === undefined || !minChunkSizeUsd;
  const buttonLoading = Boolean(srcToken && dstToken && typedSrcAmount && isPropsLoading);
  const inputsError = useInputErrors();

  const buttonText = useMemo(() => {
    if (noLiquidity) return t.noLiquidity;
    if (BN(typedSrcAmount || "0").isZero()) return t.enterAmount;
    if (inputsError?.type === InputErrors.INSUFFICIENT_BALANCE) return t.insufficientFunds;
    return t.placeOrder;
  }, [inputsError, t, typedSrcAmount, noLiquidity]);

  const onCloseModal = useCallback(() => {
    if (swapExecution?.status === SwapStatus.SUCCESS) {
      resetSwap();
    }
  }, [swapExecution?.status, resetSwap]);

  const onOpenModal = useCallback(() => {
    if (swapExecution?.status !== SwapStatus.LOADING) {
      updateState({ acceptedSrcAmount: undefined, acceptedMarketPrice: undefined, swapExecution: {} as SwapExecution });
    }
  }, [updateState]);

  const submitSwapMutation = useMutation(async (callbacks?: SwapCallbacks) => {
    updateState({ acceptedSrcAmount: srcAmountUI, acceptedMarketPrice: marketPrice });

    // callbacks?.createOrder?.onRequest?.(data);
    const result = await submitOrderMutation.mutateAsync(callbacks);
    // callbacks?.createOrder?.onSuccess?.({
    //   ...data,
    //   receipt: " " ,
    // });
    return result;
  });

  const onSubmitOrder = useCallback((callbacks?: SwapCallbacks) => submitSwapMutation.mutateAsync(callbacks), [submitSwapMutation]);
  const order = useCurrentOrderDetails();

  return useMemo(() => {
    return {
      resetSwap,
      onCloseModal,
      onOpenModal,
      onSubmitOrder,
      ...swapExecution,
      swapLoading: swapExecution?.status === SwapStatus.LOADING || fetchingAllowance,
      swapSubmitted: Boolean(swapExecution?.status),
      order,
      srcAmountWei,
      srcAmount: srcAmountWei,
      openSubmitModalButton: {
        disabled: Boolean(inputsError || noLiquidity || buttonLoading || BN(typedSrcAmount || "0").isZero() || !srcToken || !dstToken),
        text: buttonText,
        loading: buttonLoading,
      },
    };
  }, [
    swapExecution,
    fetchingAllowance,
    srcToken,
    dstToken,
    order,
    resetSwap,
    onCloseModal,
    onOpenModal,
    onSubmitOrder,
    buttonText,
    buttonLoading,
    inputsError,
    noLiquidity,
    typedSrcAmount,
  ]);
};

export const useDisclaimerPanel = () => {
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const { translations: t, module } = useTwapContext();

  const hide = module === Module.STOP_LOSS || module === Module.TAKE_PROFIT;
  return useMemo(() => {
    if (hide) return;
    return {
      text: isMarketOrder ? t.marketOrderWarning : t.limitPriceMessage,
      url: "https://www.orbs.com/dtwap-and-dlimit-faq/",
    };
  }, [isMarketOrder, t, hide]);
};
