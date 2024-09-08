import { useCallback, useMemo } from "react";
import { amountBNV2, amountUiV2, fillDelayText, query, SwapStep, useTwapContext } from "..";
import BN from "bignumber.js";
import { useFormatDecimals, useNetwork, useSrcBalance } from "./hooks";
import { eqIgnoreCase, isNativeAddress, maxUint256 } from "@defi.org/web3-candies";
import moment from "moment";
import * as SDK from "@orbs-network/twap-sdk";
import {
  getLowLimitPriceWarning,
  getMaxFillDelayWarning,
  getMinTradeDurationWarning,
  MIN_DURATION_MINUTES,
  getMinFillDelayWarning,
  getMaxTradeDurationWarning,
  TimeDuration,
  getTimeDurationMillis,
} from "@orbs-network/twap-sdk";
const MIN_NATIVE_BALANCE = 0.01;
export const useShouldWrapOrUnwrapOnly = () => {
  const wrap = useShouldOnlyWrap();
  const unwrap = useShouldUnwrap();

  return wrap || unwrap;
};

export const useDstMinAmountOut = () => {
  const {
    srcToken,
    dstToken,
    state: { isMarketOrder },
  } = useTwapContext();

  const limitPrice = useLimitPrice().price;
  const srcChunkAmount = useSrcChunkAmount().amount;
  const amount = SDK.getDstTokenMinAmount(srcToken, dstToken, srcChunkAmount, limitPrice, isMarketOrder);

  return {
    amount,
    amountUi: useAmountUi(dstToken?.decimals, amount),
  };
};

export const useLimitPrice = () => {
  const { state, dstToken, marketPrice } = useTwapContext();
  const { typedLimitPrice, isInvertedLimitPrice } = state;

  const isMarketOrder = useIsMarketOrder();

  const price = useMemo(() => {
    if (!dstToken) {
      return undefined;
    }

    if (typedLimitPrice === undefined || isMarketOrder || !marketPrice) {
      return marketPrice;
    }
    let result = typedLimitPrice;
    if (isInvertedLimitPrice) {
      result = BN(1)
        .div(typedLimitPrice || 0)
        .toString();
    }

    return amountBNV2(dstToken.decimals, result);
  }, [dstToken, isInvertedLimitPrice, isMarketOrder, marketPrice, typedLimitPrice]);

  return {
    isLoading: price === undefined,
    price,
    priceUi: useAmountUi(dstToken?.decimals, price),
  };
};

export const useInvertLimit = () => {
  const { updateState, state } = useTwapContext();

  return useCallback(() => {
    updateState({
      isInvertedLimitPrice: !state.isInvertedLimitPrice,
      typedLimitPrice: undefined,
      limitPricePercent: undefined,
    });
  }, [state.isInvertedLimitPrice, updateState]);
};

export const useOutAmount = () => {
  const { amountUi } = useSrcAmount();
  const { dstToken } = useTwapContext();

  const limitPrice = useLimitPrice().price;
  const outAmount = SDK.getDstTokenAmount(amountUi, limitPrice);
  return {
    amount: outAmount,
    amountUi: useAmountUi(dstToken?.decimals, outAmount),
    isLoading: amountUi && BN(outAmount || 0).isZero() ? true : false,
  };
};

const getUsdAmount = (amount?: string, usd?: string | number) => {
  if (!amount || !usd || BN(amount || "0").isZero() || BN(usd || "0").isZero()) return "0";
  return BN(amount || "0")
    .times(usd)
    .toString();
};
export const useUsdAmount = () => {
  const { amount: srcAmount } = useSrcAmount();
  const { dstToken, dstUsd, srcToken, srcUsd } = useTwapContext();
  const dstAmount = useOutAmount().amount;

  const dstUsdAmount = useMemo(() => {
    return getUsdAmount(dstAmount, dstUsd);
  }, [dstAmount, dstUsd]);

  const srcUsdAmount = useMemo(() => {
    return getUsdAmount(srcAmount, srcUsd);
  }, [srcAmount, srcUsd]);

  return {
    srcUsd: useAmountUi(srcToken?.decimals, srcUsdAmount),
    dstUsd: useAmountUi(dstToken?.decimals, dstUsdAmount),
  };
};

