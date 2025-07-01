import { amountUi, TimeUnit } from "@orbs-network/twap-sdk";
import { useCallback, useMemo } from "react";
import { useTwapContext } from "../context";
import {
  useAmountUi,
  useBalanceError,
  useChunks,
  useChunksError,
  useDestTokenAmount,
  useFillDelay,
  useFillDelayError,
  useInputsError,
  useLimitPrice,
  useLimitPriceError,
  useMinChunkSizeUsd,
  useMinTradeSizeError,
  useOnOpenConfirmationModal,
  useOrderDuration,
  useOrderDurationError,
  usePriceDiffFromMarketPercent,
  useShouldOnlyWrap,
  useShouldUnwrap,
  useShouldWrapOrUnwrapOnly,
  useSrcChunkAmountUSD,
  useSrcTokenChunkAmount,
  useUsdAmount,
} from "./logic-hooks";
import BN from "bignumber.js";
import { useFormatNumber } from "./useFormatNumber";
import { useCancelOrder, useUnwrapToken, useWrapOnly } from "./send-transactions-hooks";
import { SwapStatus } from "@orbs-network/swap-ui";
import { useTwapStore } from "../useTwapStore";
import { formatDecimals } from "../utils";
import { useOrderHistoryContext } from "../twap/orders/context";
import { useOrders } from "./order-hooks";

const defaultPercent = [1, 5, 10];

const useDerivedLimitPrice = () => {
  const { amountUI: limitPriceUI } = useLimitPrice();
  const typedPrice = useTwapStore((s) => s.state.typedPrice);
  const isInvertedPrice = useTwapStore((s) => s.state.isInvertedPrice);

  const result = useMemo(() => {
    if (typedPrice !== undefined) return typedPrice;
    if (isInvertedPrice && limitPriceUI) {
      return BN(formatDecimals(BN(1).div(limitPriceUI).toFixed())).toFixed();
    }

    return !limitPriceUI ? "" : BN(formatDecimals(limitPriceUI)).toFixed();
  }, [typedPrice, limitPriceUI, isInvertedPrice]);
  return result;
};
const useLimitPriceLoading = () => {
  const { srcToken, dstToken, marketPrice } = useTwapContext();
  return Boolean(srcToken && dstToken && BN(marketPrice || 0).isZero());
};

export const useLimitPriceInput = () => {
  const { onChange: onLimitPriceChange } = useLimitPrice();
  const updateState = useTwapStore((s) => s.updateState);

  const onChange = useCallback(
    (value: string) => {
      onLimitPriceChange(value);
      updateState({ selectedPricePercent: undefined });
    },
    [onLimitPriceChange, updateState],
  );

  return {
    value: useDerivedLimitPrice(),
    onChange,
    isLoading: useLimitPriceLoading(),
  };
};

export const useLimitPricePercentSelect = () => {
  const { dstToken, marketPrice } = useTwapContext();
  const isLoading = useLimitPriceLoading();
  const { onChange: onPriceChange, amountUI: limitPrice } = useLimitPrice();
  const priceDiffFromMarket = usePriceDiffFromMarketPercent();

  const updateState = useTwapStore((s) => s.updateState);
  const isInvertedPrice = useTwapStore((s) => s.state.isInvertedPrice);
  const selectedPricePercent = useTwapStore((s) => s.state.selectedPricePercent);

  const onPercent = useCallback(
    (percent?: string) => {
      if (isLoading) return;
      updateState({ selectedPricePercent: percent });

      if (!percent || BN(percent).isZero()) {
        onPriceChange(undefined);
        return;
      }

      const multiplier = BN(percent).div(100).plus(1);
      let basePrice = amountUi(dstToken?.decimals, marketPrice);

      if (isInvertedPrice && basePrice) {
        basePrice = formatDecimals(BN(1).div(basePrice).toFixed());
      }

      const computedPrice = formatDecimals(
        BN(basePrice || 0)
          .times(multiplier)
          .toFixed(),
      );
      onPriceChange(computedPrice);
    },
    [updateState, dstToken, marketPrice, isInvertedPrice, onPriceChange, isLoading],
  );

  const options = useMemo(() => {
    if (isInvertedPrice) {
      return defaultPercent.map((it) => -it).map((it) => it.toString());
    } else {
      return defaultPercent.map((it) => it.toString());
    }
  }, [isInvertedPrice]);

  const { buttons, isReset } = useMemo(() => {
    const isSelected = (percent: number) => (BN(limitPrice || 0).isZero() ? false : BN(selectedPricePercent || 0).eq(percent));
    const isReset = !BN(priceDiffFromMarket).isZero() && !options.includes(priceDiffFromMarket) && !selectedPricePercent;
    const prefix = BN(priceDiffFromMarket).gt(0) ? "+" : "";

    const resetButton = {
      text: isReset ? `${prefix}${priceDiffFromMarket}%` : "0%",
      selected: isReset || !selectedPricePercent ? true : false,
      onClick: () => onPercent("0"),
      isReset,
    };
    const buttons = options.map((option) => {
      return {
        text: `${BN(option || 0).isZero() ? "" : isInvertedPrice ? "-" : !isInvertedPrice && "+"} ${Math.abs(Number(option))} %`,
        selected: isSelected(Number(option)),
        onClick: () => onPercent(option),
        isReset: false,
      };
    });

    return {
      buttons: [resetButton, ...buttons],
      isReset,
    };
  }, [options, onPercent, limitPrice, selectedPricePercent, isInvertedPrice, priceDiffFromMarket]);

  return {
    onPercent,
    buttons,
    selected: selectedPricePercent,
    isReset,
  };
};

