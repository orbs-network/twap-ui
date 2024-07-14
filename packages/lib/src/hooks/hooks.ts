import { Status, TokensValidation } from "@orbs-network/twap";
import { useTwapContext } from "../context/context";
import Web3 from "web3";
import { useCallback, useEffect, useMemo, useState } from "react";
import BN from "bignumber.js";
import { SwapStep, TimeResolution } from "../types";
import _ from "lodash";
import { eqIgnoreCase, setWeb3Instance, switchMetaMaskNetwork, isNativeAddress, parsebn, maxUint256 } from "@defi.org/web3-candies";
import {
  MAX_DURATION_MILLIS,
  MAX_TRADE_INTERVAL,
  MAX_TRADE_INTERVAL_FORMATTED,
  MIN_DURATION_MILLIS,
  MIN_DURATION_MILLIS_FORMATTED,
  MIN_NATIVE_BALANCE,
  MIN_TRADE_INTERVAL,
  MIN_TRADE_INTERVAL_FORMATTED,
  QUERY_PARAMS,
} from "../consts";
import { useNumericFormat } from "react-number-format";
import moment from "moment";
import { amountBN, amountBNV2, amountUi, amountUiV2, fillDelayText, formatDecimals, getExplorerUrl, isStableCoin, resetQueryParams } from "../utils";
import { query } from "./query";
import { stateActions, useSetQueryParams } from "../context/actions";

export const useRefetchBalances = () => {
  const { refetch: refetchSrcBalance } = useSrcBalance();
  const { refetch: refetchDstBalance } = useDstBalance();

  return useCallback(async () => {
    await Promise.all([refetchSrcBalance(), refetchDstBalance()]);
  }, [refetchSrcBalance, refetchDstBalance]);
};

export const useResetAfterSwap = () => {
  const resetAfterSwap = stateActions.useSwapReset();
  const refetchBalances = useRefetchBalances();

  return useCallback(async () => {
    resetAfterSwap();
    resetQueryParams();
    await refetchBalances();
  }, [resetAfterSwap, refetchBalances]);
};

export const useChangeNetwork = () => {
  const { config, provider: _provider } = useTwapContext().dappProps;
  const [loading, setLoading] = useState(false);

  const changeNetwork = async (onSuccess: () => void, onError: () => void) => {
    setWeb3Instance(new Web3(_provider));
    try {
      await switchMetaMaskNetwork(config.chainId);
      onSuccess();
    } catch (error) {
      onError();
    }
  };

  const onChangeNetwork = async () => {
    const onSuccess = () => {
      setLoading(false);
    };
    const onError = () => {
      setLoading(false);
    };
    setLoading(true);
    changeNetwork(onSuccess, onError);
  };
  return {
    changeNetwork: onChangeNetwork,
    loading,
  };
};

export const useCustomActions = () => {
  return useSetSrcAmountPercent();
};

export const useSrcBalance = () => {
  const srcToken = useTwapContext().srcToken;
  return query.useBalance(srcToken);
};

export const useDstBalance = () => {
  const dstToken = useTwapContext().dstToken;
  return query.useBalance(dstToken);
};

export const useFormatNumber = ({
  value,
  decimalScale = 3,
  prefix,
  suffix,
  disableDynamicDecimals = true,
}: {
  value?: string | number;
  decimalScale?: number;
  prefix?: string;
  suffix?: string;
  disableDynamicDecimals?: boolean;
}) => {
  const { disableThousandSeparator } = useTwapContext().uiPreferences;
  const result = useNumericFormat({
    allowLeadingZeros: true,
    thousandSeparator: disableThousandSeparator ? "" : ",",
    displayType: "text",
    value: value || "",
    decimalScale: 18,
    prefix,
    suffix,
  });

  return result.value?.toString();
};

export const useFormatNumberV2 = ({ value, decimalScale = 3, prefix, suffix }: { value?: string | number; decimalScale?: number; prefix?: string; suffix?: string }) => {
  const _value = useFormatDecimals(value, decimalScale);
  const { disableThousandSeparator } = useTwapContext().uiPreferences;
  const result = useNumericFormat({
    allowLeadingZeros: true,
    thousandSeparator: disableThousandSeparator ? "" : ",",
    displayType: "text",
    value: _value || "",
    decimalScale: 18,
    prefix,
    suffix,
  });

  return result.value?.toString();
};
export const useSrcAmountNotZero = () => {
  const srcAmountBN = useSrcAmount().srcAmountBN;

  return srcAmountBN.gt(0);
};

