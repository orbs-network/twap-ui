import { useCallback, useMemo } from "react";
import {
  amountBNV2,
  amountUiV2,
  fillDelayText,
  MAX_DURATION_MILLIS,
  MAX_TRADE_INTERVAL,
  MAX_TRADE_INTERVAL_FORMATTED,
  MIN_DURATION_MILLIS,
  MIN_DURATION_MILLIS_FORMATTED,
  MIN_NATIVE_BALANCE,
  MIN_TRADE_INTERVAL,
  MIN_TRADE_INTERVAL_FORMATTED,
  query,
  QUERY_PARAMS,
  SwapStep,
  TimeResolution,
  useTwapContext,
} from "..";
import BN from "bignumber.js";
import { useAmountUi, useEstimatedDelayBetweenChunksMillis, useFormatDecimals, useNetwork, useSrcBalance } from "./hooks";
import { convertDecimals, eqIgnoreCase, isNativeAddress, maxUint256, parsebn } from "@defi.org/web3-candies";
import { stateActions, useSetQueryParams } from "../context/actions";
import moment from "moment";
export const useLimitPrice = () => {
  const { isLoading, marketPrice } = useMarketPrice();
  const { state, dstToken } = useTwapContext();
  const { isCustomLimitPrice, customLimitPrice, isInvertedLimitPrice, isMarketOrder } = state;

  const price = useMemo(() => {
    if (!marketPrice) return;

    if (!isCustomLimitPrice || isMarketOrder) {
      return marketPrice;
    }
    let result = customLimitPrice;
    if (isInvertedLimitPrice) {
      result = BN(1)
        .div(customLimitPrice || 0)
        .toString();
    }
    return amountBNV2(dstToken?.decimals, result);
  }, [isCustomLimitPrice, customLimitPrice, dstToken?.decimals, isInvertedLimitPrice, marketPrice, isMarketOrder]);

  return {
    isLoading,
    price,
    priceUi: useAmountUi(dstToken?.decimals, price),
  };
};

export const useShouldWrapOrUnwrapOnly = () => {
  const wrap = useShouldOnlyWrap();
  const unwrap = useShouldUnwrap();

  return wrap || unwrap;
};

export const useDstMinAmountOut = () => {
  const { priceUi } = useLimitPrice();
  const { srcToken, dstToken } = useTwapContext();
  const srcChunkAmount = useSrcChunkAmount().amount;

  const isMarketOrder = useIsMarketOrder();
  const amount = useMemo(() => {
    let amount = BN(1).toString();
    if (!isMarketOrder && srcToken && dstToken && BN(priceUi || "0").gt(0)) {
      amount = BN.max(1, convertDecimals(BN(srcChunkAmount).times(parsebn(priceUi || "0")), srcToken.decimals, dstToken.decimals).integerValue(BN.ROUND_FLOOR)).toString();
    }
    return amount;
  }, [srcToken, dstToken, srcChunkAmount, priceUi, isMarketOrder]);

  return {
    amount,
    amountUi: useAmountUi(dstToken?.decimals, amount),
  };
};

export const useOutAmount = () => {
  const { price, isLoading } = useLimitPrice();
  const srcAmount = useSrcAmount();
  const { dstToken } = useTwapContext();

  const wrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();

  const outAmount = useMemo(() => {
    if (BN(srcAmount.amount || 0).isZero()) return;
    if (wrapOrUnwrapOnly) {
      return srcAmount.amount;
    }
    return !price ? undefined : BN(price).multipliedBy(srcAmount.amountUi).decimalPlaces(0).toString();
  }, [price, wrapOrUnwrapOnly, srcAmount]);

  return {
    isLoading,
    amountUi: useAmountUi(dstToken?.decimals, outAmount) || "",
    amount: outAmount || "",
  };
};

