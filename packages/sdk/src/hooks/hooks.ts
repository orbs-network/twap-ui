import { useCallback, useMemo } from "react";
import BN from "bignumber.js";
import { convertDecimals, eqIgnoreCase, parsebn } from "@defi.org/web3-candies";
import moment from "moment";
import { amountBN } from "../utils";
import { useAmountUi } from "./util-hooks";
import { Duration, TimeResolution, Token } from "../types";
import { useMainStore } from "../store/main-store";
import {
  MAX_DURATION_MILLIS,
  MAX_TRADE_INTERVAL,
  MAX_TRADE_INTERVAL_FORMATTED,
  MIN_DURATION_MILLIS,
  MIN_DURATION_MILLIS_FORMATTED,
  MIN_TRADE_INTERVAL,
  MIN_TRADE_INTERVAL_FORMATTED,
} from "../consts";
import translations from "../i18n/en.json";
import { useMainContext } from "../providers/main-provider";

export const useLimitPrice = (marketPrice?: string, dstToken?: Token) => {
  const { isCustomLimitPrice, customLimitPrice, isInvertedLimitPrice, isMarketOrder } = useMainStore();

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
    return amountBN(dstToken?.decimals, result);
  }, [isCustomLimitPrice, customLimitPrice, dstToken, isInvertedLimitPrice, marketPrice, isMarketOrder]);

  return price;
};

export const useDstMinAmountOut = (srcChunkAmount?: string, limitPrice?: string, srcToken?: Token, dstToken?: Token) => {
  const priceUi = useAmountUi(dstToken?.decimals, limitPrice);
  const isMarketOrder = useIsMarketOrder();
  const amount = useMemo(() => {
    let amount = BN(1).toString();
    if (srcChunkAmount && !isMarketOrder && srcToken && dstToken && BN(limitPrice || "0").gt(0)) {
      amount = BN.max(1, convertDecimals(BN(srcChunkAmount).times(parsebn(priceUi || "0")), srcToken.decimals, dstToken.decimals).integerValue(BN.ROUND_FLOOR)).toString();
    }
    return amount;
  }, [srcToken, dstToken, srcChunkAmount, limitPrice, isMarketOrder]);

  return amount;
};

export const useOutAmount = (typedValue?: string, limitPrice?: string) => {
  return useMemo(() => {
    if (!limitPrice || !typedValue) {
      return undefined;
    }
    return BN(limitPrice).multipliedBy(typedValue).decimalPlaces(0).toString();
  }, [limitPrice, typedValue]);
};

export const useIsPartialFillWarning = (chunks = 1) => {
  const fillDelayUiMillis = useFillDelay();
  const durationMillis = useDuration(chunks).millis;

  return useMemo(() => {
    const warning = chunks * fillDelayUiMillis > durationMillis;
    if (!warning) return;

    return translations.partialFillWarning;
  }, [chunks, fillDelayUiMillis, durationMillis]);
};

export const useMinDuration = (chunks?: number) => {
  const fillDelayUiMillis = useFillDelay();

  return useMemo(() => {
    const _millis = fillDelayUiMillis * 2 * (chunks || 1);
    const resolution = [TimeResolution.Days, TimeResolution.Hours, TimeResolution.Minutes].find((r) => r <= _millis) || TimeResolution.Minutes;
    const duration = { resolution, amount: Number(BN(_millis / resolution).toFixed(2)) };

    return {
      duration,
      millis: (duration.amount || 0) * duration.resolution,
    };
  }, [fillDelayUiMillis, chunks]);
};

export const useChunks = (maxPossibleChunks = 1) => {
  const { isLimitPanel } = useMainContext();
  const { customChunks } = useMainStore();

  return useMemo(() => {
    if (isLimitPanel) return 1;
    if (typeof customChunks === "number") return customChunks;
    return maxPossibleChunks;
  }, [customChunks, maxPossibleChunks, isLimitPanel]);
};

export const useMaxPossibleChunks = (typedValue?: string, srcUsd?: string | number) => {
  const config = useMainContext().config;
  return useMemo(() => {
    if (!config || !typedValue || !srcUsd) return 1;
    const res = BN.max(1, BN(typedValue).div(srcUsd).times(config.minChunkSizeUsd)).integerValue(BN.ROUND_FLOOR).toNumber();
    return res > 1 ? res : 1;
  }, [srcUsd, config, typedValue]);
};

