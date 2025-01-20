import { useCallback, useMemo } from "react";
import { amountBNV2, amountUiV2, query, useTwapContext } from "..";
import BN from "bignumber.js";
import { useNetwork, useSrcBalance } from "./hooks";
import { eqIgnoreCase, isNativeAddress, networks } from "@defi.org/web3-candies";
import moment from "moment";
import { fillDelayText, MIN_DURATION_MINUTES } from "@orbs-network/twap-sdk";
import { useTwapContext as useTwapContextUI } from "@orbs-network/twap-ui-sdk";

const getMinNativeBalance = (chainId: number) => {
  switch (chainId) {
    case networks.base.id:
      return 0.0001;
      break;

    default:
      return 0.01;
  }
};
export const useShouldWrapOrUnwrapOnly = () => {
  const wrap = useShouldOnlyWrap();
  const unwrap = useShouldUnwrap();

  return wrap || unwrap;
};

export const useDstMinAmountOut = () => {
  const {
    derivedValues: { destTokenMinAmount, destTokenMinAmountOutUI },
  } = useTwapContextUI();
  return {
    amount: destTokenMinAmount,
    amountUi: destTokenMinAmountOutUI,
  };
};

export const useInvertLimit = () => {
  const { actionHandlers } = useTwapContextUI();
  return actionHandlers.onInvertPrice;
};