export const useTokenSelect = () => {
  const { dappProps } = useTwapContext();
  const { onSrcTokenSelected, onDstTokenSelected, parsedTokens } = dappProps;
  return useCallback(
    ({ isSrc, token }: { isSrc: boolean; token: any }) => {
      if (isSrc) {
        onSrcTokenSelected?.(token);
      } else {
        onDstTokenSelected?.(token);
      }
    },
    [onDstTokenSelected, onSrcTokenSelected]
  );
};

export const useToken = (isSrc?: boolean) => {
  const { srcToken, dstToken } = useTwapContext();

  return isSrc ? srcToken : dstToken;
};

export const useSwitchTokens = () => {
  const {
    dappProps: { onSwitchTokens },
  } = useTwapContext();
  const resetLimit = stateActions.useResetLimitAfterTokenSwitch();

  return useCallback(() => {
    onSwitchTokens?.();
    resetLimit();
  }, [resetLimit, onSwitchTokens]);
};

export const useOrdersTabs = () => {
  const { data: orders } = query.useOrdersHistory();

  const _orders = orders || {};

  const {
    uiPreferences: { orderTabsToExclude = ["All"] },
  } = useTwapContext();

  return useMemo(() => {
    const keys = ["All", ..._.keys(Status)];

    const res = _.filter(keys, (it) => !orderTabsToExclude?.includes(it));
    const mapped = _.map(res, (it) => {
      if (it === "All") {
        return { All: _.size(_.flatMap(_orders)) || 0 };
      }
      return { [it]: _.size((_orders as any)[it as Status]) || 0 };
    });

    return _.reduce(mapped, (acc, it) => ({ ...acc, ...it }), {});
  }, [orders]);
};

export const usePagination = <T>(list: T[] = [], chunkSize = 5) => {
  const [page, setPage] = useState(0);

  const chunks = useMemo(() => {
    return _.chunk(list, chunkSize);
  }, [list, chunkSize]);

  const pageList = useMemo(() => {
    return chunks[page] || [];
  }, [chunks, page]);

  return {
    list: pageList,
    page: page + 1,
    prevPage: () => setPage((p) => Math.max(p - 1, 0)),
    nextPage: () => setPage((p) => Math.min(p + 1, chunks.length - 1)),
    hasPrevPage: page > 0,
    hasNextPage: page < chunks.length - 1,
    text: `Page ${page + 1} of ${chunks.length}`,
  };
};

export const useOutAmount = () => {
  const { limitPrice, isLoading } = useLimitPrice();
  const { srcAmountUi, srcAmountBN } = useSrcAmount();
  const { dstToken } = useTwapContext();

  const wrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();

  const outAmount = useMemo(() => {
    if (!srcAmountUi) return;
    if (wrapOrUnwrapOnly) {
      return srcAmountBN.toString();
    }
    return !limitPrice ? undefined : BN(limitPrice).multipliedBy(srcAmountUi).decimalPlaces(0).toString();
  }, [limitPrice, srcAmountUi, wrapOrUnwrapOnly, srcAmountBN.toString()]);

  return {
    isLoading,
    outAmountUi: useAmountUi(dstToken?.decimals, outAmount) || "",
    outAmountRaw: outAmount || "",
  };
};

