import { Status, TokenData, TokensValidation } from "@orbs-network/twap";
import { useTwapContext } from "../context";
import Web3 from "web3";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import BN from "bignumber.js";
import { OrderUI, ParsedOrder, State, SwapStep } from "../types";
import _ from "lodash";
import { analytics } from "../analytics";
import { eqIgnoreCase, setWeb3Instance, switchMetaMaskNetwork, zero, isNativeAddress, parsebn } from "@defi.org/web3-candies";
import { TimeResolution, useTwapStore } from "../store";
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
  getTokenFromTokensList,
  isStableCoin,
  setQueryParam,
  supportsTheGraphHistory,
} from "../utils";
import { query } from "./query";

const resetQueryParams = () => {
  setQueryParam(QUERY_PARAMS.INPUT_AMOUNT, undefined);
  setQueryParam(QUERY_PARAMS.LIMIT_PRICE, undefined);
  setQueryParam(QUERY_PARAMS.MAX_DURATION, undefined);
  setQueryParam(QUERY_PARAMS.TRADE_INTERVAL, undefined);
  setQueryParam(QUERY_PARAMS.TRADES_AMOUNT, undefined);
};
export const useResetStore = () => {
  const resetTwapStore = useTwapStore((state) => state.reset);
  const storeOverride = useTwapContext().storeOverride || {};

  return (args: Partial<State> = {}) => {
    resetTwapStore({ ...storeOverride, ...args });
    resetQueryParams();
  };
};

export const useRefetchBalances = () => {
  const { refetch: refetchSrcBalance } = useSrcBalance();
  const { refetch: refetchDstBalance } = useDstBalance();

  return useCallback(async () => {
    await Promise.all([refetchSrcBalance(), refetchDstBalance()]);
  }, [refetchSrcBalance, refetchDstBalance]);
};

export const useResetAfterSwap = () => {
  const resetAfterSwap = useTwapStore((state) => state.resetAfterSwap);
  const refetchBalances = useRefetchBalances();

  return useCallback(async () => {
    resetAfterSwap();
    resetQueryParams();
    await refetchBalances();
  }, [resetAfterSwap, refetchBalances]);
};

export const useUpdateStoreOveride = () => {
  const setStoreOverrideValues = useTwapStore((state) => state.setStoreOverrideValues);
  const enableQueryParams = useTwapContext().enableQueryParams;
  return useCallback(
    (values?: Partial<State>) => {
      setStoreOverrideValues(values || {}, enableQueryParams);
    },
    [setStoreOverrideValues, enableQueryParams]
  );
};

