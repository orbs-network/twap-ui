import { useCallback, useMemo } from "react";
import { TimeResolution } from "../types";
import * as libHooks from "../hooks/lib";
import {
  MAX_DURATION_MILLIS,
  MAX_TRADE_INTERVAL,
  MAX_TRADE_INTERVAL_FORMATTED,
  MIN_DURATION_MILLIS,
  MIN_DURATION_MILLIS_FORMATTED,
  MIN_TRADE_INTERVAL,
  MIN_TRADE_INTERVAL_FORMATTED,
} from "../consts";
import { amountBNV2, amountUiV2, fillDelayText, formatDecimals } from "../utils";
import { useIntegrationContext } from "./context";
import BN from "bignumber.js";
import { useIntegrationStore } from "./store";
import { useAmountUi, useFormatDecimals } from "../hooks";
import { convertDecimals, eqIgnoreCase, isNativeAddress, networks, parsebn } from "@defi.org/web3-candies";
import moment from "moment";
import TwapAbi from "@orbs-network/twap/twap.abi.json";

export const useTradeInterval = () => {
  const {
    state: { customFillDelay },
    isLimitPanel,
    translations,
    updateState,
  } = useIntegrationContext();

  const millis = useMemo(() => {
    if (isLimitPanel) {
      return TimeResolution.Minutes * MIN_TRADE_INTERVAL_FORMATTED;
    }
    return customFillDelay.amount! * customFillDelay.resolution;
  }, [customFillDelay, isLimitPanel]);

  const warning = useMemo(() => {
    if (millis < MIN_TRADE_INTERVAL) {
      return translations.minTradeIntervalWarning.replace("{tradeInterval}", MIN_TRADE_INTERVAL_FORMATTED.toString());
    }
    if (millis > MAX_TRADE_INTERVAL) {
      return translations.maxTradeIntervalWarning.replace("{tradeInterval}", MAX_TRADE_INTERVAL_FORMATTED.toString());
    }
  }, [millis, translations]);

  const onResolution = useCallback(
    (resolution: TimeResolution) => {
      updateState({ customFillDelay: { resolution, amount: customFillDelay.amount } });
    },
    [customFillDelay, updateState],
  );

  const onChange = useCallback(
    (millis: number | string) => {
      updateState({ customFillDelay: { resolution: customFillDelay.resolution, amount: Number(millis) } });
    },
    [updateState, customFillDelay],
  );

  return {
    millis,
    text: useMemo(() => fillDelayText(millis, translations), [millis, translations]),
    onResolution,
    onChange,
    warning,
  };
};

export const useTotalTradesAmount = () => {
  const {
    isLimitPanel,
    state: { customChunks },
  } = useIntegrationContext();

  const maxPossibleTrades = useMaxPossibleTrades();

  return useMemo(() => {
    if (isLimitPanel) return 1;
    if (typeof customChunks === "number") return customChunks;
    return maxPossibleTrades;
  }, [customChunks, maxPossibleTrades, isLimitPanel]);
};