export const useIsPartialFillWarning = () => {
  const chunks = useChunks();
  const durationMillis = useDuration().millis;
  const fillDelayMillis = useFillDelay().millis;
  return SDK.getPartialFillWarning(chunks, durationMillis, fillDelayMillis);
};

export const useSetChunks = () => {
  const { updateState } = useTwapContext();

  return useMemo(() => {
    return (typedChunks: number) => {
      updateState({ typedChunks });
    };
  }, [updateState]);
};

const useAmountUi = (decimals?: number, amount?: string) => {
  return useMemo(() => amountUiV2(decimals, amount), [decimals, amount]);
};

export const useSrcChunkAmountUsd = () => {
  const { srcToken, srcUsd } = useTwapContext();
  const srcChunksAmount = useSrcChunkAmount().amount;

  const result = SDK.getSrcChunkAmountUsd(srcChunksAmount, srcUsd);

  return useAmountUi(srcToken?.decimals, result);
};

export const useChunks = () => {
  const maxPossibleChunks = useMaxPossibleChunks();
  const {
    state: { typedChunks },
    isLimitPanel,
  } = useTwapContext();

  const result = SDK.getChunks(maxPossibleChunks, typedChunks, isLimitPanel);

  return result;
};

export const useToken = (isSrc?: boolean) => {
  const { srcToken, dstToken } = useTwapContext();
  return isSrc ? srcToken : dstToken;
};

export const useMaxPossibleChunks = () => {
  const typedValue = useSrcAmount().amountUi;
  const { config, srcUsd } = useTwapContext();

  return SDK.getMaxPossibleChunks(config, typedValue, srcUsd);
};

export const useSrcAmount = () => {
  const { state, srcToken } = useTwapContext();
  return useMemo(() => {
    if (!state.srcAmountUi) {
      return {
        amountUi: "",
        amount: "0",
      };
    }
    return {
      amountUi: state.srcAmountUi,
      amount: BN.min(amountBNV2(srcToken?.decimals, state.srcAmountUi), maxUint256).decimalPlaces(0).toString(),
    };
  }, [srcToken, state.srcAmountUi]);
};

export const useFillDelay = () => {
  const {
    translations: t,
    isLimitPanel,
    state: { typedFillDelay },
  } = useTwapContext();

  const timeDuration = SDK.getFillDelay(isLimitPanel, typedFillDelay);

  const warning = useMemo(() => {
    if (getMaxFillDelayWarning(timeDuration)) {
      return t.maxDurationWarning;
    }
    if (getMinFillDelayWarning(timeDuration)) {
      return t.minDurationWarning.replace("{duration}", MIN_DURATION_MINUTES.toString());
    }
  }, [timeDuration, t]);

  const millis = getTimeDurationMillis(typedFillDelay);

  return {
    timeDuration,
    millis,
    text: useMemo(() => fillDelayText(millis, t), [millis, t]),
    warning,
  };
};

export const useMinimumDelayMinutes = () => {
  const { config } = useTwapContext();
  return SDK.getEstimatedDelayBetweenChunksMillis(config);
};

export const useNoLiquidity = () => {
  const srcAmount = useSrcAmount().amount;
  const { price } = useLimitPrice();
  const outAmount = useOutAmount().amount;

  return useMemo(() => {
    if (BN(price || 0).isZero() || BN(srcAmount || 0).isZero() || !outAmount) return false;
    return BN(outAmount || 0).isZero();
  }, [outAmount, srcAmount, price]);
};

export const useLimitPricePercentDiffFromMarket = () => {
  const { price: limitPrice } = useLimitPrice();
  const { marketPrice } = useTwapContext();
  const {
    state: { isInvertedLimitPrice },
  } = useTwapContext();

  return SDK.getLimitPricePercentDiffFromMarket(limitPrice, marketPrice, isInvertedLimitPrice);
};