export const useChangeNetwork = () => {
  const { config, provider: _provider } = useTwapContext();
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

export const useCancelOrder = () => {
  const { refetch } = query.useOrdersHistory();
  const { priorityFeePerGas, maxFeePerGas } = query.useGasPrice();
  const lib = useTwapContext().lib;
  return useMutation(
    async (orderId: number) => {
      analytics.onCancelOrderClick(orderId);
      return lib?.cancelOrder(orderId, priorityFeePerGas, maxFeePerGas);
    },
    {
      onSuccess: (_result, orderId) => {
        analytics.onCancelOrderSuccess(orderId.toString());
        refetch();
      },
      onError: (error: Error) => {
        analytics.onCancelOrderError(error.message);
      },
    }
  );
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
  const { srcToken } = useTwapStore((store) => ({
    srcToken: store.srcToken,
  }));

  return query.usePriceUSD(srcToken?.address);
};

export const useDstUsd = () => {
  const { dstToken } = useTwapStore((store) => ({
    dstToken: store.dstToken,
  }));
  const shouldWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();
  const dstUsd = query.usePriceUSD(dstToken?.address);
  const srcUsd = useSrcUsd();
  return shouldWrapOrUnwrapOnly ? srcUsd : dstUsd;
};

export const useSrcBalance = () => {
  const srcToken = useTwapStore((store) => store.srcToken);
  return query.useBalance(srcToken);
};

export const useDstBalance = () => {
  const dstToken = useTwapStore((store) => store.dstToken);
  return query.useBalance(dstToken);
};

export const useSetTokensFromDapp = () => {
  const { srcToken, dstToken, isWrongChain, parsedTokens } = useTwapContext();

  const { updateState } = useTwapStore((state) => ({
    updateState: state.updateState,
  }));

  return useCallback(() => {
    if (isWrongChain || isWrongChain == null) return;

    if (srcToken) {
      updateState({ srcToken: getTokenFromTokensList(parsedTokens, srcToken) });
    }
    if (dstToken) {
      updateState({ dstToken: getTokenFromTokensList(parsedTokens, dstToken) });
    }
  }, [srcToken, dstToken, isWrongChain, parsedTokens, updateState]);
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
  const value = useTwapStore((store) => store.getSrcAmount());

  return value.gt(0);
};

export const useTokenSelect = (parsedTokens?: TokenData[]) => {
  const { onSrcTokenSelected, onDstTokenSelected, parsedTokens: _parsedTokens } = useTwapContext();

  const switchTokens = useSwitchTokens();
  const { updateState, dstToken, srcToken, resetLimitPrice } = useTwapStore((store) => ({
    updateState: store.updateState,
    srcToken: store.srcToken,
    dstToken: store.dstToken,
    resetLimitPrice: store.resetLimitPrice,
  }));

  const tokens = parsedTokens || _parsedTokens;

  return useCallback(
    ({ isSrc, token }: { isSrc: boolean; token: any }) => {
      const parsedToken = _.find(tokens, (t) => eqIgnoreCase(t.address, token.address) || t.symbol.toLowerCase() === token.symbol.toLowerCase());

      if (!parsedToken) return;

      const onSrc = () => {
        analytics.onSrcTokenClick(parsedToken?.symbol);
        updateState({ srcToken: parsedToken });
        onSrcTokenSelected?.(token);
      };

      const onDst = () => {
        analytics.onDstTokenClick(parsedToken?.symbol);
        updateState({ dstToken: parsedToken });
        onDstTokenSelected?.(token);
      };
      if ((srcToken && isSrc && eqIgnoreCase(srcToken?.address, token.address)) || (dstToken && !isSrc && eqIgnoreCase(dstToken?.address, token.address))) {
        return;
      }
      if ((srcToken && !isSrc && eqIgnoreCase(srcToken?.address, token.address)) || (dstToken && isSrc && eqIgnoreCase(dstToken?.address, token.address))) {
        switchTokens();
        return;
      }
      resetLimitPrice();

      if (isSrc) {
        onSrc();
      } else {
        onDst();
      }
    },
    [onSrcTokenSelected, onDstTokenSelected, tokens, updateState, srcToken, dstToken, switchTokens, resetLimitPrice]
  );
};

export const useToken = (isSrc?: boolean) => {
  const srcTokenLogo = useTwapStore((store) => store.srcToken);
  const dstTokenLogo = useTwapStore((store) => store.dstToken);

  return isSrc ? srcTokenLogo : dstTokenLogo;
};

export const useSwitchTokens = () => {
  const { dappTokens, onSrcTokenSelected, onDstTokenSelected } = useTwapContext();

  const { srcToken, dstToken, updateState, onTokensSwitch } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
    srcAmountUi: s.srcAmountUi,
    updateState: s.updateState,
    onTokensSwitch: s.onTokensSwitch,
  }));
  resetQueryParams();
  const dstAmount = useOutAmount().outAmountUi;
  return useCallback(() => {
    updateState({
      srcToken: dstToken,
      dstToken: srcToken,
    });
    onTokensSwitch();
    const _srcToken = getTokenFromTokensList(dappTokens, srcToken?.address) || getTokenFromTokensList(dappTokens, srcToken?.symbol);
    const _dstToken = getTokenFromTokensList(dappTokens, dstToken?.address) || getTokenFromTokensList(dappTokens, dstToken?.symbol);
    srcToken && onSrcTokenSelected?.(_dstToken);
    dstToken && onDstTokenSelected?.(_srcToken);
  }, [dstAmount, _.size(dappTokens), srcToken?.address, srcToken?.symbol, dstToken?.address, dstToken?.symbol, onSrcTokenSelected, onDstTokenSelected, onTokensSwitch]);
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
  const { dappTokens } = useTwapContext();
  const tokensLength = _.size(dappTokens);

  const srcToken = useTwapStore((s) => s.srcToken);
  const dstToken = useTwapStore((s) => s.dstToken);

  const _srcToken = useMemo(() => {
    return getTokenFromTokensList(dappTokens, srcToken?.address || srcToken?.symbol);
  }, [srcToken?.address, srcToken?.symbol, tokensLength]);

  const _dstToken = useMemo(() => {
    return getTokenFromTokensList(dappTokens, dstToken?.address || dstToken?.symbol);
  }, [dstToken?.address, dstToken?.symbol, tokensLength]);

  return {
    srcToken: _srcToken,
    dstToken: _dstToken,
  };
};