const getUsdAmount = (amount?: string, usd?: string | number) => {
  if (!amount || !usd || BN(amount || "0").isZero() || BN(usd || "0").isZero()) return "0";
  return BN(amount || "0")
    .times(usd)
    .toString();
};
export const useUsdAmount = () => {
  const srcAmount = useSrcAmount().amount;
  const dstAmount = useOutAmount().amount;
  const { dstToken, dstUsd, srcToken, srcUsd } = useTwapContext();

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

export const useMarketPrice = () => {
  const marketPriceRaw = useTwapContext().marketPrice;
  const { isWrongChain, account, dstToken } = useTwapContext();

  const invalidInputs = isWrongChain || !account;

  const isLoading = useMemo(() => {
    if (invalidInputs) return false;
    return BN(marketPriceRaw || 0).isZero();
  }, [marketPriceRaw, invalidInputs]);

  return {
    marketPrice: marketPriceRaw,
    marketPriceUi: useAmountUi(dstToken?.decimals, marketPriceRaw),
    isLoading,
  };
};

export const useIsPartialFillWarning = () => {
  const chunks = useChunks();

  const fillDelayUiMillis = useFillDelay().millis;
  const durationMillis = useDuration().millis;

  return useMemo(() => {
    return chunks * fillDelayUiMillis > durationMillis;
  }, [chunks, fillDelayUiMillis, durationMillis]);
};

export const useSetChunks = () => {
  const updateState = useTwapContext().updateState;
  const maxPossibleChunks = useMaxPossibleChunks();
  const setQueryParam = useSetQueryParams();
  return useCallback(
    (chunks: number) => {
      if (chunks > 0 && chunks <= maxPossibleChunks) {
        setQueryParam(QUERY_PARAMS.TRADES_AMOUNT, chunks.toString());
      }
      updateState({ customChunks: chunks });
    },
    [updateState],
  );
};

export const useSrcChunkAmountUsd = () => {
  const { srcToken, srcUsd } = useTwapContext();
  const srcChunksAmount = useSrcChunkAmount().amount;

  const result = useMemo(() => {
    return BN(srcChunksAmount || 0)
      .times(srcUsd)
      .toString();
  }, [srcChunksAmount, srcUsd]);

  return useAmountUi(srcToken?.decimals, result);
};

export const useMinDuration = () => {
  const fillDelayUiMillis = useFillDelay().millis;
  const chunks = useChunks();

  return useMemo(() => {
    const _millis = fillDelayUiMillis * 2 * chunks;
    const resolution = [TimeResolution.Days, TimeResolution.Hours, TimeResolution.Minutes].find((r) => r <= _millis) || TimeResolution.Minutes;
    const duration = { resolution, amount: Number(BN(_millis / resolution).toFixed(2)) };

    return {
      duration,
      millis: (duration.amount || 0) * duration.resolution,
    };
  }, [fillDelayUiMillis, chunks]);
};

export const useChunks = () => {
  const { isLimitPanel, state, srcToken, srcUsd } = useTwapContext();
  const { customChunks } = state;
  const maxPossibleChunks = useMaxPossibleChunks();

  return useMemo(() => {
    if (isLimitPanel) return 1;
    if (!srcUsd || !srcToken) return 1;
    if (typeof customChunks === "number") return customChunks;
    return maxPossibleChunks;
  }, [srcUsd, srcToken, customChunks, maxPossibleChunks, isLimitPanel]);
};

export const useToken = (isSrc?: boolean) => {
  const { srcToken, dstToken } = useTwapContext();
  return isSrc ? srcToken : dstToken;
};

export const useMaxPossibleChunks = () => {
  const srcAmount = useSrcAmount().amount;
  const { config, srcToken, srcUsd } = useTwapContext();

  return useMemo(() => {
    if (!config || !srcToken || !srcAmount || !srcUsd) return 1;
    const res = BN.max(1, BN(srcAmount).div(BN(10).pow(srcToken.decimals).div(srcUsd).times(config.minChunkSizeUsd)))
      .integerValue(BN.ROUND_FLOOR)
      .toNumber();
    return res > 1 ? res : 1;
  }, [srcAmount, srcToken, srcUsd, config]);
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
    state: { customFillDelay },
    isLimitPanel,
    translations,
  } = useTwapContext();

  const millis = useMemo(() => {
    if (isLimitPanel) {
      return TimeResolution.Minutes * MIN_TRADE_INTERVAL_FORMATTED;
    }
    return customFillDelay.amount! * customFillDelay.resolution;
  }, [customFillDelay, isLimitPanel]);

  return {
    millis,
    text: useMemo(() => fillDelayText(millis, translations), [millis, translations]),
  };
};