export const useDeadline = () => {
  const duration = useDuration();
  const millis = SDK.getDeadline(duration.timeDuration);

  return useMemo(() => {
    return {
      millis,
      text: moment(millis).format("ll HH:mm"),
    };
  }, [duration, millis]);
};

export const useSrcChunkAmount = () => {
  const srcAmount = useSrcAmount().amount;
  const srcToken = useTwapContext().srcToken;

  const chunks = useChunks();
  const amount = SDK.getSrcChunkAmount(srcAmount, chunks);

  return {
    amount,
    amountUi: useFormatDecimals(useAmountUi(srcToken?.decimals, amount), 2),
  };
};

export const useShouldOnlyWrap = () => {
  const { srcToken, dstToken } = useTwapContext();
  const network = useNetwork();

  return useMemo(() => {
    return isNativeAddress(srcToken?.address || "") && eqIgnoreCase(dstToken?.address || "", network?.wToken.address || "");
  }, [srcToken, dstToken, network]);
};

export const useShouldUnwrap = () => {
  const { srcToken, dstToken } = useTwapContext();
  const network = useNetwork();

  return useMemo(() => {
    return eqIgnoreCase(srcToken?.address || "", network?.wToken.address || "") && isNativeAddress(dstToken?.address || "");
  }, [srcToken, dstToken, network]);
};

export const useSwitchTokens = () => {
  const { onSwitchTokens } = useTwapContext();

  return useCallback(() => {
    onSwitchTokens?.();
  }, [onSwitchTokens]);
};

const isEqual = (tokenA?: any, tokenB?: any) => {
  return eqIgnoreCase(tokenA?.address || "", tokenB?.address || "") || eqIgnoreCase(tokenA?.symbol, tokenB?.symbol);
};

export const useTokenSelect = () => {
  const switchTokens = useSwitchTokens();
  const { onSrcTokenSelected, onDstTokenSelected, srcToken, dstToken } = useTwapContext();
  return useCallback(
    ({ isSrc, token }: { isSrc: boolean; token: any }) => {
      if (isSrc && isEqual(token, dstToken)) {
        switchTokens?.();
        return;
      }

      if (!isSrc && isEqual(token, srcToken)) {
        switchTokens?.();
        return;
      }

      if (isSrc) {
        onSrcTokenSelected?.(token);
      } else {
        onDstTokenSelected?.(token);
      }
    },
    [onDstTokenSelected, onSrcTokenSelected, srcToken, dstToken, switchTokens]
  );
};

// Warnigns //

export const useFeeOnTransferWarning = () => {
  const { translations, srcToken, dstToken } = useTwapContext();
  const { data: srcTokenFeeOnTransfer } = query.useFeeOnTransfer(srcToken?.address);
  const { data: dstTokenFeeOnTransfer } = query.useFeeOnTransfer(dstToken?.address);

  return useMemo(() => {
    if (srcTokenFeeOnTransfer?.hasFeeOnTranfer || dstTokenFeeOnTransfer?.hasFeeOnTranfer) {
      return translations.feeOnTranferWarning;
    }
  }, [srcTokenFeeOnTransfer, dstTokenFeeOnTransfer, translations]);
};

const useSrcAmountWarning = () => {
  const srcAmount = useSrcAmount().amount;
  const { translations } = useTwapContext();

  return useMemo(() => {
    if (BN(srcAmount).isZero()) {
      return translations.enterAmount;
    }
  }, [srcAmount, translations]);
};

export const useBalanceWarning = () => {
  const { data: srcBalance } = useSrcBalance();
  const maxSrcInputAmount = useMaxSrcInputAmount();
  const srcAmount = useSrcAmount().amount;

  const { translations } = useTwapContext();

  return useMemo(() => {
    const isNativeTokenAndValueBiggerThanMax = maxSrcInputAmount && BN(srcAmount)?.gt(maxSrcInputAmount);

    if ((srcBalance && BN(srcAmount).gt(srcBalance)) || isNativeTokenAndValueBiggerThanMax) {
      return translations.insufficientFunds;
    }
  }, [srcBalance?.toString(), srcAmount, maxSrcInputAmount?.toString(), translations]);
};