export const useConfirmationModal = () => {
  const { swapState, updateState, showConfirmation, srcAmount, srcToken, dstToken, confirmationDetails, onModalClose, setConfirmationDetails, wrapSuccess, setShowConfirmation } =
    useTwapStore((s) => ({
      swapState: s.swapState,
      updateState: s.updateState,
      showConfirmation: s.showConfirmation,
      srcAmount: s.srcAmountUi,
      srcToken: s.srcToken,
      dstToken: s.dstToken,
      confirmationDetails: s.confirmationDetails,
      onModalClose: s.onModalClose,
      setConfirmationDetails: s.setConfirmationDetails,
      wrapSuccess: s.wrapSuccess,
      setShowConfirmation: s.setShowConfirmation,
    }));

  const outAmount = useOutAmount().outAmountUi;
  const srcUsd = useSrcAmountUsdUi();
  const dstUsd = useDstAmountUsdUi();
  const nativeToWrapped = useSwitchNativeToWrapped();

  const onClose = useCallback(
    (closeDalay?: number) => {
      updateState({ showConfirmation: false });
      if (swapState === "loading") return;
      setTimeout(() => {
        if (swapState === "rejected" && wrapSuccess) {
          nativeToWrapped();
        }
        onModalClose();
      }, closeDalay || 0);
    },
    [onModalClose, swapState, updateState, nativeToWrapped, wrapSuccess]
  );

  useEffect(() => {
    if (!swapState) {
      setConfirmationDetails({
        srcAmount,
        srcToken,
        dstToken,
        outAmount,
        srcUsd,
        dstUsd,
      });
    }
  }, [srcAmount, srcToken, dstToken, outAmount, srcUsd, dstUsd, setConfirmationDetails, swapState, updateState]);

  const onOpen = useCallback(() => {
    setShowConfirmation(true);
  }, [setShowConfirmation]);

  const title = useMemo(() => {
    if (!swapState) {
      return "Review order";
    }
  }, [swapState]);

  const details = confirmationDetails || {};

  return {
    onClose,
    onOpen,
    isOpen: showConfirmation,
    title,
    swapState,
    ...details,
  };
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

export const useSwitchNativeToWrapped = () => {
  const { updateState } = useTwapStore((s) => ({
    updateState: s.updateState,
  }));
  const { lib, dappTokens, onSrcTokenSelected } = useTwapContext();
  return useCallback(() => {
    updateState({ srcToken: lib!.config.wToken });
    const token = getTokenFromTokensList(dappTokens, lib!.config.wToken.address);
    if (token) {
      onSrcTokenSelected?.(token);
    }
  }, [lib, dappTokens, onSrcTokenSelected, updateState]);
};

export const useOutAmount = () => {
  const { limitPrice, isLoading } = useLimitPrice();
  const { srcAmountUi, dstToken, srcAmountBn } = useTwapStore((s) => ({
    srcAmountUi: s.srcAmountUi,
    dstToken: s.dstToken,
    srcAmountBn: s.getSrcAmount().toString(),
  }));

  const wrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();

  const wrongNetwork = useTwapContext().isWrongChain;

  const outAmount = useMemo(() => {
    if (!srcAmountUi) return;
    if (wrapOrUnwrapOnly) {
      return srcAmountBn;
    }
    return !limitPrice ? undefined : BN(limitPrice).multipliedBy(srcAmountUi).toString();
  }, [limitPrice, srcAmountUi, wrapOrUnwrapOnly, srcAmountBn]);

  return {
    isLoading: wrongNetwork ? false : wrapOrUnwrapOnly ? false : isLoading,
    outAmountUi: useAmountUi(dstToken?.decimals, outAmount) || "",
    outAmountRaw: outAmount || "",
  };
};

export const useMarketPrice = () => {
  const marketPriceRaw = useTwapContext().marketPrice;
  const dstToken = useTwapStore((s) => s.dstToken);

  return {
    marketPrice: marketPriceRaw,
    marketPriceUi: useAmountUi(dstToken?.decimals, marketPriceRaw),
    isLoading: BN(marketPriceRaw || 0).isZero(),
  };
};

export const useFormatDecimals = (value?: string | BN | number, decimalPlaces?: number) => {
  return useMemo(() => formatDecimals(value, decimalPlaces), [value, decimalPlaces]);
};

export const useLimitPrice = () => {
  const { isLoading, marketPrice } = useMarketPrice();
  const { isWrongChain } = useTwapContext();
  const { dstToken, isCustom, customLimitPrice, inverted, isMarketOrder } = useTwapStore((s) => ({
    dstToken: s.dstToken,
    isCustom: s.isCustomLimitPrice,
    customLimitPrice: s.customLimitPrice,
    inverted: s.isInvertedLimitPrice,
    isMarketOrder: s.isMarketOrder,
  }));

  const limitPrice = useMemo(() => {
    if (!marketPrice) return;

    if (!isCustom || isMarketOrder) {
      return marketPrice;
    }
    let result = customLimitPrice;
    if (inverted) {
      result = BN(1)
        .div(customLimitPrice || 0)
        .toString();
    }
    return amountBNV2(dstToken?.decimals, result);
  }, [isCustom, customLimitPrice, dstToken?.decimals, inverted, marketPrice, isMarketOrder]);

  return {
    isLoading: isWrongChain ? false : isLoading,
    limitPrice,
    limitPriceUi: useAmountUi(dstToken?.decimals, limitPrice),
  };
};

export const useDstMinAmountOut = () => {
  const { limitPriceUi } = useLimitPrice();
  const srcChunkAmount = useSrcChunkAmount();
  const { srcToken, dstToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));
  const isMarketOrder = useIsMarketOrder();
  const lib = useTwapContext().lib;
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
  const dstToken = useTwapStore((s) => s.dstToken);
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
  const { srcToken, srcAmount } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    srcAmount: s.getSrcAmount(),
  }));

  const srcUsd = useSrcUsd().value.toString();

  return useAmountUi(srcToken?.decimals, srcAmount.times(srcUsd).toString());
};