export const useFillDelay = () => {
  const { isLimitPanel } = useMainContext();
  const { customFillDelay } = useMainStore();

  const millis = useMemo(() => {
    if (isLimitPanel) {
      return TimeResolution.Minutes * MIN_TRADE_INTERVAL_FORMATTED;
    }
    return customFillDelay.amount! * customFillDelay.resolution;
  }, [customFillDelay, isLimitPanel]);

  return millis;
};

export const useIsMarketOrder = () => {
  const { isLimitPanel } = useMainContext();
  const { isMarketOrder } = useMainStore();

  return isLimitPanel ? false : isMarketOrder;
};

export const useMinimumDelayMinutes = () => {
  const estimatedDelayBetweenChunksMillis = useEstimatedDelayBetweenChunksMillis();
  return useMemo(() => estimatedDelayBetweenChunksMillis / 1000 / 60, [estimatedDelayBetweenChunksMillis]);
};

export const useLimitPricePercentDiffFromMarket = (limitPrice?: string, marketPrice?: string) => {
  const isInvertedLimitPrice = useMainStore().isInvertedLimitPrice;

  return useMemo(() => {
    if (!limitPrice || !marketPrice || BN(limitPrice).isZero() || BN(limitPrice).isZero()) return "0";
    const from = isInvertedLimitPrice ? marketPrice : limitPrice;
    const to = isInvertedLimitPrice ? limitPrice : marketPrice;
    return BN(from).div(to).minus(1).multipliedBy(100).decimalPlaces(2, BN.ROUND_HALF_UP).toString();
  }, [limitPrice, marketPrice, isInvertedLimitPrice]);
};

export const useDeadline = () => {
  const confirmationClickTimestamp = useMainStore().confirmationClickTimestamp;

  const { duration: durationUi } = useDuration();

  return useMemo(() => {
    const millis = moment(confirmationClickTimestamp)
      .add((durationUi.amount || 0) * durationUi.resolution)
      .add(1, "minute")
      .valueOf();
    return millis;
  }, [durationUi, confirmationClickTimestamp]);
};

export const useSrcChunkAmount = (srcAmount?: string, chunks?: number) => {
  return useMemo(() => {
    if (!chunks || !srcAmount) {
      return "0";
    }
    return BN(srcAmount).div(chunks).integerValue(BN.ROUND_FLOOR).toString();
  }, [srcAmount, chunks]);
};

// export const useShouldOnlyWrap = () => {
//   const { srcToken, dstToken } = useMainContext();
//   const network = useNetwork();

//   return useMemo(() => {
//     return isNativeAddress(srcToken?.address || "") && eqIgnoreCase(dstToken?.address || "", network?.wToken.address || "");
//   }, [srcToken, dstToken, network]);
// };

// export const useShouldUnwrap = () => {
//   const { srcToken, dstToken } = useMainContext();
//   const network = useNetwork();

//   return useMemo(() => {
//     return eqIgnoreCase(srcToken?.address || "", network?.wToken.address || "") && isNativeAddress(dstToken?.address || "");
//   }, [srcToken, dstToken, network]);
// };

// export const useSwitchTokens = () => {
//   const { onSwitchTokens } = useMainContext();
//   const resetLimit = stateActions.useResetLimitAfterTokenSwitch();

//   return useCallback(() => {
//     onSwitchTokens?.();
//     resetLimit();
//   }, [resetLimit, onSwitchTokens]);
// };

const isEqual = (tokenA?: any, tokenB?: any) => {
  return eqIgnoreCase(tokenA?.address || "", tokenB?.address || "") || eqIgnoreCase(tokenA?.symbol, tokenB?.symbol);
};

// export const useTokenSelect = () => {
//   const switchTokens = useSwitchTokens();
//   const { onSrcTokenSelected, onDstTokenSelected, srcToken, dstToken } = useMainContext();
//   return useCallback(
//     ({ isSrc, token }: { isSrc: boolean; token: any }) => {
//       if (isSrc && isEqual(token, dstToken)) {
//         switchTokens?.();
//         return;
//       }

//       if (!isSrc && isEqual(token, srcToken)) {
//         switchTokens?.();
//         return;
//       }

//       if (isSrc) {
//         onSrcTokenSelected?.(token);
//       } else {
//         onDstTokenSelected?.(token);
//       }
//     },
//     [onDstTokenSelected, onSrcTokenSelected, srcToken, dstToken, switchTokens]
//   );
// };

// Warnigns //