export const useMarketPrice = () => {
  const marketPriceRaw = useTwapContext().marketPrice;
  const { isWrongChain, dappProps, dstToken } = useTwapContext();
  const { account } = dappProps;

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

export const useFormatDecimals = (value?: string | BN | number, decimalPlaces?: number) => {
  return useMemo(() => formatDecimals(value, decimalPlaces), [value, decimalPlaces]);
};

export const useLimitPrice = () => {
  const { isLoading, marketPrice } = useMarketPrice();
  const { state, dstToken } = useTwapContext();
  const { isCustomLimitPrice, customLimitPrice, isInvertedLimitPrice, isMarketOrder } = state;

  const limitPrice = useMemo(() => {
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
    limitPrice,
    limitPriceUi: useAmountUi(dstToken?.decimals, limitPrice),
  };
};

export const useDstMinAmountOut = () => {
  const { limitPriceUi } = useLimitPrice();
  const { lib, srcToken, dstToken } = useTwapContext();
  const srcChunkAmount = useSrcChunkAmount();

  const isMarketOrder = useIsMarketOrder();
  return useMemo(() => {
    if (!isMarketOrder && lib && srcToken && dstToken && limitPriceUi && BN(limitPriceUi || "0").gt(0)) {
      const res = lib.dstMinAmountOut(srcToken!, dstToken!, srcChunkAmount, parsebn(limitPriceUi || "0"), false).toString();

      return res;
    }
    return BN(1).toString();
  }, [srcToken, dstToken, lib, srcChunkAmount, limitPriceUi]);
};

export const useDstMinAmountOutUi = () => {
  const dstMinAmountOut = useDstMinAmountOut();
  const { dstToken } = useTwapContext();
  return useAmountUi(dstToken?.decimals, dstMinAmountOut);
};

export const useAmountUi = (decimals?: number, value?: string) => {
  return useMemo(() => {
    if (!decimals || !value) return;
    return amountUiV2(decimals, value);
  }, [decimals, value]);
};

export const useAmountBN = (decimals?: number, value?: string) => {
  return useMemo(() => {
    if (!decimals || !value) return;
    return amountBNV2(decimals, value);
  }, [decimals, value]);
};

export const useSrcAmountUsdUi = () => {
  const srcAmount = useSrcAmount().srcAmountBN;
  const { srcToken, srcUsd } = useTwapContext();

  return useAmountUi(srcToken?.decimals, srcAmount.times(srcUsd).toString());
};

export const useDstAmountUsdUi = () => {
  const dstAmount = useOutAmount().outAmountRaw;
  const { dstToken, dstUsd } = useTwapContext();

  const value = useMemo(() => {
    return BN(dstAmount || "0")
      .times(dstUsd)
      .toString();
  }, [dstAmount, dstUsd]);

  return useAmountUi(dstToken?.decimals, value);
};

export const useMaxPossibleChunks = () => {
  const srcAmount = useSrcAmount().srcAmountBN.toString();
  const { lib, srcToken, srcUsd } = useTwapContext();

  return useMemo(() => {
    if (!lib || !srcToken || !srcAmount || !srcUsd) return 1;
    const res = lib.maxPossibleChunks(srcToken, srcAmount, srcUsd);
    return res > 1 ? res : 1;
  }, [srcAmount, srcToken, srcUsd]);
};

export const useChunks = () => {
  const { dappProps, state, srcToken, srcUsd } = useTwapContext();
  const { isLimitPanel } = dappProps;
  const { customChunks } = state;
  const maxPossibleChunks = useMaxPossibleChunks();

  return useMemo(() => {
    if (isLimitPanel) return 1;
    if (!srcUsd || !srcToken) return 1;
    if (typeof customChunks === "number") return customChunks;
    return maxPossibleChunks;
  }, [srcUsd, srcToken, customChunks, maxPossibleChunks, isLimitPanel]);
};

// Warnigns //

export const useFillDelayWarning = () => {
  const fillDelayMillis = useFillDelayMillis();
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
  const singleChunksUsd = useSrcChunkAmountUsdUi();
  const chunks = useChunks();
  const srcAmount = useSrcAmount().srcAmountBN;

  const { lib, translations } = useTwapContext();
  return useMemo(() => {
    if (srcAmount.isZero()) return;
    const minTradeSizeUsd = BN(lib?.config.minChunkSizeUsd || 0);
    if (BN(chunks).isZero() || BN(singleChunksUsd || 0).isLessThan(minTradeSizeUsd)) {
      return translations.tradeSizeMustBeEqual.replace("{minChunkSizeUsd}", minTradeSizeUsd.toString());
    }
  }, [chunks, translations, singleChunksUsd, lib, srcAmount.toString()]);
};

const useInvalidTokensWarning = () => {
  const { lib, translations, srcToken, dstToken } = useTwapContext();

  return useMemo(() => {
    if (!srcToken || !dstToken || lib?.validateTokens(srcToken, dstToken) === TokensValidation.invalid) {
      return translations.selectTokens;
    }
  }, [srcToken, dstToken, translations]);
};

const useSrcAmountWarning = () => {
  const srcAmount = useSrcAmount().srcAmountBN;
  const { translations } = useTwapContext();

  return useMemo(() => {
    if (srcAmount.isZero()) {
      return translations.enterAmount;
    }
  }, [srcAmount.toString(), translations]);
};

export const useBalanceWarning = () => {
  const { data: srcBalance } = useSrcBalance();
  const maxSrcInputAmount = useMaxSrcInputAmount();
  const srcAmount = useSrcAmount().srcAmountBN;

  const { translations } = useTwapContext();

  return useMemo(() => {
    const isNativeTokenAndValueBiggerThanMax = maxSrcInputAmount && srcAmount?.gt(maxSrcInputAmount);

    if ((srcBalance && srcAmount.gt(srcBalance)) || isNativeTokenAndValueBiggerThanMax) {
      return translations.insufficientFunds;
    }
  }, [srcBalance?.toString(), srcAmount.toString(), maxSrcInputAmount?.toString(), translations]);
};

export const useLowPriceWarning = () => {
  const { dappProps, translations: t, state, srcToken, dstToken } = useTwapContext();
  const { isLimitPanel } = dappProps;
  const { marketPrice } = useMarketPrice();
  const { limitPrice } = useLimitPrice();
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
          .toString()
      ),
    };
  }, [isLimitPanel, limitPrice, marketPrice, isInvertedLimitPrice, srcToken, dstToken, t, priceDeltaPercentage]);
};