const useMinDuration = () => {
  const fillDelayUiMillis = useTradeInterval().millis;
  const chunks = useTotalTradesAmount();

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

export const useTradeDuration = () => {
  const { duration: minDuration } = useMinDuration();
  const {
    updateState,
    isLimitPanel,
    state: { customDuration },
    translations,
  } = useIntegrationContext();

  const duration = useMemo(() => {
    if (isLimitPanel) {
      return { resolution: TimeResolution.Days, amount: 7 };
    }
    if (customDuration) {
      return customDuration;
    }
    return minDuration;
  }, [isLimitPanel, customDuration, minDuration]);

  const millis = useMemo(() => (duration.amount || 0) * duration.resolution, [duration]);

  const warning = useMemo(() => {
    if (!customDuration) return;
    if (millis < MIN_DURATION_MILLIS) {
      return translations.minDurationWarning.replace("{duration}", MIN_DURATION_MILLIS_FORMATTED.toString());
    }
    if (millis > MAX_DURATION_MILLIS) {
      return translations.maxDurationWarning;
    }
  }, [customDuration, millis, translations]);

  const onResolution = useCallback(
    (resolution: TimeResolution) => {
      updateState({ customDuration: { resolution, amount: duration.amount } });
    },
    [duration.amount, updateState],
  );

  const onChange = useCallback(
    (amount: string | number) => {
      updateState({ customDuration: { resolution: duration.resolution, amount: Number(amount) } });
    },
    [duration.resolution, updateState],
  );

  return {
    millis,
    duration,
    warning,
    onResolution,
    onChange,
  };
};

export const useSingleTradeSizeUsd = () => {
  const { srcToken, srcUsdPrice } = useIntegrationContext();
  const srcChunksAmount = useSingleTradeSize().amount;

  const result = useMemo(() => {
    if (!srcToken || !srcUsdPrice) return;
    return BN(srcChunksAmount || 0)
      .times(srcUsdPrice)
      .toString();
  }, [srcChunksAmount, srcUsdPrice]);

  return useAmountUi(srcToken?.decimals, result);
};

export const useSingleTradeSize = () => {
  const {
    state: { srcAmount },
    srcToken,
    config,
    translations,
  } = useIntegrationContext();
  const { trades: chunks } = useTotalTrades();

  const singleChunksUsd = useMemo(() => {
    if (!srcAmount || !chunks) return "0";
    const res = chunks === 0 ? BN(0) : BN(srcAmount).div(chunks).integerValue(BN.ROUND_FLOOR) || BN(0);
    return res.toString();
  }, [srcAmount, chunks]);

  const warning = useMemo(() => {
    if (BN(srcAmount || 0).isZero()) return;
    const minTradeSizeUsd = BN(config.minChunkSizeUsd || 0);
    if (BN(chunks).isZero() || BN(singleChunksUsd || 0).isLessThan(minTradeSizeUsd)) {
      return translations.tradeSizeMustBeEqual.replace("{minChunkSizeUsd}", minTradeSizeUsd.toString());
    }
  }, [chunks, translations, singleChunksUsd, config, srcAmount]);

  return {
    amount: singleChunksUsd,
    amountUi: useFormatDecimals(useAmountUi(srcToken?.decimals, singleChunksUsd), 2),
    warning,
  };
};

const useMaxPossibleTrades = () => {
  const { config, state, srcUsdPrice } = useIntegrationContext();
  const { srcAmount, srcToken } = state;

  return useMemo(() => {
    if (!config || !srcAmount || !srcToken || !srcUsdPrice) return 1;
    const res = BN.max(1, BN(srcAmount).div(BN(10).pow(srcToken?.decimals).div(srcUsdPrice).times(config.minChunkSizeUsd)))
      .integerValue(BN.ROUND_FLOOR)
      .toNumber();
    return res > 1 ? res : 1;
  }, [config, srcAmount, srcToken, srcUsdPrice]);
};

export const useMaxPossibleChunks = () => {
  const {
    config,
    srcUsdPrice,
    srcToken,
    state: { srcAmount },
  } = useIntegrationContext();

  return useMemo(() => {
    if (!config || !srcToken || !srcAmount || !srcUsdPrice) return 1;
    const res = BN.max(1, BN(srcAmount).div(BN(10).pow(srcToken.decimals).div(srcUsdPrice).times(config.minChunkSizeUsd)))
      .integerValue(BN.ROUND_FLOOR)
      .toNumber();
    return res > 1 ? res : 1;
  }, [srcAmount, srcToken, srcUsdPrice, config]);
};

const useTotalTrades = () => {
  const { isLimitPanel, state, updateState } = useIntegrationContext();
  const { customChunks } = state;
  const maxPossibleChunks = useMaxPossibleChunks();

  const trades = useMemo(() => {
    if (isLimitPanel) return 1;
    if (typeof customChunks === "number") return customChunks;
    return maxPossibleChunks;
  }, [customChunks, maxPossibleChunks, isLimitPanel]);

  const onChange = useCallback(
    (chunks: number) => {
      updateState({ customChunks: chunks });
    },
    [updateState],
  );

  return {
    trades,
    onChange,
  };
};

const useOnSrcAmount = () => {
  const {
    updateState,
    state: { srcToken },
  } = useIntegrationStore();
  return useCallback(
    (srcAmountUi: string) => {
      updateState({
        srcAmountUi,
        srcAmount: amountBNV2(srcToken?.decimals, srcAmountUi),
      });
    },
    [updateState, srcToken],
  );
};

export const useMinAmountOut = () => {
  const { priceUi } = useLimitPrice();
  const { srcToken, dstToken } = useIntegrationContext();
  const srcChunkAmount = useSingleTradeSize().amount;

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

export const useDeadline = () => {
  const {
    state: { confirmationClickTimestamp },
  } = useIntegrationContext();

  const { duration } = useTradeDuration();

  return useMemo(() => {
    const millis = moment(confirmationClickTimestamp)
      .add((duration.amount || 0) * duration.resolution)
      .add(1, "minute")
      .valueOf();
    return {
      millis,
      text: moment(millis).format("ll HH:mm"),
    };
  }, [duration, confirmationClickTimestamp]);
};

const useEstimatedDelayBetweenChunksMillis = () => {
  const { config } = useIntegrationContext();
  return useMemo(() => {
    return config.bidDelaySeconds * 1000 * 2;
  }, [config]);
};

export const useOutAmount = () => {
  const { price, isLoading } = useLimitPrice();
  const {
    dstToken,
    state: { srcAmount },
  } = useIntegrationContext();

  const outAmount = useMemo(() => {
    if (!srcAmount || BN(srcAmount || 0).isZero()) return;

    return !price ? undefined : BN(price).multipliedBy(srcAmount).decimalPlaces(0).toString();
  }, [price, srcAmount]);

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
  const {
    state: { srcAmount },
    srcUsdPrice,
    srcToken,
    dstUsdPrice,
    dstToken,
  } = useIntegrationContext();
  const dstAmount = useOutAmount().amount;

  const dstUsdAmount = useMemo(() => {
    return getUsdAmount(dstAmount, dstUsdPrice);
  }, [dstAmount, dstUsdPrice]);

  const srcUsdAmount = useMemo(() => {
    return getUsdAmount(srcAmount, srcUsdPrice);
  }, [srcAmount, srcUsdPrice]);

  return {
    srcUsd: useAmountUi(srcToken?.decimals, srcUsdAmount),
    dstUsd: useAmountUi(dstToken?.decimals, dstUsdAmount),
  };
};

export const useSwapData = () => {
  const amountUsd = useUsdAmount();
  const outAmount = useOutAmount();
  const deadline = useDeadline();
  const srcChunkAmount = useSingleTradeSize();
  const dstMinAmount = useMinAmountOut();
  const fillDelay = useTradeInterval();
  const chunks = useTotalTrades();
  const {
    srcToken,
    dstToken,
    state: { srcAmount },
  } = useIntegrationContext();

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

export const useCreateOrder = () => {
  const {
    askDataParams,
    dstToken,
    srcToken,
    config,
    state: { srcAmount },
  } = useIntegrationContext();
  const minAmountOut = useMinAmountOut().amount;
  const singleTradeSize = useSingleTradeSize().amount;
  const deadline = useDeadline().millis;
  const fillDelayMillisUi = useTradeInterval().millis;

  const estimatedDelayBetweenChunksMillis = useEstimatedDelayBetweenChunksMillis();
  const fillDelaySeconds = (fillDelayMillisUi - estimatedDelayBetweenChunksMillis) / 1000;

  return useMemo(() => {
    if (!srcToken || !dstToken || !srcAmount) return;
    const askParams = [
      config.exchangeAddress,
      srcToken.address,
      dstToken.address,
      BN(srcAmount).toFixed(0),
      BN(singleTradeSize).toFixed(0),
      BN(minAmountOut).toFixed(0),
      BN(deadline).div(1000).toFixed(0),
      BN(config.bidDelaySeconds).toFixed(0),
      BN(fillDelaySeconds).toFixed(0),
      askDataParams,
    ];
    const twapContract = config.twapAddress;

    return {
      askParams,
      twapContract,
      abi: TwapAbi,
    };
  }, [srcToken, dstToken, srcAmount, singleTradeSize, minAmountOut, deadline, fillDelaySeconds, askDataParams, config]);
};

export const useMarketPrice = () => {
  const { marketPrice: marketPriceRaw, dstToken } = useIntegrationContext();

  const isLoading = useMemo(() => {
    return BN(marketPriceRaw || 0).isZero();
  }, [marketPriceRaw]);

  return {
    marketPrice: marketPriceRaw,
    marketPriceUi: useAmountUi(dstToken?.decimals, marketPriceRaw),
    isLoading,
  };
};

// Limit price
export const useOnLimitPercentageClick = () => {
  const { marketPrice } = useMarketPrice();
  const { state, dstToken, updateState } = useIntegrationContext();
  const { isInvertedLimitPrice } = state;

  return useCallback(
    (percent: string) => {
      if (BN(percent).isZero()) {
        updateState({
          isCustomLimitPrice: false,
          customLimitPrice: undefined,
          limitPricePercent: undefined,
        });
        return;
      }
      const p = BN(percent || 0)
        .div(100)
        .plus(1)
        .toString();
      let price = amountUiV2(dstToken?.decimals, marketPrice);

      if (isInvertedLimitPrice) {
        price = BN(1)
          .div(price || "0")
          .toString();
      }

      const value = BN(price || "0")
        .times(p)
        .toString();

      updateState({
        customLimitPrice: formatDecimals(value),
        isCustomLimitPrice: true,
        isMarketOrder: false,
        limitPricePercent: percent,
      });
    },
    [marketPrice, dstToken, isInvertedLimitPrice, updateState],
  );
};

export const useLimitPrice = () => {
  const { isLoading, marketPrice } = useMarketPrice();
  const { state, dstToken } = useIntegrationContext();
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

export const useLimitInput = () => {
  const { state, dstToken, updateState } = useIntegrationContext();
  const { isInvertedLimitPrice, isCustomLimitPrice, customLimitPrice } = state;
  const { priceUi, isLoading } = useLimitPrice();

  const value = useMemo(() => {
    if (isCustomLimitPrice) {
      return customLimitPrice;
    }
    let res = priceUi;

    if (isInvertedLimitPrice) {
      res = BN(1)
        .div(res || 0)
        .toString();
    }

    return formatDecimals(res);
  }, [customLimitPrice, isCustomLimitPrice, isInvertedLimitPrice, priceUi, dstToken]);

  const onChange = useCallback(() => {
    updateState({
      customLimitPrice,
      isCustomLimitPrice: true,
      isMarketOrder: false,
      limitPricePercent: undefined,
    });
  }, [customLimitPrice, updateState]);

  return {
    value: value || "",
    onChange,
    isLoading,
  };
};
const defaultPercent = [1, 5, 10];

const useList = () => {
  const { isInvertedLimitPrice } = useIntegrationContext().state;

  return useMemo(() => {
    if (isInvertedLimitPrice) {
      return defaultPercent.map((it) => -it).map((it) => it.toString());
    }
    return defaultPercent.map((it) => it.toString());
  }, [isInvertedLimitPrice]);
};

export const useLimitPricePercentDiffFromMarket = () => {
  const limitPrice = useLimitPrice().price;
  const marketPrice = useMarketPrice().marketPrice;
  const isInvertedLimitPrice = useIntegrationContext().state.isInvertedLimitPrice;

  return useMemo(() => {
    if (!limitPrice || !marketPrice || BN(limitPrice).isZero() || BN(limitPrice).isZero()) return "0";
    const from = isInvertedLimitPrice ? marketPrice : limitPrice;
    const to = isInvertedLimitPrice ? limitPrice : marketPrice;
    return BN(from).div(to).minus(1).multipliedBy(100).decimalPlaces(2, BN.ROUND_HALF_UP).toString();
  }, [limitPrice, marketPrice, isInvertedLimitPrice]);
};

const useCustomPercent = () => {
  const priceDeltaPercentage = useLimitPricePercentDiffFromMarket();
  const { limitPricePercent } = useIntegrationContext().state;

  const formatted = useList();

  const custom = useMemo(() => {
    if (BN(priceDeltaPercentage).isZero()) {
      return false;
    }

    if (BN(limitPricePercent || 0).gt(0)) {
      return false;
    }

    if (limitPricePercent && formatted.includes(limitPricePercent)) {
      return false;
    }
    if (priceDeltaPercentage && formatted.includes(priceDeltaPercentage)) {
      return false;
    }

    return true;
  }, [priceDeltaPercentage, limitPricePercent, formatted]);

  return custom ? priceDeltaPercentage : undefined;
};

export const useLimitPercentList = () => {
  const priceDeltaPercentage = useLimitPricePercentDiffFromMarket();
  const formatted = useList();
  const custom = useCustomPercent();

  return useMemo(() => {
    if (!custom) {
      return ["0", ...formatted];
    }
    return formatted;
  }, [formatted, custom, priceDeltaPercentage]);
};

export const useLimitTokens = () => {
  const { translations: t, state, srcToken, dstToken } = useIntegrationContext();

  const { isInvertedLimitPrice: inverted } = state;
  return useMemo(() => {
    return {
      srcToken: inverted ? dstToken : srcToken,
      dstToken: inverted ? srcToken : dstToken,
    };
  }, [srcToken, dstToken, inverted]);
};

export const useIsLimitInverted = () => {
  const { isInvertedLimitPrice: inverted } = useIntegrationContext().state;
  return inverted;
};

export const useLimitResetButton = () => {
  const customPercent = useCustomPercent();
  const onSelectCallback = useOnLimitPercentageClick();
  const onReset = useCallback(() => {
    onSelectCallback("0");
  }, [onSelectCallback]);

  return {
    value: customPercent,
    onReset,
  };
};

export const useInvertLimit = () => {
  const { state, updateState } = useIntegrationContext();
  return useCallback(() => {
    updateState({
      isInvertedLimitPrice: !state.isInvertedLimitPrice,
      customLimitPrice: undefined,
      isCustomLimitPrice: false,
      limitPricePercent: undefined,
    });
  }, [state, updateState]);
};

export const useLimitPercentButton = (percent: string) => {
  const { isInvertedLimitPrice: inverted, limitPricePercent } = useIntegrationContext().state;
  const { price: limitPrice } = useLimitPrice();

  const priceDeltaPercentage = useLimitPricePercentDiffFromMarket();

  const isSelected = useMemo(() => {
    const p = limitPricePercent || priceDeltaPercentage;
    if (BN(limitPrice || 0).isZero()) {
      return false;
    }

    return BN(p || 0).eq(percent);
  }, [limitPricePercent, limitPrice, priceDeltaPercentage, percent]);

  const text = useMemo(() => {
    return `${BN(percent || 0).isZero() ? "" : inverted ? "-" : !inverted && "+"} ${Math.abs(Number(percent))} %`;
  }, [inverted, percent]);

  const onSelectCallback = useOnLimitPercentageClick();

  const onSelect = useCallback(() => {
    onSelectCallback(percent);
  }, [onSelectCallback, percent]);

  return {
    value: percent,
    isSelected,
    onSelect,
    text,
  };
};

export const useIsMarketOrder = () => {
  const { isLimitPanel, state } = useIntegrationContext();
  const isMarketOrder = state.isMarketOrder;

  return isLimitPanel ? false : isMarketOrder;
};

export const useNetwork = () => {
  const { config } = useIntegrationContext();

  return useMemo(() => {
    return Object.values(networks).find((network) => network.id === config.chainId);
  }, [config]);
};

export const useShouldOnlyWrap = () => {
  const { srcToken, dstToken } = useIntegrationContext();
  const network = useNetwork();

  return useMemo(() => {
    return isNativeAddress(srcToken?.address || "") && eqIgnoreCase(dstToken?.address || "", network?.wToken.address || "");
  }, [srcToken, dstToken, network]);
};

export const useShouldUnwrap = () => {
  const { srcToken, dstToken } = useIntegrationContext();
  const network = useNetwork();

  return useMemo(() => {
    return eqIgnoreCase(srcToken?.address || "", network?.wToken.address || "") && isNativeAddress(dstToken?.address || "");
  }, [srcToken, dstToken, network]);
};

export const useShouldWrapOrUnwrapOnly = () => {
  const wrap = useShouldOnlyWrap();
  const unwrap = useShouldUnwrap();

  return wrap || unwrap;
};

export const useLimitPricePanel = () => {
  const isMarket = useIsMarketOrder();
  const shouldWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();

  return {
    showWarning: isMarket,
    hidePanel: shouldWrapOrUnwrapOnly,
  };
};