export const useFillDelayWarning = () => {
  const fillDelayMillis = useFillDelay();

  return useMemo(() => {
    if (fillDelayMillis < MIN_TRADE_INTERVAL) {
      return {
        type: "MIN_FILL_DELAY",
        text: translations.minTradeIntervalWarning.replace("{tradeInterval}", MIN_TRADE_INTERVAL_FORMATTED.toString()),
      };
    }
    if (fillDelayMillis > MAX_TRADE_INTERVAL) {
      return {
        type: "MAX_FILL_DELAY",
        text: translations.maxTradeIntervalWarning.replace("{tradeInterval}", MAX_TRADE_INTERVAL_FORMATTED.toString()),
      };
    }
  }, [fillDelayMillis]);
};

export const useTradeDurationWarning = (duration = 0) => {
  const { customDuration } = useMainStore();

  return useMemo(() => {
    if (!customDuration) return;
    if (duration < MIN_DURATION_MILLIS) {
      return {
        type: "MIN_DURATION",
        text: translations.minDurationWarning.replace("{duration}", MIN_DURATION_MILLIS_FORMATTED.toString()),
      };
    }
    if (duration > MAX_DURATION_MILLIS) {
      return {
        type: "MAX_DURATION",
        text: translations.maxDurationWarning,
      };
    }
  }, [duration, customDuration]);
};

export const useSrcChunkAmountUsd = (srcChunksAmount?: string, singleTokenUsd?: string | number) => {
  return useMemo(() => {
    if (!srcChunksAmount || !singleTokenUsd) return "0";
    return BN(srcChunksAmount || 0)
      .times(singleTokenUsd)
      .toString();
  }, [srcChunksAmount, singleTokenUsd]);
};

export const useTradeSizeWarning = ( srcChunkAmountUsd?: string, srcAmount?: string, chunks?: number) => {
  const config = useMainContext().config;

  
  return useMemo(() => {
    if (BN(srcAmount || 0).isZero() || !config || !chunks || !srcChunkAmountUsd) return;
    const minTradeSizeUsd = BN(config.minChunkSizeUsd || 0);
    if (BN(chunks).isZero() || BN(srcChunkAmountUsd || 0).isLessThan(minTradeSizeUsd)) {
      return {
        type: "MIN_TRADE_SIZE",
        text: translations.tradeSizeMustBeEqual.replace("{minChunkSizeUsd}", minTradeSizeUsd.toString()),
      };
    }
  }, [chunks, translations, srcChunkAmountUsd, config, srcAmount]);
};

export const useLowPriceWarning = (srcToken?: Token, dstToken?: Token, marketPrice?: string) => {
  const { isLimitPanel } = useMainContext();
  const priceDeltaPercentage = useLimitPricePercentDiffFromMarket();

  const { isInvertedLimitPrice } = useMainStore();

  return useMemo(() => {
    if (!srcToken || !dstToken || !isLimitPanel) {
      return;
    }
    const isWarning = isInvertedLimitPrice ? BN(priceDeltaPercentage).isGreaterThan(0) : BN(priceDeltaPercentage).isLessThan(0);

    if (!isWarning) {
      return;
    }

    const title = isInvertedLimitPrice ? translations.limitPriceWarningTitleInverted : translations.limitPriceWarningTitle;
    const subtitle = isInvertedLimitPrice ? translations.limitPriceWarningSubtileInverted : translations.limitPriceWarningSubtitle;
    return {
      title: title.replace("{symbol}", isInvertedLimitPrice ? dstToken?.symbol : srcToken?.symbol),
      subTitle: subtitle.replace(
        "{percent}",
        BN(priceDeltaPercentage || 0)
          .abs()
          .toString(),
      ),
    };
  }, [isLimitPanel, marketPrice, isInvertedLimitPrice, srcToken, dstToken, priceDeltaPercentage]);
};

export const useDuration = (chunks?: number) => {
  const { duration: minDuration } = useMinDuration(chunks);
  const { customDuration } = useMainStore();

  const duration = useMemo(() => {
    if (customDuration) {
      return customDuration;
    }
    return minDuration;
  }, [customDuration, minDuration]);

  const millis = useMemo(() => (duration.amount || 0) * duration.resolution, [duration]);

  return {
    duration,
    millis,
  };
};

// export const useShouldWrap = () => {
//   const { srcToken } = useMainContext();

//   return useMemo(() => {
//     return isNativeAddress(srcToken?.address || "");
//   }, [srcToken]);
// };