export const useSwapWarning = () => {
  const fillDelay = useFillDelayWarning();
  const feeOnTranfer = useFeeOnTransferWarning();
  const tradeSize = useTradeSizeWarning();
  const shouldWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();
  const invalidTokens = useInvalidTokensWarning();
  const zeroSrcAmount = useSrcAmountWarning();
  const balance = useBalanceWarning();
  const lowPrice = useLowPriceWarning();
  const duration = useTradeDurationWarning();

  if (shouldWrapOrUnwrapOnly) {
    return { balance, zeroSrcAmount };
  }

  return { tradeSize, invalidTokens, zeroSrcAmount, fillDelay, feeOnTranfer, lowPrice, balance, duration };
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
    [updateState]
  );
};

export const useMaxSrcInputAmount = () => {
  const { srcToken } = useTwapContext();
  const srcBalance = useSrcBalance().data?.toString();

  return useMemo(() => {
    if (srcBalance && isNativeAddress(srcToken?.address || "")) {
      const srcTokenMinimum = amountBN(srcToken, MIN_NATIVE_BALANCE.toString());
      return BN.max(0, BN.min(BN(srcBalance).minus(srcTokenMinimum)));
    }
  }, [srcToken, srcBalance]);
};

export const useSetSrcAmountPercent = () => {
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
      const _maxAmount = maxAmount && percent === 1 && maxAmount.gt(0) ? maxAmount : undefined;
      const value = amountUi(srcToken, _maxAmount || BN(srcBalance).times(percent));
      setSrcAmountUi(value);
    },
    [srcToken, maxAmount, srcBalance, setSrcAmountUi]
  );
};

export const useSrcChunkAmountUsdUi = () => {
  const { srcToken, srcUsd } = useTwapContext();
  const srcChunksAmount = useSrcChunkAmount();

  const result = useMemo(() => {
    return srcChunksAmount.times(srcUsd).toString();
  }, [srcChunksAmount, srcUsd]);

  return useAmountUi(srcToken?.decimals, result);
};

export const useIsPartialFillWarning = () => {
  const chunks = useChunks();

  const fillDelayUiMillis = useFillDelayMillis();
  const durationMillis = useDuration().millis;

  return useMemo(() => {
    return chunks * fillDelayUiMillis > durationMillis;
  }, [chunks, fillDelayUiMillis, durationMillis]);
};

export const useSrcChunkAmount = () => {
  const srcAmount = useSrcAmount().srcAmountBN;

  const chunks = useChunks();
  const lib = useTwapContext().lib;
  return useMemo(() => {
    return chunks === 0 ? BN(0) : lib?.srcChunkAmount(srcAmount, chunks) || BN(0);
  }, [lib, srcAmount.toString(), chunks]);
};

export const useMinDuration = () => {
  const fillDelayUiMillis = useFillDelayMillis();
  const chunks = useChunks();

  return useMemo(() => {
    const _millis = fillDelayUiMillis * 2 * chunks;
    const resolution = _.find([TimeResolution.Days, TimeResolution.Hours, TimeResolution.Minutes], (r) => r <= _millis) || TimeResolution.Minutes;
    const duration = { resolution, amount: Number(BN(_millis / resolution).toFixed(2)) };

    return {
      duration,
      millis: (duration.amount || 0) * duration.resolution,
    };
  }, [fillDelayUiMillis, chunks]);
};

