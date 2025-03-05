import { amountUi, TimeUnit } from "@orbs-network/twap-sdk";
import { useCallback, useMemo } from "react";
import { useTwapContext } from "../context";
import {
  useAmountUi,
  useBalanceError,
  useChunks,
  useDestTokenAmount,
  useDestTokenMinAmount,
  useError,
  useFillDelay,
  useLimitPrice,
  useNetwork,
  useOnCloseConfirmationModal,
  useOnOpenConfirmationModal,
  useOnSrcInputPercentClick,
  useOrderDeadline,
  useOrderDuration,
  usePriceDiffFromMarketPercent,
  useShouldOnlyWrap,
  useShouldUnwrap,
  useShouldWrapOrUnwrapOnly,
  useSrcChunkAmountUSD,
  useSrcTokenChunkAmount,
  useSwitchChain,
  useUsdAmount,
} from "./logic-hooks";
import BN from "bignumber.js";
import { useFormatNumber } from "./useFormatNumber";
import { useSubmitOrderCallback, useUnwrapToken, useWrapOnly } from "./send-transactions-hooks";
import { SwapStatus } from "@orbs-network/swap-ui";
import { useAccountOrders, useGroupedByStatusOrders } from "./order-hooks";

const defaultPercent = [1, 5, 10];

const useDerivedLimitPrice = () => {
  const {
    state: { typedPrice, isInvertedPrice },
  } = useTwapContext();
  const { amountUI: limitPriceUI } = useLimitPrice();

  return useMemo(() => {
    if (typedPrice !== undefined) return typedPrice;
    if (isInvertedPrice && limitPriceUI) {
      return BN(1).div(limitPriceUI).decimalPlaces(6).toString();
    }

    return !limitPriceUI ? "" : BN(limitPriceUI).decimalPlaces(6).toString();
  }, [typedPrice, limitPriceUI, isInvertedPrice]);
};
const useLimitPriceLoading = () => {
  const { srcToken, dstToken, marketPrice } = useTwapContext();
  return Boolean(srcToken && dstToken && BN(marketPrice || 0).isZero());
};

export const useLimitPriceSrcTokenSelect = () => {
  const {
    state: { isInvertedPrice },
    callbacks,
  } = useTwapContext();

  return useCallback(
    (token: any) => {
      if (isInvertedPrice) {
        callbacks.onDstTokenSelect?.(token);
      } else {
        callbacks.onSrcTokenSelect?.(token);
      }
    },
    [isInvertedPrice, callbacks.onDstTokenSelect, callbacks.onSrcTokenSelect],
  );
};

export const useLimitPriceDstTokenSelect = () => {
  const {
    state: { isInvertedPrice },
    callbacks,
  } = useTwapContext();

  return useCallback(
    (token: any) => {
      if (isInvertedPrice) {
        callbacks.onSrcTokenSelect?.(token);
      } else {
        callbacks.onDstTokenSelect?.(token);
      }
    },
    [isInvertedPrice, callbacks.onDstTokenSelect, callbacks.onSrcTokenSelect],
  );
};

export const useShouldHideLimitPricePanel = () => {
  const isMarketOrder = useTwapContext().state.isMarketOrder;
  const shouldWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();

  return isMarketOrder || shouldWrapOrUnwrapOnly;
};

export const useLimitPriceInput = () => {
  const { onChange: onLimitPriceChange } = useLimitPrice();
  const { updateState } = useTwapContext();

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
  const {
    dstToken,
    marketPrice,
    state: { isInvertedPrice, selectedPricePercent },
    updateState,
  } = useTwapContext();
  const isLoading = useLimitPriceLoading();
  const { onChange: onPriceChange, amountUI: limitPrice } = useLimitPrice();
  const priceDiffFromMarket = usePriceDiffFromMarketPercent();

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
        basePrice = BN(1).div(basePrice).toString();
      }

      const computedPrice = BN(basePrice || 0)
        .times(multiplier)
        .decimalPlaces(6)
        .toString();
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

  const buttons = useMemo(() => {
    const isSelected = (percent: number) => (BN(limitPrice || 0).isZero() ? false : BN(selectedPricePercent || 0).eq(percent));
    const isReset = !BN(priceDiffFromMarket).isZero() && !options.includes(priceDiffFromMarket) && !selectedPricePercent;

    const resetButton = {
      text: isReset ? `${priceDiffFromMarket}%` : "0%",
      selected: isReset ? true : false,
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

    return [resetButton, ...buttons];
  }, [options, onPercent, limitPrice, selectedPricePercent, isInvertedPrice, priceDiffFromMarket]);

  return {
    onPercent,
    buttons,
    selected: selectedPricePercent,
  };
};