export const useLimitPriceOnInvert = () => {
  const updateState = useTwapStore((s) => s.updateState);
  const isInvertedPrice = useTwapStore((s) => s.state.isInvertedPrice);
  return useCallback(() => {
    updateState({
      isInvertedPrice: !isInvertedPrice,
      typedPrice: undefined,
      selectedPricePercent: undefined,
    });
  }, [updateState, isInvertedPrice]);
};

export const useLimitPriceTokens = () => {
  const { srcToken, dstToken } = useTwapContext();
  const isInvertedPrice = useTwapStore((s) => s.state.isInvertedPrice);
  return {
    topToken: isInvertedPrice ? dstToken : srcToken,
    bottomToken: isInvertedPrice ? srcToken : dstToken,
  };
};

export const useLimitPanelUsd = () => {
  const { srcUsd1Token, dstUsd1Token } = useTwapContext();
  const { value: limitPrice } = useLimitPriceInput();
  const isInvertedPrice = useTwapStore((s) => s.state.isInvertedPrice);

  return useUsdAmount(limitPrice, isInvertedPrice ? srcUsd1Token : dstUsd1Token);
};

export const useLimitPricePanel = () => {
  const tokens = useLimitPriceTokens();
  const error = useLimitPriceError();
  const input = useLimitPriceInput();
  const percent = useLimitPricePercentSelect();
  const onInvert = useLimitPriceOnInvert();
  const isInvertedPrice = useTwapStore((s) => s.state.isInvertedPrice);
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const usd = useLimitPanelUsd();

  return {
    tokens,
    error,
    input,
    percent,
    onInvert,
    isInverted: isInvertedPrice,
    usd,
    isLimitOrder: !isMarketOrder,
    hide: isMarketOrder,
  };
};

export const usePriceToggle = () => {
  const updateState = useTwapStore((s) => s.updateState);
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);

  const setIsMarketOrder = useCallback(
    (value: boolean) => {
      updateState({ isMarketOrder: value });
    },
    [updateState],
  );

  return {
    isMarketOrder,
    setIsMarketOrder,
  };
};

export const useFillDelayPanel = () => {
  const { setFillDelay, fillDelay } = useFillDelay();
  const error = useFillDelayError();
  const { translations: t } = useTwapContext();

  const onInputChange = useCallback(
    (value: string) => {
      setFillDelay({ unit: fillDelay.unit, value: Number(value) });
    },
    [setFillDelay, fillDelay],
  );

  const onUnitSelect = useCallback(
    (unit: TimeUnit) => {
      setFillDelay({ unit, value: fillDelay.value });
    },
    [setFillDelay, fillDelay],
  );

  return {
    onInputChange,
    onUnitSelect,
    setFillDelay,
    milliseconds: fillDelay.unit * fillDelay.value,
    fillDelay,
    error,
    title: t.tradeIntervalTitle,
    tooltip: t.tradeIntervalTootlip,
  };
};

export const useDisclaimerPanel = () => {
  const disclaimerAccepted = useTwapStore((s) => s.state.disclaimerAccepted);
  const setDisclaimerAccepted = useTwapStore((s) => s.updateState);

  return {
    disclaimerAccepted,
    setDisclaimerAccepted,
  };
};