export const useOutAmount = () => {
  const { amountUi } = useSrcAmount();
  const {
    derivedValues: { destTokenAmount, destTokenAmountUI },
    state: { marketPrice },
  } = useTwapContextUI();

  return {
    amount: destTokenAmount,
    amountUi: destTokenAmountUI,
    isLoading: amountUi && BN(marketPrice || 0).isZero() ? true : false,
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
  const { dstUsd, srcUsd } = useTwapContext();
  const { parsedSrcToken: srcToken, parsedDstToken: dstToken } = useTwapContextUI();

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
  return useTwapContextUI().derivedValues?.warnings.partialFill;
};

export const useSetChunks = () => {
  const { actionHandlers } = useTwapContextUI();
  return actionHandlers.setChunks;
};

const useAmountUi = (decimals?: number, amount?: string) => {
  return useMemo(() => amountUiV2(decimals, amount), [decimals, amount]);
};

export const useSrcChunkAmountUsd = () => {
  const { srcUsd } = useTwapContext();
  const { parsedSrcToken: srcToken } = useTwapContextUI();
  const srcChunksAmount = useSrcChunkAmount().amount;

  const result = BN(srcChunksAmount || "0")
    .times(srcUsd)
    .toString();

  return useAmountUi(srcToken?.decimals, result);
};

export const useChunks = () => {
  return useTwapContextUI().derivedValues.chunks;
};

export const useToken = (isSrc?: boolean) => {
  const { parsedSrcToken: srcToken, parsedDstToken: dstToken } = useTwapContextUI();
  return isSrc ? srcToken : dstToken;
};

export const useMinChunkSizeUsd = () => {
  const { state, config } = useTwapContextUI();
  return Math.max(config.minChunkSizeUsd || 0, config?.minChunkSizeUsd || 0);
};

export const useMaxPossibleChunks = () => {
  const {
    derivedValues: { maxPossibleChunks },
  } = useTwapContextUI();

  return maxPossibleChunks;
};

export const useSrcAmount = () => {
  const { derivedValues, state } = useTwapContextUI();

  return {
    amountUi: state.typedSrcAmount || "",
    amount: derivedValues.srcAmount || "",
  };
};

export const useFillDelay = () => {
  const { translations: t } = useTwapContext();
  const {
    state: { typedFillDelay },
    derivedValues,
  } = useTwapContextUI();

  const {
    warnings: { maxFillDelay, minFillDelay },
    fillDelay,
  } = derivedValues;

  const timeDuration = fillDelay;

  const warning = useMemo(() => {
    if (maxFillDelay) {
      return t.maxDurationWarning;
    }
    if (minFillDelay) {
      return t.minDurationWarning.replace("{duration}", MIN_DURATION_MINUTES.toString());
    }
  }, [maxFillDelay, minFillDelay, t]);

  const millis = typedFillDelay.unit * typedFillDelay.value;

  return {
    timeDuration,
    millis,
    text: fillDelayText(millis),
    warning,
  };
};

export const useMinimumDelayMinutes = () => {
  const { sdk } = useTwapContextUI();
  return sdk.estimatedDelayBetweenChunksMillis;
};

export const useNoLiquidity = () => {
  const srcAmount = useSrcAmount().amount;
  const {
    derivedValues: { price },
  } = useTwapContextUI();
  const outAmount = useOutAmount().amount;

  return useMemo(() => {
    if (BN(price || 0).isZero() || BN(srcAmount || 0).isZero() || !outAmount) return false;
    return BN(outAmount || 0).isZero();
  }, [outAmount, srcAmount, price]);
};

export const useDeadline = () => {
  const {
    derivedValues: { deadline },
  } = useTwapContextUI();

  return useMemo(() => {
    return {
      millis: deadline,
      text: moment(deadline).format("ll HH:mm"),
    };
  }, [deadline]);
};

export const useSrcChunkAmount = () => {
  const {
    derivedValues: { srcChunkAmount, srcChunksAmountUI },
  } = useTwapContextUI();

  return {
    amount: srcChunkAmount,
    amountUi: srcChunksAmountUI,
  };
};
export const useShouldOnlyWrap = () => {
  const { parsedSrcToken: srcToken, parsedDstToken: dstToken } = useTwapContextUI();
  const network = useNetwork();

  return useMemo(() => {
    return isNativeAddress(srcToken?.address || "") && eqIgnoreCase(dstToken?.address || "", network?.wToken.address || "");
  }, [srcToken, dstToken, network]);
};

export const useShouldUnwrap = () => {
  const { parsedSrcToken: srcToken, parsedDstToken: dstToken } = useTwapContextUI();
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
  if (!tokenA || !tokenB) return false;
  return eqIgnoreCase(tokenA?.address || "", tokenB?.address || "") || eqIgnoreCase(tokenA?.symbol || "", tokenB?.symbol || "");
};

export const useTokenSelect = () => {
  const switchTokens = useSwitchTokens();
  const { onSrcTokenSelected, onDstTokenSelected } = useTwapContext();
  const { parsedSrcToken: srcToken, parsedDstToken: dstToken } = useTwapContextUI();
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

export const useFeeOnTransferWarning = () => {
  const { translations } = useTwapContext();
  const { parsedSrcToken: srcToken, parsedDstToken: dstToken } = useTwapContextUI();
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

export const useSetFillDelay = () => {
  const { actionHandlers } = useTwapContextUI();
  return actionHandlers.setFillDelay;
};

export const useSetDuration = () => {
  const { actionHandlers } = useTwapContextUI();
  return actionHandlers.setDuration;
};

export const getLowLimitPriceWarning = (isLimitPanel?: boolean, priceDeltaPercentage = "", isInvertedLimitPrice = false) => {
  if (!isLimitPanel || !priceDeltaPercentage) return;
  return isInvertedLimitPrice ? BN(priceDeltaPercentage).isGreaterThan(0) : BN(priceDeltaPercentage).isLessThan(0);
};

export const useLowPriceWarning = () => {
  const { translations: t } = useTwapContext();
  const {
    state: { isInvertedLimitPrice },
    isLimitPanel,
    parsedSrcToken,
    parsedDstToken,
    derivedValues: { priceDiffFromMarket },
  } = useTwapContextUI();

  return useMemo(() => {
    if (!parsedSrcToken || !parsedDstToken) {
      return undefined;
    }

    const warning = getLowLimitPriceWarning(isLimitPanel, priceDiffFromMarket, !!isInvertedLimitPrice);

    if (!warning) return;
    const title = isInvertedLimitPrice ? t.limitPriceWarningTitleInverted : t.limitPriceWarningTitle;
    const subtitle = isInvertedLimitPrice ? t.limitPriceWarningSubtileInverted : t.limitPriceWarningSubtitle;
    const token = isInvertedLimitPrice ? parsedDstToken : parsedSrcToken;
    const percent = BN(priceDiffFromMarket || 0)
      .abs()
      .toString();
    return {
      title: title.replace("{symbol}", token.symbol),
      subTitle: subtitle.replace("{percent}", percent),
    };
  }, [isInvertedLimitPrice, isLimitPanel, priceDiffFromMarket, parsedSrcToken, parsedDstToken, t]);
};

export const useSetLimitPrice = () => {
  const { actionHandlers } = useTwapContextUI();
  return actionHandlers.setLimitPrice;
};

export const useToggleDisclaimer = () => {
  const {
    state: { disclaimerAccepted },
    updateState,
  } = useTwapContext();
  return useCallback(() => {
    updateState({ disclaimerAccepted: !disclaimerAccepted });
  }, [disclaimerAccepted, updateState]);
};

export const useTradeSizeWarning = () => {
  const { translations: t } = useTwapContext();
  const {
    derivedValues: { warnings },
    config,
  } = useTwapContextUI();

  if (!warnings.tradeSize) return;

  return t.tradeSizeMustBeEqual.replace("{minChunkSizeUsd}", config.minChunkSizeUsd.toString());
};

export const useTradesAmountWarning = () => {
  const chunks = useChunks();

  if (chunks > 0) return null;

  return "Min. 1 trade is required.";
};

export const useLimitPriceWarning = () => {
  const {
    state: { typedPrice },
  } = useTwapContextUI();

  return useMemo(() => {
    if (typedPrice !== undefined && BN(typedPrice || 0).isZero()) {
      return "Enter limit price";
    }
  }, [typedPrice]);
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
  const limitPriceWarning = useLimitPriceWarning();

  if (shouldWrapOrUnwrapOnly) {
    return { balance, zeroSrcAmount };
  }

  return { tradeSize, zeroSrcAmount, feeOnTranfer, lowPrice, balance, fillDelayWarning, durationWarning, limitPriceWarning };
};

export const useDuration = () => {
  const { translations: t } = useTwapContext();
  const {
    derivedValues: { warnings, duration },
  } = useTwapContextUI();

  const warning = useMemo(() => {
    if (warnings.minDuration) {
      return t.minDurationWarning.replace("{duration}", MIN_DURATION_MINUTES.toString());
    }
    if (warnings.maxDuration) {
      return t.maxDurationWarning;
    }
  }, [warnings.maxDuration, warnings.minDuration, t]);

  return {
    timeDuration: duration,
    millis: duration.unit * duration.value,
    warning,
  };
};

export const useShouldWrap = () => {
  const { parsedSrcToken: srcToken } = useTwapContextUI();

  return useMemo(() => {
    return isNativeAddress(srcToken?.address || "");
  }, [srcToken]);
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
  const { parsedSrcToken: srcToken, sdk } = useTwapContextUI();
  const srcBalance = useSrcBalance().data?.toString();

  return useMemo(() => {
    if (srcBalance && isNativeAddress(srcToken?.address || "")) {
      const srcTokenMinimum = amountBNV2(srcToken?.decimals, getMinNativeBalance(sdk.config.chainId).toString());
      return BN.max(0, BN.min(BN(srcBalance).minus(srcTokenMinimum))).toString();
    }
  }, [srcToken, srcBalance, sdk.config.chainId]);
};

export const useOnSrcAmountPercent = () => {
  const { parsedSrcToken, actionHandlers } = useTwapContextUI();

  const maxAmount = useMaxSrcInputAmount();
  const srcBalance = useSrcBalance().data?.toString();
  return useCallback(
    (percent: number) => {
      if (!parsedSrcToken || !srcBalance) {
        return;
      }

      //max amount will be greater than zero only if the src token is native token
      const _maxAmount = maxAmount && percent === 1 && BN(maxAmount).gt(0) ? maxAmount : undefined;
      const value = amountUiV2(parsedSrcToken.decimals, _maxAmount || BN(srcBalance).times(percent).toString());
      actionHandlers.setSrcAmount(value);
    },
    [maxAmount, srcBalance, actionHandlers.setSrcAmount, parsedSrcToken],
  );
};