export const useDstAmountUsdUi = () => {
  const dstAmount = useOutAmount().outAmountRaw;
  const dstToken = useTwapStore((s) => s.dstToken);

  const dstUsd = useDstUsd().value.toString();

  const value = useMemo(() => {
    return BN(dstAmount || "0")
      .times(dstUsd)
      .toString();
  }, [dstAmount, dstUsd]);

  return useAmountUi(dstToken?.decimals, value);
};

export const useMaxPossibleChunks = () => {
  const { srcAmount, srcToken } = useTwapStore((s) => ({
    srcAmount: s.getSrcAmount().toString(),
    srcToken: s.srcToken,
  }));

  const lib = useTwapContext().lib;

  const srcUsd = useSrcUsd().value.toString();

  return useMemo(() => {
    if (!lib || !srcToken || !srcAmount || !srcUsd) return 1;
    const res = lib.maxPossibleChunks(srcToken, srcAmount, srcUsd);
    return res > 1 ? res : 1;
  }, [srcAmount, srcToken, srcUsd]);
};

export const useChunks = () => {
  const srcUsd = useSrcUsd().value.toString();
  const { srcToken, customChunks } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    customChunks: s.customChunks,
  }));
  const { isLimitPanel } = useTwapContext();
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
  const { srcToken, dstToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));
  const { data: srcTokenFeeOnTransfer } = query.useFeeOnTransfer(srcToken?.address);
  const { data: dstTokenFeeOnTransfer } = query.useFeeOnTransfer(dstToken?.address);
  const { translations } = useTwapContext();

  return useMemo(() => {
    if (srcTokenFeeOnTransfer?.hasFeeOnTranfer || dstTokenFeeOnTransfer?.hasFeeOnTranfer) {
      return translations.feeOnTranferWarning;
    }
  }, [srcTokenFeeOnTransfer, dstTokenFeeOnTransfer, translations]);
};