export const useFee = () => {
  const { fee } = useTwapContext();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const destTokenAmount = useDestTokenAmount().amountUI;

  const amountUI = useMemo(() => {
    if (!fee || !destTokenAmount) return "";
    return BN(destTokenAmount).multipliedBy(fee).dividedBy(100).toFixed();
  }, [fee, destTokenAmount, isMarketOrder]);

  return {
    amountUI,
    percent: fee,
  };
};

export const useLimitPriceMessage = () => {
  const { translations: t } = useTwapContext();
  const hide = useShouldWrapOrUnwrapOnly();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  return useMemo(() => {
    if (isMarketOrder || hide) return null;

    return {
      text: t.limitPriceMessage,
      url: "https://www.orbs.com/dtwap-and-dlimit-faq/",
    };
  }, [t, isMarketOrder, hide]);
};

export const useTokenBalance = ({ isSrcToken }: { isSrcToken: boolean }) => {
  const { srcBalance, dstBalance } = useTwapContext();
  const token = useToken({ isSrcToken });
  return useAmountUi(token?.decimals, isSrcToken ? srcBalance : dstBalance);
};

export const useTokenUSD = ({ isSrcToken }: { isSrcToken: boolean }) => {
  const { srcUsd1Token, dstUsd1Token } = useTwapContext();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const dstAmountOut = useDestTokenAmount().amountUI;
  const srcUsd = useUsdAmount(typedSrcAmount, srcUsd1Token);
  const dstUsd = useUsdAmount(dstAmountOut, dstUsd1Token);

  const token = useToken({ isSrcToken });
  const isWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();
  const data = isSrcToken ? srcUsd : isWrapOrUnwrapOnly ? srcUsd : dstUsd;

  return {
    data: isSrcToken ? srcUsd : isWrapOrUnwrapOnly ? srcUsd : dstUsd,
    isLoading: Boolean(token && !data),
  };
};

export const useTokenInput = ({ isSrcToken }: { isSrcToken: boolean }) => {
  const { marketPriceLoading } = useTwapContext();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const updateState = useTwapStore((s) => s.updateState);
  const destTokenAmountUI = useDestTokenAmount().amountUI;
  const isWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();

  const onChange = useCallback(
    (value: string) => {
      if (!isSrcToken) return;
      updateState({ typedSrcAmount: value });
    },
    [updateState, isSrcToken],
  );
  return {
    value: isWrapOrUnwrapOnly || isSrcToken ? typedSrcAmount : formatDecimals(destTokenAmountUI, 8),
    onChange,
    isLoading: isSrcToken ? false : marketPriceLoading,
  };
};
export const useToken = ({ isSrcToken }: { isSrcToken: boolean }) => {
  const { srcToken, dstToken } = useTwapContext();
  return isSrcToken ? srcToken : dstToken;
};

export const useTokenPanel = ({ isSrcToken }: { isSrcToken: boolean }) => {
  return {
    balance: useTokenBalance({ isSrcToken }),
    usd: useTokenUSD({ isSrcToken }),
    input: useTokenInput({ isSrcToken }),
    token: useToken({ isSrcToken }),
    error: useBalanceError(),
  };
};

export const useDurationPanel = () => {
  const t = useTwapContext().translations;
  const { orderDuration: duration, setOrderDuration: setDuration } = useOrderDuration();
  const error = useOrderDurationError();

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
  return {
    duration,
    setDuration,
    durationMillis: duration.unit * duration.value,
    onInputChange,
    onUnitSelect,
    title: t.expiry,
    tooltip: t.maxDurationTooltip,
    error,
  };
};