export const useSetIsMarket = () => {
  const { updateState } = useTwapContext();
  return useCallback(
    (isMarketOrder?: boolean) => {
      updateState({ isMarketOrder: !!isMarketOrder });
    },
    [updateState]
  );
};

export const useSetFillDelay = () => {
  const { updateState } = useTwapContext();
  return useCallback(
    (typedFillDelay?: TimeDuration) => {
      updateState({ typedFillDelay });
    },
    [updateState]
  );
};

export const useSetDuration = () => {
  const { updateState } = useTwapContext();
  return useCallback(
    (typedDuration?: TimeDuration) => {
      updateState({ typedDuration });
    },
    [updateState]
  );
};

export const useLowPriceWarning = () => {
  const { isLimitPanel, translations: t, srcToken, dstToken, state } = useTwapContext();
  const { isInvertedLimitPrice } = state;

  const priceDeltaPercentage = useLimitPricePercentDiffFromMarket();
  return useMemo(() => {
    if (!srcToken || !dstToken) {
      return undefined;
    }

    const warning = getLowLimitPriceWarning(isLimitPanel, priceDeltaPercentage, !!isInvertedLimitPrice);

    if (!warning) return;
    const title = isInvertedLimitPrice ? t.limitPriceWarningTitleInverted : t.limitPriceWarningTitle;
    const subtitle = isInvertedLimitPrice ? t.limitPriceWarningSubtileInverted : t.limitPriceWarningSubtitle;
    const token = isInvertedLimitPrice ? dstToken : srcToken;
    const percent = BN(priceDeltaPercentage || 0)
      .abs()
      .toString();
    return {
      title: title.replace("{symbol}", token.symbol),
      subTitle: subtitle.replace("{percent}", percent),
    };
  }, [isInvertedLimitPrice, isLimitPanel, priceDeltaPercentage, srcToken, dstToken, t]);
};

export const useSetLimitPrice = () => {
  const { updateState } = useTwapContext();
  return useCallback(
    (typedLimitPrice?: string, percent?: string) => {
      updateState({ typedLimitPrice, limitPricePercent: percent });
    },
    [updateState]
  );
};

export const useToggleDisclaimer = () => {
  const {
    updateState,
    state: { disclaimerAccepted },
  } = useTwapContext();
  return useCallback(() => {
    updateState({ disclaimerAccepted: !disclaimerAccepted });
  }, [updateState, disclaimerAccepted]);
};

export const useIsMarketOrder = () => {
  const {
    isLimitPanel,
    state: { isMarketOrder },
  } = useTwapContext();

  return useMemo(() => {
    return SDK.getIsMarketOrder(isLimitPanel, isMarketOrder);
  }, [isLimitPanel, isMarketOrder]);
};

export const useTradeSizeWarning = () => {
  const {
    config,
    state: { srcAmountUi },
    translations: t,
  } = useTwapContext();
  const srcChunkAmountUsd = useSrcChunkAmountUsd();
  const chunks = useChunks();
  const warning = useMemo(() => {
    if (!srcAmountUi) return;
    return SDK.getTradeSizeWarning(config, srcChunkAmountUsd, chunks);
  }, [config, srcChunkAmountUsd, chunks, srcAmountUi]);

  if (!warning) return;

  return t.tradeSizeMustBeEqual.replace("{minChunkSizeUsd}", config.minChunkSizeUsd.toString());
};

export const useSwapWarning = () => {
  const { warning: fillDelayWarning } = useFillDelay();
  const { warning: durationWarning } = useDuration();
  const feeOnTranfer = useFeeOnTransferWarning();
  const tradeSize = useTradeSizeWarning();
  const shouldWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();
  const zeroSrcAmount = useSrcAmountWarning();
  const balance = useBalanceWarning();
  const lowPrice = useLowPriceWarning();

  if (shouldWrapOrUnwrapOnly) {
    return { balance, zeroSrcAmount };
  }

  return { tradeSize, zeroSrcAmount, feeOnTranfer, lowPrice, balance, fillDelayWarning, durationWarning };
};

