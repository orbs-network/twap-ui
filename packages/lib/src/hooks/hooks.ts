import { Status, TokenData, TokensValidation } from "@orbs-network/twap";
import { useTwapContext } from "../context/context";
import Web3 from "web3";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import BN from "bignumber.js";
import { ParsedOrder, State, SwapStep, TimeResolution } from "../types";
import _ from "lodash";
import { eqIgnoreCase, setWeb3Instance, switchMetaMaskNetwork, isNativeAddress, parsebn, maxUint256 } from "@defi.org/web3-candies";
import { MAX_TRADE_INTERVAL, MAX_TRADE_INTERVAL_FORMATTED, MIN_NATIVE_BALANCE, MIN_TRADE_INTERVAL, MIN_TRADE_INTERVAL_FORMATTED, QUERY_PARAMS, STABLE_TOKENS } from "../consts";
import { useNumericFormat } from "react-number-format";
import moment from "moment";
import {
  amountBN,
  amountBNV2,
  amountUi,
  amountUiV2,
  fillDelayText,
  formatDecimals,
  getExplorerUrl,
  getTokenFromTokensListV2,
  isStableCoin,
  resetQueryParams,
  supportsTheGraphHistory,
} from "../utils";
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

export const useLoadingState = () => {
  const srcUSD = useSrcUsd();
  const dstUSD = useDstUsd();
  const srcBalance = useSrcBalance();
  const dstBalance = useDstBalance();

  return {
    srcUsdLoading: srcUSD.isLoading,
    dstUsdLoading: dstUSD.isLoading,
    srcBalanceLoading: srcBalance.isLoading,
    dstBalanceLoading: dstBalance.isLoading,
  };
};

export const useSrcUsd = () => {
  const srcToken = useTwapContext().state.srcToken;
  return query.usePriceUSD(srcToken?.address);
};

export const useDstUsd = () => {
  const dstToken = useTwapContext().state.dstToken;
  const shouldWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();
  const dstUsd = query.usePriceUSD(dstToken?.address);
  const srcUsd = useSrcUsd();
  return shouldWrapOrUnwrapOnly ? srcUsd : dstUsd;
};

export const useSrcBalance = () => {
  const srcToken = useTwapContext().state.srcToken;
  return query.useBalance(srcToken);
};

export const useDstBalance = () => {
  const dstToken = useTwapContext().state.dstToken;
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
  const { dappProps, updateState, state } = useTwapContext();
  const { onSrcTokenSelected, onDstTokenSelected, parsedTokens } = dappProps;
  const { dstToken, srcToken } = state;
  const switchTokens = useSwitchTokens();
  const resetLimitPrice = stateActions.useResetLimitPrice();

  return useCallback(
    ({ isSrc, token }: { isSrc: boolean; token: any }) => {
      const parsedToken = _.find(parsedTokens, (t) => eqIgnoreCase(t.address, token.address) || t.symbol.toLowerCase() === token.symbol.toLowerCase());

      if (!parsedToken) return;

      if (eqIgnoreCase(isSrc ? dstToken?.address || "" : srcToken?.address || "", token.address)) {
        switchTokens();
        return;
      }
      resetLimitPrice();

      if (isSrc) {
        updateState({ srcToken: parsedToken });
        onSrcTokenSelected?.(token);
      } else {
        updateState({ dstToken: parsedToken });
        onDstTokenSelected?.(token);
      }
    },
    [dstToken, onDstTokenSelected, onSrcTokenSelected, parsedTokens, resetLimitPrice, srcToken, switchTokens, updateState]
  );
};

export const useToken = (isSrc?: boolean) => {
  const { srcToken, dstToken } = useTwapContext().state;

  return isSrc ? srcToken : dstToken;
};