export const useDisclaimerMessage = () => {
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

export const useChunkSizeMessage = () => {
  const chunkSize = useSrcChunkAmountUSD();
  const { amountUI } = useSrcTokenChunkAmount();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const chunkSizeError = useMinTradeSizeError();
  const { chunks } = useChunks();
  const error = !typedSrcAmount ? false : chunkSizeError;
  const amountUIF = useFormatNumber({ value: amountUI, decimalScale: 3 });
  const chunkSizeF = useFormatNumber({ value: chunkSize, decimalScale: 2 });
  const { srcToken, isLimitPanel } = useTwapContext();
  const isZero = isLimitPanel || !srcToken || BN(amountUI || 0).eq(0) || BN(chunkSize || 0).eq(0) || !chunks;
  return {
    hide: isLimitPanel,
    tokenAmount: isZero ? "0" : amountUIF,
    usdAmount: isZero ? "0" : chunkSizeF,
    error,
    token: srcToken,
    zeroAmount: isZero,
  };
};

export const usePriceModePanel = () => {
  const { isMarketOrder, setIsMarketOrder } = usePriceToggle();
  return {
    isMarketOrder,
    setIsMarketOrder,
  };
};

const useTradeSize = () => {
  const chunkSize = useSrcChunkAmountUSD();
  const { amountUI } = useSrcTokenChunkAmount();
  const { srcToken, isLimitPanel } = useTwapContext();
  const minTradeSizeError = useMinTradeSizeError();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const error = !typedSrcAmount ? false : minTradeSizeError;
  const amountUIF = useFormatNumber({ value: amountUI, decimalScale: 3 });
  const chunkSizeF = useFormatNumber({ value: chunkSize, decimalScale: 2 });

  return useMemo(() => {
    if (!chunkSizeF || isLimitPanel || !srcToken)
      return {
        value: amountUIF,
        token: srcToken,
        usd: chunkSizeF,
        error,
      };
  }, [amountUI, chunkSize, isLimitPanel, srcToken, error, amountUIF, chunkSizeF]);
};

export const useChunksPanel = () => {
  const { translations: t } = useTwapContext();
  const { setChunks, chunks } = useChunks();
  const error = useChunksError();
  const tradeSize = useTradeSize();
  return {
    error,
    trades: chunks,
    onChange: setChunks,
    label: t.tradesAmountTitle,
    tooltip: t.totalTradesTooltip,
    tradeSize,
  };
};

export const useShowOrderConfirmationModalButton = () => {
  const { srcUsd1Token, translations: t, marketPrice, marketPriceLoading, srcBalance, srcToken, dstToken, noLiquidity } = useTwapContext();

  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const swapStatus = useTwapStore((s) => s.state.swapStatus);

  const minChunkSizeUsd = useMinChunkSizeUsd();
  const balanceError = useBalanceError();
  const inputsError = useInputsError();
  const disabled = Boolean(balanceError || inputsError);

  const onOpen = useOnOpenConfirmationModal();
  const shouldUnwrap = useShouldUnwrap();
  const shouldOnlyWrap = useShouldOnlyWrap();

  const { mutate: wrap, isLoading: wrapLoading } = useWrapOnly();
  const { mutate: unwrap, isLoading: unwrapLoading } = useUnwrapToken();

  const zeroSrcAmount = BN(typedSrcAmount || "0").isZero();
  const zeroMarketPrice = !BN(marketPrice || 0).gt(0);

  const isPropsLoading = marketPriceLoading || BN(srcUsd1Token || "0").isZero() || srcBalance === undefined || !minChunkSizeUsd;

  const isButtonLoading = Boolean(srcToken && dstToken && typedSrcAmount && isPropsLoading);

  const makeButton = (text: string, onClick: () => void, loading = false, disabled = false) => ({ text, onClick, loading, disabled });

  // Handle no liquidity
  if (noLiquidity) {
    return makeButton(t.noLiquidity, () => {}, false, true);
  }

  // Handle wrap only
  if (shouldOnlyWrap) {
    return makeButton(t.wrap, () => wrap(), wrapLoading, wrapLoading);
  }

  // Handle unwrap
  if (shouldUnwrap) {
    return makeButton(t.unwrap, () => unwrap(), unwrapLoading, disabled || unwrapLoading);
  }

  // Default swap button
  const getSwapText = () => {
    if (!srcToken || !dstToken) return t.placeOrder;
    if (BN(typedSrcAmount || "0").isZero()) return t.enterAmount;
    if (marketPriceLoading) return t.outAmountLoading;
    if (isButtonLoading) return t.placeOrder;
    if (balanceError) return balanceError;
    return t.placeOrder;
  };

  const swapButton = makeButton(
    getSwapText(),
    onOpen,
    isButtonLoading,
    Boolean(swapStatus !== SwapStatus.LOADING && (zeroMarketPrice || isButtonLoading || disabled || zeroSrcAmount)),
  );

  return swapButton;
};

export const useOrderHistoryPanel = () => {
  const { orders, isLoading: orderLoading, refetch, isRefetching } = useOrders();
  const { mutateAsync: cancelOrder } = useCancelOrder();
  const { isOpen, onClose, onOpen } = useOrderHistoryContext();

  return {
    orders,
    isLoading: orderLoading,
    refetch,
    isRefetching,
    cancelOrder,
    isOpen,
    onClose,
    onOpen,
    openOrdersCount: orders?.OPEN?.length || 0,
  };
};