export const useLimitPriceOnInvert = () => {
  const {
    state: { isInvertedPrice },
    updateState,
  } = useTwapContext();
  return useCallback(() => {
    updateState({
      isInvertedPrice: !isInvertedPrice,
      typedPrice: undefined,
      selectedPricePercent: undefined,
    });
  }, [updateState, isInvertedPrice]);
};

export const useLimitPriceTokens = () => {
  const {
    srcToken,
    dstToken,
    state: { isInvertedPrice },
  } = useTwapContext();

  return {
    srcToken: isInvertedPrice ? dstToken : srcToken,
    destToken: isInvertedPrice ? srcToken : dstToken,
  };
};

export const useLimitPriceError = () => {
  const { error } = useLimitPrice();
  return error;
};

export const useTokenBalance = ({ isSrcToken }: { isSrcToken: boolean }) => {
  const { srcBalance, dstBalance } = useTwapContext();
  const token = useToken({ isSrcToken });
  return useAmountUi(token?.decimals, isSrcToken ? srcBalance : dstBalance);
};

export const useTokenUSD = ({ isSrcToken }: { isSrcToken: boolean }) => {
  const { srcUsd, dstUsd } = useUsdAmount();
  const token = useToken({ isSrcToken });
  const isWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();
  const data = isSrcToken ? srcUsd : isWrapOrUnwrapOnly ? srcUsd : dstUsd;

  return {
    data: isSrcToken ? srcUsd : isWrapOrUnwrapOnly ? srcUsd : dstUsd,
    isLoading: token && !data,
  };
};

export const useTokenSelect = ({ isSrcToken }: { isSrcToken: boolean }) => {
  const { callbacks } = useTwapContext();
  return useCallback(
    (token: any) => {
      isSrcToken ? callbacks.onSrcTokenSelect?.(token) : callbacks.onDstTokenSelect?.(token);
    },
    [isSrcToken, callbacks.onSrcTokenSelect, callbacks.onDstTokenSelect],
  );
};

export const useToken = ({ isSrcToken }: { isSrcToken: boolean }) => {
  const { srcToken, dstToken } = useTwapContext();
  return isSrcToken ? srcToken : dstToken;
};

export const useTokenInput = ({ isSrcToken }: { isSrcToken: boolean }) => {
  const {
    state: { typedSrcAmount = "" },
    updateState,
  } = useTwapContext();
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
    value: isWrapOrUnwrapOnly || isSrcToken ? typedSrcAmount : destTokenAmountUI,
    onChange,
  };
};

export const useTokenPanel = ({ isSrcToken }: { isSrcToken: boolean }) => {
  const { value, onChange } = useTokenInput({ isSrcToken });
  const token = useToken({ isSrcToken });
  const balanceError = useBalanceError();
  const balance = useTokenBalance({ isSrcToken });
  const usd = useTokenUSD({ isSrcToken });
  const onTokenSelect = useTokenSelect({ isSrcToken });
  const onSrcInputPercentClick = useOnSrcInputPercentClick();
  const { marketPriceLoading } = useTwapContext();

  const onPercent = useCallback(
    (percent: number) => {
      if (!isSrcToken) return;
      onSrcInputPercentClick(percent);
    },
    [onSrcInputPercentClick, isSrcToken],
  );

  return {
    value,
    onChange,
    token,
    error: isSrcToken ? balanceError : false,
    balance,
    usd,
    onTokenSelect,
    onPercent,
    isLoading: isSrcToken ? false : marketPriceLoading,
  };
};

export const useSwitchTokensCallback = () => {
  return useTwapContext().callbacks.onSwitchTokens;
};

export const useTradesAmountPanel = () => {
  const { translations: t } = useTwapContext();
  const { setChunks, chunks, error } = useChunks();

  return {
    error: error?.text,
    trades: chunks,
    onChange: setChunks,
    label: t.totalTrades,
    tooltip: t.totalTradesTooltip,
  };
};