export const useDuration = () => {
  const chunks = useChunks();
  const fillDelay = useFillDelay();
  const {
    state: { typedDuration },
    translations: t,
  } = useTwapContext();
  const timeDuration = SDK.getDuration(chunks, fillDelay.timeDuration, typedDuration);

  const warning = useMemo(() => {
    if (getMinTradeDurationWarning(timeDuration)) {
      return t.minDurationWarning.replace("{duration}", MIN_DURATION_MINUTES.toString());
    }
    if (getMaxTradeDurationWarning(timeDuration)) {
      return t.maxDurationWarning;
    }
  }, [timeDuration, t]);

  return {
    timeDuration,
    millis: getTimeDurationMillis(timeDuration),
    warning,
  };
};

export const useShouldWrap = () => {
  const { srcToken } = useTwapContext();

  return useMemo(() => {
    return isNativeAddress(srcToken?.address || "");
  }, [srcToken]);
};

export const useSetSwapSteps = () => {
  const shouldWrap = useShouldWrap();
  const { data: haveAllowance } = query.useAllowance();
  const updateState = useTwapContext().updateState;
  return useCallback(() => {
    let swapSteps: SwapStep[] = [];
    if (shouldWrap) {
      swapSteps.push("wrap");
    }
    if (!haveAllowance) {
      swapSteps.push("approve");
    }
    swapSteps.push("createOrder");
    updateState({ swapSteps });
  }, [haveAllowance, shouldWrap, updateState]);
};

export const useSwapPrice = () => {
  const srcAmount = useSrcAmount().amountUi;
  const { srcUsd, dstUsd } = useTwapContext();
  const outAmountUi = useOutAmount().amountUi;
  const price = useMemo(() => {
    if (!outAmountUi || !srcAmount) return "0";
    return BN(outAmountUi).dividedBy(srcAmount).toString();
  }, [srcAmount, outAmountUi]);

  const usd = useMemo(() => {
    if (!dstUsd || !srcUsd) return "0";
    return BN(dstUsd).multipliedBy(price).toString();
  }, [price, srcUsd, dstUsd]);

  return {
    price,
    usd,
  };
};

export const useMaxSrcInputAmount = () => {
  const { srcToken } = useTwapContext();
  const srcBalance = useSrcBalance().data?.toString();

  return useMemo(() => {
    if (srcBalance && isNativeAddress(srcToken?.address || "")) {
      const srcTokenMinimum = amountBNV2(srcToken?.decimals, MIN_NATIVE_BALANCE.toString());
      return BN.max(0, BN.min(BN(srcBalance).minus(srcTokenMinimum))).toString();
    }
  }, [srcToken, srcBalance]);
};

export const useOnSrcAmountPercent = () => {
  const { srcToken, updateState } = useTwapContext();

  const maxAmount = useMaxSrcInputAmount();
  const srcBalance = useSrcBalance().data?.toString();
  return useCallback(
    (percent: number) => {
      if (!srcToken || !srcBalance) {
        return;
      }

      //max amount will be greater than zero only if the src token is native token
      const _maxAmount = maxAmount && percent === 1 && BN(maxAmount).gt(0) ? maxAmount : undefined;
      const value = amountUiV2(srcToken.decimals, _maxAmount || BN(srcBalance).times(percent).toString());
      updateState({ srcAmountUi: value });
    },
    [srcToken, maxAmount, srcBalance, updateState]
  );
};

export const useSwapData = () => {
  const srcAmount = useSrcAmount();
  const amountUsd = useUsdAmount();
  const outAmount = useOutAmount();
  const deadline = useDeadline();
  const srcChunkAmount = useSrcChunkAmount();
  const dstMinAmount = useDstMinAmountOut();

  const fillDelay = useFillDelay();
  const chunks = useChunks();
  const { srcToken, dstToken } = useTwapContext();

  return {
    srcAmount,
    amountUsd,
    outAmount,
    deadline,
    srcChunkAmount,
    dstMinAmount,
    fillDelay,
    chunks,
    srcToken,
    dstToken,
  };
};