export const useDuration = () => {
  const { duration: minDuration } = useMinDuration();

  const { lib, dappProps, state } = useTwapContext();
  const { isLimitPanel } = dappProps;

  const duration = useMemo(() => {
    if (!lib) {
      return { resolution: TimeResolution.Minutes, amount: 0 };
    }
    if (isLimitPanel) {
      return { resolution: TimeResolution.Days, amount: 7 };
    }
    if (state.customDuration) {
      return state.customDuration;
    }
    return minDuration;
  }, [lib, isLimitPanel, state.customDuration, minDuration]);

  const millis = useMemo(() => (duration.amount || 0) * duration.resolution, [duration]);

  return {
    duration,
    millis,
  };
};

export const useSrcChunkAmountUi = () => {
  const srcToken = useTwapContext().srcToken;
  const srcChunksAmount = useSrcChunkAmount();

  return useFormatDecimals(useAmountUi(srcToken?.decimals, srcChunksAmount.toString()), 2);
};

export const useChunksBiggerThanOne = () => {
  const srcAmountUi = useSrcAmount().srcAmountUi;
  const srcToken = useTwapContext().srcToken;

  const maxPossibleChunks = useMaxPossibleChunks();

  return useMemo(() => {
    if (!srcToken || !srcAmountUi) return false;
    return maxPossibleChunks > 1;
  }, [maxPossibleChunks, srcToken, srcAmountUi]);
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

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const useNoLiquidity = () => {
  const srcAmount = useSrcAmount().srcAmountBN.toString();
  const { isLoading: dstAmountLoading, outAmountRaw } = useOutAmount();
  const limitPrice = useLimitPrice().limitPrice;

  return useMemo(() => {
    if (BN(limitPrice || 0).isZero() || BN(srcAmount || 0).isZero() || dstAmountLoading) return false;
    return BN(outAmountRaw || 0).isZero();
  }, [outAmountRaw, dstAmountLoading, srcAmount, limitPrice]);
};

export const useInvertedPrice = (price?: string, inverted?: boolean) => {
  return useMemo(() => {
    if (!price) return "";
    return inverted ? BN(1).div(price).toString() : price;
  }, [price, inverted]);
};

export const useInvertPrice = (price?: string) => {
  const [inverted, setInvert] = useState(false);
  const { srcToken, dstToken } = useTwapContext();

  const invertedPrice = useInvertedPrice(price, inverted);
  const value = useFormatNumber({ value: invertedPrice || "", decimalScale: 5 });

  const onInvert = useCallback(() => {
    setInvert((prev) => !prev);
  }, [setInvert]);

  const leftToken = inverted ? dstToken : srcToken;
  const rightToken = inverted ? srcToken : dstToken;

  return {
    price: value,
    leftToken,
    rightToken,
    inverted,
    onInvert,
  };
};

export const useLimitPricePercentDiffFromMarket = () => {
  const limitPrice = useLimitPrice().limitPrice;
  const marketPrice = useMarketPrice().marketPrice;
  const isInvertedLimitPrice = useTwapContext().state.isInvertedLimitPrice;

  return useMemo(() => {
    if (!limitPrice || !marketPrice || BN(limitPrice).isZero() || BN(limitPrice).isZero()) return "0";
    const from = isInvertedLimitPrice ? marketPrice : limitPrice;
    const to = isInvertedLimitPrice ? limitPrice : marketPrice;
    return BN(from).div(to).minus(1).multipliedBy(100).decimalPlaces(2, BN.ROUND_HALF_UP).toString();
  }, [limitPrice, marketPrice, isInvertedLimitPrice]);
};

export const useShouldWrap = () => {
  const { lib, srcToken, dstToken } = useTwapContext();

  return useMemo(() => {
    if (!lib || !srcToken || !dstToken) return;

    return [TokensValidation.wrapAndOrder, TokensValidation.wrapOnly].includes(lib.validateTokens(srcToken, dstToken!));
  }, [lib, srcToken, dstToken]);
};

export const useShouldOnlyWrap = () => {
  const { lib, srcToken, dstToken } = useTwapContext();

  return useMemo(() => {
    if (!lib || !srcToken || !dstToken) return false;
    return lib?.validateTokens(srcToken!, dstToken!) === TokensValidation.wrapOnly;
  }, [lib, srcToken, dstToken]);
};

export const useShouldUnwrap = () => {
  const { lib, srcToken, dstToken } = useTwapContext();

  return useMemo(() => {
    if (!lib || !srcToken || !dstToken) return;

    return lib.validateTokens(srcToken, dstToken) === TokensValidation.unwrapOnly;
  }, [lib, srcToken, dstToken]);
};

export const useIsInvalidTokens = () => {
  const { lib, srcToken, dstToken } = useTwapContext();

  return useMemo(() => {
    if (!lib || !srcToken || !dstToken) return;

    return lib.validateTokens(srcToken, dstToken) === TokensValidation.invalid;
  }, [lib, srcToken, dstToken]);
};

export const useMinimumDelayMinutes = () => {
  const { lib } = useTwapContext();

  return useMemo(() => (lib?.estimatedDelayBetweenChunksMillis() || 0) / 1000 / 60, [lib]);
};

export const useFillDelayMillis = () => {
  const { state, dappProps } = useTwapContext();
  const { isLimitPanel } = dappProps;

  const { customFillDelay } = state;

  return useMemo(() => {
    if (isLimitPanel) {
      return TimeResolution.Minutes * MIN_TRADE_INTERVAL_FORMATTED;
    }
    return customFillDelay.amount! * customFillDelay.resolution;
  }, [customFillDelay, isLimitPanel]);
};

export const useFillDelayText = () => {
  const fillDelayMillis = useFillDelayMillis();
  const { translations } = useTwapContext();
  return useMemo(() => fillDelayText(fillDelayMillis, translations), [fillDelayMillis, translations]);
};

export const useIsMarketOrder = () => {
  const { dappProps, state } = useTwapContext();
  const isMarketOrder = state.isMarketOrder;

  return dappProps.isLimitPanel ? false : isMarketOrder;
};

export const useExplorerUrl = () => {
  const lib = useTwapContext().lib;

  return useMemo(() => getExplorerUrl(lib?.config.chainId), [lib?.config.chainId]);
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

export const useShouldWrapOrUnwrapOnly = () => {
  const wrap = useShouldOnlyWrap();
  const unwrap = useShouldUnwrap();

  return wrap || unwrap;
};

export const useIsSwapWithStableCoin = () => {
  const { srcToken, dstToken } = useTwapContext();

  return useMemo(() => {
    return isStableCoin(srcToken) || isStableCoin(dstToken);
  }, [srcToken, dstToken]);
};

export const useTokenBalance = (isSrc?: boolean) => {
  const { srcToken, dstToken } = useTwapContext();

  const srcBalance = useAmountUi(srcToken?.decimals, useSrcBalance().data?.toString());
  const dstBalance = useAmountUi(dstToken?.decimals, useDstBalance().data?.toString());
  return isSrc ? srcBalance : dstBalance;
};

export const useTokenUsd = (isSrc?: boolean) => {
  const srcUSD = useSrcAmountUsdUi();
  const dstUSD = useDstAmountUsdUi();

  return isSrc ? srcUSD : dstUSD;
};

export const useOpenOrders = () => {
  const { data } = query.useOrdersHistory();

  return useMemo(() => {
    return !data ? undefined : data[Status.Open as keyof typeof data];
  }, [data]);
};

export const useSrcAmount = () => {
  const { state, srcToken } = useTwapContext();
  return useMemo(() => {
    return {
      srcAmountUi: state.srcAmountUi,
      srcAmountBN: BN.min(amountBN(srcToken, state.srcAmountUi), maxUint256).decimalPlaces(0),
    };
  }, [srcToken, state.srcAmountUi]);
};

export const useTokenFromParsedTokensList = (address?: string) => {
  const getTokenFromList = useGetTokenFromParsedTokensList();
  return useMemo(() => getTokenFromList(address), [address]);
};

export const useGetTokenFromParsedTokensList = () => {
  const { parsedTokens } = useTwapContext().dappProps;
  return useCallback(
    (address?: string) => {
      return parsedTokens.find((token) => eqIgnoreCase(address || "", token.address || ""));
    },
    [parsedTokens]
  );
};