export const useTradeSizeWarning = () => {
  const singleChunksUsd = useSrcChunkAmountUsdUi();
  const chunks = useChunks();
  const srcAmount = useTwapStore((s) => s.getSrcAmount());

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
  const { srcToken, dstToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));
  const { lib, translations } = useTwapContext();

  return useMemo(() => {
    if (!srcToken || !dstToken || lib?.validateTokens(srcToken, dstToken) === TokensValidation.invalid) {
      return translations.selectTokens;
    }
  }, [srcToken, dstToken, translations]);
};

const useSrcAmountWarning = () => {
  const { srcAmount } = useTwapStore((s) => ({
    srcAmount: s.getSrcAmount(),
  }));
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
  const { srcAmount } = useTwapStore((s) => ({
    srcAmount: s.getSrcAmount(),
  }));
  const { translations } = useTwapContext();

  return useMemo(() => {
    const isNativeTokenAndValueBiggerThanMax = maxSrcInputAmount && srcAmount?.gt(maxSrcInputAmount);

    if ((srcBalance && srcAmount.gt(srcBalance)) || isNativeTokenAndValueBiggerThanMax) {
      return translations.insufficientFunds;
    }
  }, [srcBalance?.toString(), srcAmount.toString(), maxSrcInputAmount?.toString(), translations]);
};

export const useLowPriceWarning = () => {
  const { isLimitPanel, translations: t } = useTwapContext();
  const { marketPrice } = useMarketPrice();
  const { limitPrice } = useLimitPrice();
  const priceDeltaPercentage = useLimitPricePercentDiffFromMarket();

  const { isInvertedLimitPrice, srcToken, dstToken } = useTwapStore((s) => ({
    isInvertedLimitPrice: s.isInvertedLimitPrice,
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));

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
  const updateState = useTwapStore((s) => s.updateState);
  const maxPossibleChunks = useMaxPossibleChunks();
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
  const { srcToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
  }));
  const srcBalance = useSrcBalance().data?.toString();

  return useMemo(() => {
    if (srcBalance && isNativeAddress(srcToken?.address || "")) {
      const srcTokenMinimum = amountBN(srcToken, MIN_NATIVE_BALANCE.toString());
      return BN.max(0, BN.min(BN(srcBalance).minus(srcTokenMinimum)));
    }
  }, [srcToken, srcBalance]);
};

export const useSetSrcAmountPercent = () => {
  const { srcToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
  }));

  const setSrcAmountUi = useSetSrcAmountUi();
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
      setQueryParam(QUERY_PARAMS.INPUT_AMOUNT, value);
      setSrcAmountUi(value);
    },
    [srcToken, maxAmount, srcBalance, setSrcAmountUi]
  );
};

export const useSrcChunkAmountUsdUi = () => {
  const { srcToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
  }));
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
  const { srcAmount } = useTwapStore((s) => ({
    srcAmount: s.getSrcAmount(),
  }));
  const chunks = useChunks();
  const lib = useTwapContext().lib;
  return useMemo(() => {
    return chunks === 0 ? BN(0) : lib?.srcChunkAmount(srcAmount, chunks) || BN(0);
  }, [lib, srcAmount, chunks]);
};

export const useDurationUi = () => {
  const fillDelayUiMillis = useFillDelayMillis();
  const chunks = useChunks();

  const { lib, isLimitPanel } = useTwapContext();

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
  const srcToken = useTwapStore((s) => s.srcToken);
  const srcChunksAmount = useSrcChunkAmount();

  return useFormatDecimals(useAmountUi(srcToken?.decimals, srcChunksAmount.toString()), 2);
};

export const useChunksBiggerThanOne = () => {
  const { srcToken, srcAmountUi } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    srcAmountUi: s.srcAmountUi,
  }));

  const maxPossibleChunks = useMaxPossibleChunks();

  return useMemo(() => {
    if (!srcToken || !srcAmountUi) return false;
    return maxPossibleChunks > 1;
  }, [maxPossibleChunks, srcToken, srcAmountUi]);
};