export const useIsMarketOrder = () => {
  const { isLimitPanel, state } = useTwapContext();
  const isMarketOrder = state.isMarketOrder;

  return isLimitPanel ? false : isMarketOrder;
};

export const useMinimumDelayMinutes = () => {
  const estimatedDelayBetweenChunksMillis = useEstimatedDelayBetweenChunksMillis();
  return useMemo(() => estimatedDelayBetweenChunksMillis / 1000 / 60, [estimatedDelayBetweenChunksMillis]);
};

export const useNoLiquidity = () => {
  const srcAmount = useSrcAmount().amount;
  const { isLoading: dstAmountLoading, amount } = useOutAmount();
  const limitPrice = useLimitPrice().price;

  return useMemo(() => {
    if (BN(limitPrice || 0).isZero() || BN(srcAmount || 0).isZero() || dstAmountLoading) return false;
    return BN(amount || 0).isZero();
  }, [amount, dstAmountLoading, srcAmount, limitPrice]);
};

export const useLimitPricePercentDiffFromMarket = () => {
  const limitPrice = useLimitPrice().price;
  const marketPrice = useMarketPrice().marketPrice;
  const isInvertedLimitPrice = useTwapContext().state.isInvertedLimitPrice;

  return useMemo(() => {
    if (!limitPrice || !marketPrice || BN(limitPrice).isZero() || BN(limitPrice).isZero()) return "0";
    const from = isInvertedLimitPrice ? marketPrice : limitPrice;
    const to = isInvertedLimitPrice ? limitPrice : marketPrice;
    return BN(from).div(to).minus(1).multipliedBy(100).decimalPlaces(2, BN.ROUND_HALF_UP).toString();
  }, [limitPrice, marketPrice, isInvertedLimitPrice]);
};

export const useDeadline = () => {
  const confirmationClickTimestamp = useTwapContext().state.confirmationClickTimestamp;

  const { duration: durationUi } = useDuration();

  return useMemo(() => {
    const millis = moment(confirmationClickTimestamp)
      .add((durationUi.amount || 0) * durationUi.resolution)
      .add(1, "minute")
      .valueOf();
    return {
      millis,
      text: moment(millis).format("ll HH:mm"),
    };
  }, [durationUi, confirmationClickTimestamp]);
};

export const useSrcChunkAmount = () => {
  const srcAmount = useSrcAmount().amount;
  const srcToken = useTwapContext().srcToken;

  const chunks = useChunks();
  const amount = useMemo(() => {
    const res = chunks === 0 ? BN(0) : BN(srcAmount).div(chunks).integerValue(BN.ROUND_FLOOR) || BN(0);
    return res.toString();
  }, [srcAmount.toString(), chunks]);

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
  const resetLimit = stateActions.useResetLimitAfterTokenSwitch();

  return useCallback(() => {
    onSwitchTokens?.();
    resetLimit();
  }, [resetLimit, onSwitchTokens]);
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
    [onDstTokenSelected, onSrcTokenSelected, srcToken, dstToken, switchTokens],
  );
};

// Warnigns //

export const useFillDelayWarning = () => {
  const fillDelayMillis = useFillDelay().millis;
  const { translations } = useTwapContext();

  return useMemo(() => {
    if (fillDelayMillis < MIN_TRADE_INTERVAL) {
      return translations.minTradeIntervalWarning.replace("{tradeInterval}", MIN_TRADE_INTERVAL_FORMATTED.toString());
    }
    if (fillDelayMillis > MAX_TRADE_INTERVAL) {
      return translations.maxTradeIntervalWarning.replace("{tradeInterval}", MAX_TRADE_INTERVAL_FORMATTED.toString());
    }
  }, [fillDelayMillis, translations]);
};