// export const useSetSwapSteps = () => {
//   const shouldWrap = useShouldWrap();
//   const { data: haveAllowance } = query.useAllowance();
//   const updateState = useMainContext().updateState;
//   return useCallback(() => {
//     let swapSteps: SwapStep[] = [];
//     if (shouldWrap) {
//       swapSteps.push("wrap");
//     }
//     if (!haveAllowance) {
//       swapSteps.push("approve");
//     }
//     swapSteps.push("createOrder");
//     updateState({ swapSteps });
//   }, [haveAllowance, shouldWrap, updateState]);
// };

// export const useSwapPrice = () => {
//   const srcAmount = useSrcAmount().amountUi;
//   const { srcUsd, dstUsd } = useMainContext();
//   const outAmount = useOutAmount().amountUi;

//   const price = useMemo(() => {
//     if (!outAmount || !srcAmount) return "0";
//     return BN(outAmount).dividedBy(srcAmount).toString();
//   }, [srcAmount, outAmount]);

//   const usd = useMemo(() => {
//     if (!dstUsd || !srcUsd) return "0";
//     return BN(dstUsd).multipliedBy(price).toString();
//   }, [price, srcUsd, dstUsd]);

//   return {
//     price,
//     usd,
//   };
// };

export const useEstimatedDelayBetweenChunksMillis = () => {
  const config = useMainContext().config;

  return useMemo(() => {
    if (!config) return 0;
    return config.bidDelaySeconds * 1000 * 2;
  }, [config]);
};

// Hook for handling swap reset
export const useResetStore = () => {
  const { updateState } = useMainStore();

  return useCallback(() => {
    updateState({
      limitPricePercent: undefined,
      customLimitPrice: undefined,
      isCustomLimitPrice: false,
      isInvertedLimitPrice: false,
      customChunks: undefined,
      customFillDelay: { resolution: TimeResolution.Minutes, amount: MIN_TRADE_INTERVAL_FORMATTED },
    });
  }, [updateState]);
};

export const useOnFillDelay = () => {
  const { updateState } = useMainStore();
  return useCallback(
    (customFillDelay: Duration) => {
      updateState({ customFillDelay });
    },
    [updateState],
  );
};

export const useOnDuration = () => {
  const { updateState } = useMainStore();

  return useCallback(
    (customDuration?: Duration) => {
      updateState({ customDuration });
    },
    [updateState],
  );
};

export const useInvertLimit = () => {
  const { isInvertedLimitPrice, updateState } = useMainStore();

  return useCallback(() => {
    updateState({
      isInvertedLimitPrice: !isInvertedLimitPrice,
      customLimitPrice: undefined,
      isCustomLimitPrice: false,
      limitPricePercent: undefined,
    });
  }, [isInvertedLimitPrice, updateState]);
};

export const useOnChunks = () => {
  const updateState = useMainStore().updateState;

  return useCallback(
    (chunks: number) => {
      updateState({ customChunks: chunks });
    },
    [updateState],
  );
};

// Hook for handling limit change
export const useOnLimitChange = () => {
  const { updateState } = useMainStore();
  return useCallback(
    (customLimitPrice: string, limitPricePercent?: string) => {
      updateState({
        customLimitPrice,
        isCustomLimitPrice: true,
        isMarketOrder: false,
        limitPricePercent,
      });
    },
    [updateState],
  );
};

// Hook for resetting custom limit
export const useOnResetCustomLimit = () => {
  const { updateState } = useMainStore();
  return useCallback(() => {
    updateState({
      isCustomLimitPrice: false,
      customLimitPrice: undefined,
      limitPricePercent: undefined,
    });
  }, [updateState]);
};

// Hook for resetting limit price
export const useResetLimitPrice = () => {
  const { updateState } = useMainStore();

  return useCallback(() => {
    updateState({
      isCustomLimitPrice: false,
      customLimitPrice: undefined,
      limitPricePercent: undefined,
      isInvertedLimitPrice: false,
    });
  }, [updateState]);
};

export const useOnMarket = () => {
  const { updateState } = useMainStore();
  return useCallback(
    (isMarketOrder: boolean) => {
      updateState({
        isMarketOrder,
      });
    },
    [updateState]
  );
};

// const useOnOrderCreated = () => {
//   const { updateState } = useMainContext();

//   return useCallback(() => {
//     updateState({ swapState: "success", createOrderSuccess: true, selectedOrdersTab: 0 });
//   }, [updateState]);
// };