export const useDeadline = () => {
  const { confirmationClickTimestamp } = useTwapStore((s) => ({
    confirmationClickTimestamp: s.confirmationClickTimestamp,
  }));

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

export const useSetSrcAmountUi = () => {
  const { updateState, srcToken } = useTwapStore((s) => ({
    updateState: s.updateState,
    srcToken: s.srcToken,
  }));
  const lib = useTwapContext().lib;
  const srcUsd = useSrcUsd().value.toString();

  return useCallback(
    (srcAmountUi: string) => {
      setQueryParam(QUERY_PARAMS.INPUT_AMOUNT, !srcAmountUi ? undefined : srcAmountUi);
      if (!srcAmountUi) {
        setQueryParam(QUERY_PARAMS.LIMIT_PRICE, undefined);
        setQueryParam(QUERY_PARAMS.TRADES_AMOUNT, undefined);
        setQueryParam(QUERY_PARAMS.TRADE_INTERVAL, undefined);
      }

      updateState({
        srcAmountUi,
        customFillDelay: { resolution: TimeResolution.Minutes, amount: MIN_TRADE_INTERVAL_FORMATTED },
        customChunks: undefined,
      });
    },
    [updateState, srcToken, srcUsd, lib]
  );
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
  const srcAmount = useTwapStore((s) => s.getSrcAmount().toString());
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

  const { srcToken, dstToken } = useTwapStore((store) => ({
    srcToken: store.srcToken,
    dstToken: store.dstToken,
  }));
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
  const { isInvertedLimitPrice } = useTwapStore((s) => ({
    isInvertedLimitPrice: s.isInvertedLimitPrice,
  }));

  return useMemo(() => {
    if (!limitPrice || !marketPrice || BN(limitPrice).isZero() || BN(limitPrice).isZero()) return "0";
    const from = isInvertedLimitPrice ? marketPrice : limitPrice;
    const to = isInvertedLimitPrice ? limitPrice : marketPrice;
    return BN(from).div(to).minus(1).multipliedBy(100).decimalPlaces(2, BN.ROUND_HALF_UP).toString();
  }, [limitPrice, marketPrice, isInvertedLimitPrice]);
};

export const useShouldWrap = () => {
  const { lib } = useTwapContext();
  const { srcToken, dstToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));

  return useMemo(() => {
    if (!lib || !srcToken || !dstToken) return;

    return [TokensValidation.wrapAndOrder, TokensValidation.wrapOnly].includes(lib.validateTokens(srcToken, dstToken!));
  }, [lib, srcToken, dstToken]);
};

export const useShouldOnlyWrap = () => {
  const { srcToken, dstToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));
  const lib = useTwapContext().lib;
  return useMemo(() => {
    if (!lib || !srcToken || !dstToken) return false;
    return lib?.validateTokens(srcToken!, dstToken!) === TokensValidation.wrapOnly;
  }, [lib, srcToken, dstToken]);
};

export const useShouldUnwrap = () => {
  const { lib } = useTwapContext();
  const { srcToken, dstToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));

  return useMemo(() => {
    if (!lib || !srcToken || !dstToken) return;

    return lib.validateTokens(srcToken, dstToken) === TokensValidation.unwrapOnly;
  }, [lib, srcToken, dstToken]);
};

export const useIsInvalidTokens = () => {
  const { lib } = useTwapContext();
  const { srcToken, dstToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));
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
  const customFillDelay = useTwapStore((s) => s.customFillDelay);
  const { isLimitPanel } = useTwapContext();

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
  const isLimitPanel = useTwapContext().isLimitPanel;
  const isMarketOrder = useTwapStore((s) => s.isMarketOrder);

  return isLimitPanel ? false : isMarketOrder;
};

export const useExplorerUrl = () => {
  const lib = useTwapContext().lib;

  return useMemo(() => getExplorerUrl(lib?.config.chainId), [lib?.config.chainId]);
};

export const useSetSwapSteps = () => {
  const shouldWrap = useShouldWrap();
  const { data: haveAllowance, isLoading: allowanceLoading } = query.useAllowance();
  const updateState = useTwapStore((s) => s.updateState);
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
  const { srcToken, dstToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));

  return useMemo(() => {
    return isStableCoin(srcToken) || isStableCoin(dstToken);
  }, [srcToken, dstToken]);
};

export const useTokenBalance = (isSrc?: boolean) => {
  const { srcToken, dstToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));
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