export const useSwitchTokens = () => {
  const { dappProps, state } = useTwapContext();
  const { dappTokens, onSrcTokenSelected, onDstTokenSelected } = dappProps;
  const { srcToken, dstToken } = state;
  const onTokensSwitch = stateActions.useOnTokensSwitch();
  const dstAmount = useOutAmount().outAmountUi;

  return useCallback(() => {
    onTokensSwitch();
    resetQueryParams();
    const srcTokenFromList = getTokenFromTokensListV2(dappTokens, [srcToken?.address, srcToken?.symbol]);
    const dstTokenFromList = getTokenFromTokensListV2(dappTokens, [dstToken?.address, dstToken?.symbol]);
    srcTokenFromList && onSrcTokenSelected?.(srcTokenFromList);
    dstTokenFromList && onDstTokenSelected?.(dstTokenFromList);
  }, [onTokensSwitch, srcToken, dstToken, onSrcTokenSelected, onDstTokenSelected, dappTokens, dstAmount]);
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

export const useDappRawSelectedTokens = () => {
  const { dappProps, state } = useTwapContext();
  const { dappTokens } = dappProps;
  const { srcToken, dstToken } = state;

  return useMemo(() => {
    return {
      srcToken: getTokenFromTokensListV2(dappTokens, [srcToken?.address, srcToken?.symbol]),
      dstToken: getTokenFromTokensListV2(dappTokens, [dstToken?.address, dstToken?.symbol]),
    };
  }, [srcToken?.address, srcToken?.symbol, dappTokens, dstToken?.address, dstToken?.symbol]);
};

export const useParseOrderUi = (o?: ParsedOrder, expanded?: boolean) => {
  const lib = useTwapContext()?.lib;

  const { data: dstAmountOutFromEvents } = query.useOrderPastEvents(o, expanded);

  return useMemo(() => {
    if (!lib || !o) return;
    const srcToken = o.ui.srcToken;
    const dstToken = o.ui.dstToken;
    if (!srcToken || !dstToken) return;
    const isTheGrapth = supportsTheGraphHistory(lib.config.chainId);
    const isMarketOrder = lib.isMarketOrder(o.order);
    const dstAmount = isTheGrapth ? o.ui.dstAmount : dstAmountOutFromEvents?.toString();
    const srcFilledAmount = isTheGrapth ? o.ui.srcFilledAmount : o.order.srcFilledAmount;

    return {
      order: o.order,
      ui: {
        ...o.ui,
        isMarketOrder,
        srcAmountUi: amountUi(srcToken, o.order.ask.srcAmount),
        srcAmountUsdUi: o.ui.dollarValueIn || amountUi(srcToken, o.order.ask.srcAmount.times(0)),
        srcChunkAmountUi: amountUi(srcToken, o.order.ask.srcBidAmount),
        srcChunkAmountUsdUi: amountUi(srcToken, o.order.ask.srcBidAmount.times(0)),
        srcFilledAmountUi: amountUi(srcToken, BN(srcFilledAmount || "0")),
        dstMinAmountOutUi: amountUi(dstToken, o.order.ask.dstMinAmount),
        dstMinAmountOutUsdUi: amountUi(dstToken, o.order.ask.dstMinAmount.times(0)),
        fillDelay: o.order.ask.fillDelay * 1000 + lib.estimatedDelayBetweenChunksMillis(),
        createdAtUi: moment(o.order.time * 1000).format("ll HH:mm"),
        deadlineUi: moment(o.order.ask.deadline * 1000).format("ll HH:mm"),
        deadline: o.order.ask.deadline * 1000,
        prefix: isMarketOrder ? "~" : "~",
        dstAmount: !dstAmount ? undefined : amountUi(dstToken, BN(dstAmount || "0")),
        dstAmountUsd: o.ui.dollarValueOut ? o.ui.dollarValueOut : !dstAmount ? undefined : amountUi(dstToken, BN(dstAmount || "0").times(0)),
        progress: o?.ui.progress,
      },
    };
  }, [lib, o, dstAmountOutFromEvents?.toString()]);
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
  const { dstToken } = useTwapContext().state;

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
  const { isWrongChain, dappProps, state } = useTwapContext();
  const { account } = dappProps;
  const { dstToken } = state;
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
  const { state } = useTwapContext();
  const { dstToken, isCustomLimitPrice, customLimitPrice, isInvertedLimitPrice, isMarketOrder } = state;

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
  const { lib, state } = useTwapContext();
  const srcChunkAmount = useSrcChunkAmount();
  const { srcToken, dstToken } = state;
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
  const { dstToken } = useTwapContext().state;
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
  const srcToken = useTwapContext().state.srcToken;

  const srcUsd = useSrcUsd().value.toString();

  return useAmountUi(srcToken?.decimals, srcAmount.times(srcUsd).toString());
};

export const useDstAmountUsdUi = () => {
  const dstAmount = useOutAmount().outAmountRaw;
  const dstToken = useTwapContext().state.dstToken;

  const dstUsd = useDstUsd().value.toString();

  const value = useMemo(() => {
    return BN(dstAmount || "0")
      .times(dstUsd)
      .toString();
  }, [dstAmount, dstUsd]);

  return useAmountUi(dstToken?.decimals, value);
};

export const useMaxPossibleChunks = () => {
  const srcAmount = useSrcAmount().srcAmountBN.toString();
  const { state, lib } = useTwapContext();
  const { srcToken } = state;
  const srcUsd = useSrcUsd().value.toString();

  return useMemo(() => {
    if (!lib || !srcToken || !srcAmount || !srcUsd) return 1;
    const res = lib.maxPossibleChunks(srcToken, srcAmount, srcUsd);
    return res > 1 ? res : 1;
  }, [srcAmount, srcToken, srcUsd]);
};

export const useChunks = () => {
  const srcUsd = useSrcUsd().value.toString();
  const { dappProps, state } = useTwapContext();
  const { isLimitPanel } = dappProps;
  const { srcToken, customChunks } = state;
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

export const useFeeOnTransferWarning = () => {
  const { translations, state } = useTwapContext();

  const { srcToken, dstToken } = state;
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
  const { lib, translations, state } = useTwapContext();

  const { srcToken, dstToken } = state;
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
  const { dappProps, translations: t, state } = useTwapContext();
  const { isLimitPanel } = dappProps;
  const { marketPrice } = useMarketPrice();
  const { limitPrice } = useLimitPrice();
  const priceDeltaPercentage = useLimitPricePercentDiffFromMarket();

  const { isInvertedLimitPrice, srcToken, dstToken } = state;

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

  if (shouldWrapOrUnwrapOnly) {
    return { balance, zeroSrcAmount };
  }

  return { tradeSize, invalidTokens, zeroSrcAmount, fillDelay, feeOnTranfer, lowPrice, balance };
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
  const { state } = useTwapContext();
  const { srcToken } = state;
  const srcBalance = useSrcBalance().data?.toString();

  return useMemo(() => {
    if (srcBalance && isNativeAddress(srcToken?.address || "")) {
      const srcTokenMinimum = amountBN(srcToken, MIN_NATIVE_BALANCE.toString());
      return BN.max(0, BN.min(BN(srcBalance).minus(srcTokenMinimum)));
    }
  }, [srcToken, srcBalance]);
};

export const useSetSrcAmountPercent = () => {
  const { state } = useTwapContext();
  const { srcToken } = state;

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
  const { state } = useTwapContext();
  const { srcToken } = state;
  const srcChunksAmount = useSrcChunkAmount();
  const srcUsd = useSrcUsd().value.toString();

  const result = useMemo(() => {
    return srcChunksAmount.times(srcUsd).toString();
  }, [srcChunksAmount, srcUsd]);

  return useAmountUi(srcToken?.decimals, result);
};

export const useIsPartialFillWarning = () => {
  const chunks = useChunks();

  const fillDelayUiMillis = useFillDelayMillis();
  const durationMillis = useDurationMillis();

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

export const useDurationUi = () => {
  const fillDelayUiMillis = useFillDelayMillis();
  const chunks = useChunks();

  const { lib, dappProps } = useTwapContext();
  const { isLimitPanel } = dappProps;

  return useMemo(() => {
    if (!lib) {
      return { resolution: TimeResolution.Minutes, amount: 0 };
    }
    if (isLimitPanel) {
      return { resolution: TimeResolution.Days, amount: 7 };
    }

    const _millis = fillDelayUiMillis * 2 * chunks;
    const resolution = _.find([TimeResolution.Days, TimeResolution.Hours, TimeResolution.Minutes], (r) => r <= _millis) || TimeResolution.Minutes;
    return { resolution, amount: Number(BN(_millis / resolution).toFixed(2)) };
  }, [lib, chunks, fillDelayUiMillis, isLimitPanel]);
};

export const useDurationMillis = () => {
  const durationUi = useDurationUi();

  return useMemo(() => {
    return (durationUi.amount || 0) * durationUi.resolution;
  }, [durationUi]);
};

export const useSrcChunkAmountUi = () => {
  const srcToken = useTwapContext().state.srcToken;
  const srcChunksAmount = useSrcChunkAmount();

  return useFormatDecimals(useAmountUi(srcToken?.decimals, srcChunksAmount.toString()), 2);
};

export const useChunksBiggerThanOne = () => {
  const srcAmountUi = useSrcAmount().srcAmountUi;
  const srcToken = useTwapContext().state.srcToken;

  const maxPossibleChunks = useMaxPossibleChunks();

  return useMemo(() => {
    if (!srcToken || !srcAmountUi) return false;
    return maxPossibleChunks > 1;
  }, [maxPossibleChunks, srcToken, srcAmountUi]);
};

export const useDeadline = () => {
  const confirmationClickTimestamp = useTwapContext().state.confirmationClickTimestamp;

  const durationUi = useDurationUi();

  return useMemo(() => {
    return moment(confirmationClickTimestamp)
      .add((durationUi.amount || 0) * durationUi.resolution)
      .add(1, "minute")
      .valueOf();
  }, [durationUi, confirmationClickTimestamp]);
};

export const useDeadlineUi = () => {
  const deadline = useDeadline();

  return useMemo(() => moment(deadline).format("ll HH:mm"), [deadline]);
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
  const { srcToken, dstToken } = useTwapContext().state;

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
  const { lib, state } = useTwapContext();
  const { srcToken, dstToken } = state;

  return useMemo(() => {
    if (!lib || !srcToken || !dstToken) return;

    return [TokensValidation.wrapAndOrder, TokensValidation.wrapOnly].includes(lib.validateTokens(srcToken, dstToken!));
  }, [lib, srcToken, dstToken]);
};

export const useShouldOnlyWrap = () => {
  const { lib, state } = useTwapContext();

  const { srcToken, dstToken } = state;
  return useMemo(() => {
    if (!lib || !srcToken || !dstToken) return false;
    return lib?.validateTokens(srcToken!, dstToken!) === TokensValidation.wrapOnly;
  }, [lib, srcToken, dstToken]);
};

export const useShouldUnwrap = () => {
  const { lib, state } = useTwapContext();
  const { srcToken, dstToken } = state;

  return useMemo(() => {
    if (!lib || !srcToken || !dstToken) return;

    return lib.validateTokens(srcToken, dstToken) === TokensValidation.unwrapOnly;
  }, [lib, srcToken, dstToken]);
};

export const useIsInvalidTokens = () => {
  const { lib, state } = useTwapContext();
  const { srcToken, dstToken } = state;
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
  const { srcToken, dstToken } = useTwapContext().state;

  return useMemo(() => {
    return isStableCoin(srcToken) || isStableCoin(dstToken);
  }, [srcToken, dstToken]);
};

export const useTokenBalance = (isSrc?: boolean) => {
  const { srcToken, dstToken } = useTwapContext().state;

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
  const state = useTwapContext().state;
  return useMemo(() => {
    return {
      srcAmountUi: state.srcAmountUi,
      srcAmountBN: BN.min(amountBN(state.srcToken, state.srcAmountUi), maxUint256).decimalPlaces(0),
    };
  }, [state.srcToken, state.srcAmountUi]);
};