export const useChunkSizeMessage = () => {
  const { srcUsd1Token, srcToken } = useTwapContext();
  const srcTokenChunkAmountUI = useSrcTokenChunkAmount().amountUI;
  const srcChunkAmountUsd = useSrcChunkAmountUSD();
  const usd = useFormatNumber({ value: srcChunkAmountUsd, decimalScale: 2 });
  const chunkSizeF = useFormatNumber({ value: srcTokenChunkAmountUI });
  const usdF = usd ? `($${usd})` : "";

  if (!srcUsd1Token || !srcToken) return null;

  return `${chunkSizeF} ${srcToken?.symbol} per trade ${usdF}`;
};

export const usePriceToggle = () => {
  const {
    state: { isMarketOrder },
    updateState,
  } = useTwapContext();

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

export const useShowConfirmationModalButton = () => {
  const {
    isWrongChain,
    srcUsd1Token,
    account: maker,
    translations: t,
    callbacks,
    marketPrice,
    state: { swapStatus, typedSrcAmount },
    marketPriceLoading,
    srcBalance,
    minChunkSizeUsd,
  } = useTwapContext();
  const error = useError();

  const onOpen = useOnOpenConfirmationModal();
  const { onConnect } = callbacks;
  const switchChain = useSwitchChain();
  const shouldUnwrap = useShouldUnwrap();
  const shouldOnlyWrap = useShouldOnlyWrap();
  const { mutate: wrap, isLoading: wrapLoading } = useWrapOnly();
  const { mutate: unwrap, isLoading: unwrapLoading } = useUnwrapToken();
  const zeroSrcAmount = BN(typedSrcAmount || "0").isZero();
  const zeroMarketPrice = BN(marketPrice || 0).isZero();
  const isPropsLoading = marketPriceLoading || BN(srcUsd1Token || "0").isZero() || srcBalance === undefined || !minChunkSizeUsd;

  const connect = useMemo(() => {
    if (maker) return;

    return {
      text: t.connect,
      disabled: false,
      loading: false,
      onClick: () => {
        if (!onConnect) {
          alert("connect function is not defined");
        } else {
          onConnect();
        }
      },
    };
  }, [maker, onConnect, t]);

  const invalidChain = useMemo(() => {
    if (!isWrongChain) return;
    return {
      text: t.switchNetwork,
      onClick: switchChain,
      disabled: false,
      loading: false,
    };
  }, [isWrongChain, t, switchChain]);

  const wrapOnly = useMemo(() => {
    if (!shouldOnlyWrap) return;

    return {
      text: error || t.wrap,
      onClick: wrap,
      disabled: error || wrapLoading,
      loading: wrapLoading,
    };
  }, [shouldOnlyWrap, wrap, zeroSrcAmount, wrapLoading, t, error]);

  const unwrapOnly = useMemo(() => {
    if (!shouldUnwrap) return;

    return {
      text: error || t.unwrap,
      onClick: unwrap,
      disabled: error || unwrapLoading,
      loading: unwrapLoading,
    };
  }, [shouldUnwrap, unwrap, zeroSrcAmount, error, unwrapLoading, t]);

  const swap = useMemo(() => {
    return {
      text: error ? error : marketPriceLoading ? t.outAmountLoading : t.placeOrder,
      onClick: onOpen,
      loading: swapStatus === SwapStatus.LOADING || isPropsLoading,
      disabled: swapStatus === SwapStatus.LOADING ? false : zeroMarketPrice || isPropsLoading || error,
    };
  }, [marketPriceLoading, zeroSrcAmount, t, onOpen, swapStatus, isPropsLoading, zeroMarketPrice, error]);

  return connect || invalidChain || wrapOnly || unwrapOnly || swap;
};

export const useOrderName = (isMarketOrder = false, chunks = 1) => {
  const { translations: t } = useTwapContext();
  return useMemo(() => {
    if (isMarketOrder) {
      return t.twapMarket;
    }
    if (chunks === 1) {
      return t.limit;
    }
    return t.twapLimit;
  }, [t, isMarketOrder, chunks]);
};

export const useFillDelayPanel = () => {
  const { setFillDelay, fillDelay, milliseconds, error } = useFillDelay();

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
    milliseconds,
    fillDelay,
    error,
  };
};