export const useTradeDurationWarning = () => {
  const durationMillis = useDuration().millis;
  const { translations, state } = useTwapContext();

  return useMemo(() => {
    if (!state.customDuration) return;
    if (durationMillis < MIN_DURATION_MILLIS) {
      return translations.minDurationWarning.replace("{duration}", MIN_DURATION_MILLIS_FORMATTED.toString());
    }
    if (durationMillis > MAX_DURATION_MILLIS) {
      return translations.maxDurationWarning;
    }
  }, [durationMillis, translations, state.customDuration]);
};

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

export const useTradeSizeWarning = () => {
  const singleChunksUsd = useSrcChunkAmountUsd();
  const chunks = useChunks();
  const srcAmount = useSrcAmount().amount;

  const { config, translations } = useTwapContext();
  return useMemo(() => {
    if (BN(srcAmount).isZero()) return;
    const minTradeSizeUsd = BN(config.minChunkSizeUsd || 0);
    if (BN(chunks).isZero() || BN(singleChunksUsd || 0).isLessThan(minTradeSizeUsd)) {
      return translations.tradeSizeMustBeEqual.replace("{minChunkSizeUsd}", minTradeSizeUsd.toString());
    }
  }, [chunks, translations, singleChunksUsd, config, srcAmount]);
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

export const useLowPriceWarning = () => {
  const { isLimitPanel, translations: t, state, srcToken, dstToken } = useTwapContext();
  const { marketPrice } = useMarketPrice();
  const priceDeltaPercentage = useLimitPricePercentDiffFromMarket();

  const { isInvertedLimitPrice } = state;

  return useMemo(() => {
    if (!srcToken || !dstToken || !isLimitPanel) {
      return;
    }
    const isWarning = isInvertedLimitPrice ? BN(priceDeltaPercentage).isGreaterThan(0) : BN(priceDeltaPercentage).isLessThan(0);

    if (!isWarning) {
      return;
    }

    const title = isInvertedLimitPrice ? t.limitPriceWarningTitleInverted : t.limitPriceWarningTitle;
    const subtitle = isInvertedLimitPrice ? t.limitPriceWarningSubtileInverted : t.limitPriceWarningSubtitle;
    return {
      title: title.replace("{symbol}", isInvertedLimitPrice ? dstToken?.symbol : srcToken?.symbol),
      subTitle: subtitle.replace(
        "{percent}",
        BN(priceDeltaPercentage || 0)
          .abs()
          .toString(),
      ),
    };
  }, [isLimitPanel, marketPrice, isInvertedLimitPrice, srcToken, dstToken, t, priceDeltaPercentage]);
};

export const useSwapWarning = () => {
  const fillDelay = useFillDelayWarning();
  const feeOnTranfer = useFeeOnTransferWarning();
  const tradeSize = useTradeSizeWarning();
  const shouldWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();
  const zeroSrcAmount = useSrcAmountWarning();
  const balance = useBalanceWarning();
  const lowPrice = useLowPriceWarning();
  const duration = useTradeDurationWarning();

  if (shouldWrapOrUnwrapOnly) {
    return { balance, zeroSrcAmount };
  }

  return { tradeSize, zeroSrcAmount, fillDelay, feeOnTranfer, lowPrice, balance, duration };
};

export const useDuration = () => {
  const { duration: minDuration } = useMinDuration();

  const { state } = useTwapContext();

  const duration = useMemo(() => {
    if (state.customDuration) {
      return state.customDuration;
    }
    return minDuration;
  }, [state.customDuration, minDuration]);

  const millis = useMemo(() => (duration.amount || 0) * duration.resolution, [duration]);

  return {
    duration,
    millis,
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
  const outAmount = useOutAmount().amountUi;

  const price = useMemo(() => {
    if (!outAmount || !srcAmount) return "0";
    return BN(outAmount).dividedBy(srcAmount).toString();
  }, [srcAmount, outAmount]);

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
  const { srcToken } = useTwapContext();

  const setSrcAmountUi = stateActions.useSetSrcAmount();
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
      setSrcAmountUi(value);
    },
    [srcToken, maxAmount, srcBalance, setSrcAmountUi],
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