export const useOrderDurationPanel = () => {
  const { orderDuration, setOrderDuration, milliseconds } = useOrderDuration();

  const onUnitSelect = useCallback((unit: TimeUnit) => setOrderDuration({ unit, value: 1 }), [setOrderDuration]);

  return {
    orderDuration,
    setOrderDuration,
    milliseconds,
    onUnitSelect,
  };
};

// comfirmation modal hooks
export const useNewOrderExplorerUrl = () => {
  const {
    state: { createOrderTxHash },
  } = useTwapContext();
  const explorerUrl = useNetwork()?.explorer;

  return useMemo(() => {
    if (!explorerUrl || !createOrderTxHash) return "";
    return `${explorerUrl}/tx/${createOrderTxHash}`;
  }, [explorerUrl, createOrderTxHash]);
};

export const useMarketPriceMessage = () => {
  const isWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();
  const {
    state: { isMarketOrder },
    translations: t,
  } = useTwapContext();
  return useMemo(() => {
    if (!isMarketOrder || isWrapOrUnwrapOnly) return;
    return {
      text: t?.marketOrderWarning,
      url: `https://www.orbs.com/dtwap-and-dlimit-faq/`,
    };
  }, [isMarketOrder, isWrapOrUnwrapOnly, t]);
};

export const useConfirmationModalButton = () => {
  const { mutate: onSubmit, isLoading: mutationLoading } = useSubmitOrderCallback();
  const {
    state: { swapStatus, disclaimerAccepted },
    translations: t,
  } = useTwapContext();

  return useMemo(() => {
    const isLoading = mutationLoading || swapStatus === SwapStatus.LOADING;
    return {
      text: t.submitOrder,
      onSubmit,
      isLoading,
      disabled: !disclaimerAccepted || isLoading,
    };
  }, [t, onSubmit, disclaimerAccepted, mutationLoading, swapStatus]);
};

export const useConfirmationModalPanel = () => {
  const {
    state: { isMarketOrder, createOrderTxHash },
    translations: t,
    fee,
    srcToken,
    dstToken,
  } = useTwapContext();

  const orderDeadline = useOrderDeadline();
  const srcTokenChunkAmount = useSrcTokenChunkAmount().amountUI;
  const chunks = useChunks().chunks;
  const fillDelayMillis = useFillDelay().milliseconds;
  const dstMinAmountOut = useDestTokenMinAmount().amountUI;
  const destTokenAmount = useDestTokenAmount().amountUI;
  const isWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();
  const onClose = useOnCloseConfirmationModal();

  const explorerUrl = useNetwork()?.explorer;
  const orderName = useOrderName(isMarketOrder, chunks);
  const explorerLink = useMemo(() => {
    if (!explorerUrl || !createOrderTxHash) return "";
    return `${explorerUrl}/tx/${createOrderTxHash}`;
  }, [explorerUrl, createOrderTxHash]);
  const marketPriceMessage = useMemo(() => {
    if (!isMarketOrder || isWrapOrUnwrapOnly) return;
    return {
      text: t?.marketOrderWarning,
      url: `https://www.orbs.com/dtwap-and-dlimit-faq/`,
    };
  }, [isMarketOrder, isWrapOrUnwrapOnly, t]);

  const amount = useMemo(() => {
    if (!fee || !destTokenAmount || isMarketOrder) return "";
    return BN(destTokenAmount).multipliedBy(fee).dividedBy(100).toFixed().toString();
  }, [fee, destTokenAmount, isMarketOrder]);

  return {
    orderName,
    marketPriceMessage,
    orderDeadline,
    srcTokenChunkAmount,
    fillDelayMillis,
    dstMinAmountOut,
    chunks,
    feePercent: fee,
    feeAmount: amount,
    onClose,
    explorerLink,
    srcToken,
    dstToken,
  };
};

export const useLimitPriceMessage = () => {
  const {
    translations: t,
    state: { isMarketOrder },
  } = useTwapContext();
  const hide = useShouldWrapOrUnwrapOnly();

  return useMemo(() => {
    if (isMarketOrder || hide) return null;

    return {
      text: t.limitPriceMessage,
      url: "https://www.orbs.com/dtwap-and-dlimit-faq/",
    };
  }, [t, isMarketOrder, hide]);
};

export const useOrders = () => {
  const { data: orders } = useAccountOrders();
  const groupedOrders = useGroupedByStatusOrders();

  return {
    orders,
    groupedOrders,
  };
};
