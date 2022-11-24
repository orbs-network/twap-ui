import BN from "bignumber.js";
import { atom, Getter } from "jotai";
import { atomFamily, atomWithDefault, atomWithReset, loadable, RESET } from "jotai/utils";
import { atomWithQuery, queryClientAtom } from "jotai/query";
import { convertDecimals, parsebn, zero } from "@defi.org/web3-candies";
import { Order, Paraswap, TokenData, TokensValidation, TWAPLib, Status } from "@orbs-network/twap";
import _ from "lodash";
import moment from "moment";
import Web3 from "web3";

export const twapLibAtom = atomWithReset<TWAPLib | undefined>(undefined);
const allTokensListValue = atom<TokenData[]>([]);
export const allTokensListAtom = atom(
  (get) => get(allTokensListValue),
  (get, set, value: TokenData[]) => {
    set(
      allTokensListValue,
      _.map(value, (t) => ({ ...t, address: Web3.utils.toChecksumAddress(t.address) }))
    );
  }
);

const srcTokenValue = atomWithReset<TokenData | undefined>(undefined);
export const srcTokenAtom = atom(
  (get) => get(srcTokenValue),
  (_get, set, token: TokenData | undefined) => {
    set(srcTokenValue, token);
    set(srcAmountUiAtomValue, RESET);
    set(limitPriceValueAtom, RESET);
    set(totalChunksValueAtom, RESET);
  }
);
const dstTokenValue = atomWithReset<TokenData | undefined>(undefined);
export const dstTokenAtom = atom(
  (get) => get(dstTokenValue),
  (get, set, token: TokenData | undefined) => {
    set(dstTokenValue, token);
    set(limitPriceValueAtom, RESET);
  }
);

export const srcAmountUiAtomValue = atomWithReset("");
export const srcAmountUiAtom = atom(
  (get) => get(srcAmountUiAtomValue),
  (get, set, value: string) => {
    set(srcAmountUiAtomValue, value);
    set(totalChunksValueAtom, RESET);
  }
);

export const createOrderLoadingAtom = atom(false);

export const limitPriceValueAtom = atomWithDefault((get) => ({ price: get(marketPriceGet(false)).marketPriceUi, inverted: false }));
export const limitPriceUiAtom = atom(
  (get) => get(limitPriceValueAtom),
  (_get, set, value: { price: string; inverted: boolean }) => {
    set(limitPriceValueAtom, value);
  }
);

const totalChunksValueAtom = atomWithReset(1);
export const maxPossibleChunksGet = atom((get) =>
  !!get(twapLibAtom) && !!get(srcTokenAtom) ? get(twapLibAtom)!.maxPossibleChunks(get(srcTokenAtom)!, get(srcAmountGet), get(usdGet(get(srcTokenAtom))).value) : 1
);
export const totalChunksAtom = atom(
  (get) => get(totalChunksValueAtom),
  (get, set, value: number) => {
    set(totalChunksValueAtom, Math.min(value, get(maxPossibleChunksGet)));
  }
);

export const isLimitOrderAtom = atomWithReset(false);
export const confirmationAtom = atomWithReset(false);
export const disclaimerAcceptedAtom = atomWithReset(false);

export enum TimeResolution {
  Minutes = 60 * 1000,
  Hours = Minutes * 60,
  Days = Hours * 24,
}
const maxDurationValue = atomWithReset({ resolution: TimeResolution.Minutes, amount: 5 });
export const maxDurationAtom = atom(
  (get) => get(maxDurationValue),
  (get, set, value: { resolution: TimeResolution; amount: number }) => {
    if (get(twapLibAtom) && value.resolution * value.amount < get(twapLibAtom)!.config.bidDelaySeconds * 1000)
      set(maxDurationValue, { resolution: TimeResolution.Minutes, amount: get(twapLibAtom)!.config.bidDelaySeconds / 60 });
    else set(maxDurationValue, value);
  }
);
const fillDelayValue = atomWithReset({ resolution: TimeResolution.Minutes, amount: 0 });
export const fillDelayAtom = atom(
  (get) => {
    if (!get(twapLibAtom)) return get(fillDelayValue);
    if (get(customFillDelayEnabledAtom)) return get(fillDelayValue);
    const millis = get(twapLibAtom)!.fillDelayMillis(get(totalChunksAtom), get(maxDurationAtom).resolution * get(maxDurationAtom).amount);

    const resolution = _.find([TimeResolution.Days, TimeResolution.Hours, TimeResolution.Minutes], (r) => r <= millis) || TimeResolution.Minutes;
    return { resolution, amount: Number(BN(millis / resolution).toFixed(2)) };
  },
  (get, set, { resolution, amount }: { resolution: TimeResolution; amount: number }) => {
    set(fillDelayValue, { resolution, amount });
  }
);
export const fillDelayMillisGet = atom((get) => get(fillDelayAtom).resolution * get(fillDelayAtom).amount);
export const customFillDelayEnabledAtom = atomWithReset(false);

export const deadlineGet = atom((get) =>
  moment()
    .add(get(maxDurationAtom).resolution * get(maxDurationAtom).amount)
    .add(60_000, "milliseconds")
    .valueOf()
);
export const deadlineUiGet = atom((get) => moment(get(deadlineGet)).format("DD/MM/YYYY HH:mm"));

export const priceUsdFetcherAtom = atomWithDefault(() => ({ priceUsd: Paraswap.priceUsd }));

export const resetAllQueriesSet = atom(null, async (get) => {
  await get(queryClientAtom).resetQueries();
});

export const resetAllSet = atom(null, (get, set) => {
  set(srcTokenValue, RESET);
  set(dstTokenValue, RESET);
  set(srcAmountUiAtomValue, RESET);
  set(limitPriceValueAtom, RESET);
  set(disclaimerAcceptedAtom, RESET);
  set(customFillDelayEnabledAtom, RESET);
  set(fillDelayValue, RESET);
  set(totalChunksValueAtom, RESET);
  set(isLimitOrderAtom, RESET);
  set(confirmationAtom, RESET);
  set(priceUsdFetcherAtom, RESET);
  set(maxDurationValue, RESET);
  get(queryClientAtom).resetQueries({ queryKey: ["accountBalanceQuery"], exact: false });
  get(queryClientAtom).resetQueries({ queryKey: ["orderHistoryQuery"], exact: false });
});

export const srcAmountGet = atom((get) => parsebn(get(srcAmountUiAtom) || "0").times(BN(10).pow(get(srcTokenAtom)?.decimals || 0)));

export const dstAmountGet = atom((get) => {
  const lib = get(twapLibAtom);
  if (!lib) return zero;
  const srcUsd = get(usdGet(get(srcTokenAtom))).value;
  const dstUsd = get(usdGet(get(dstTokenAtom))).value;
  if (srcUsd.isZero() || dstUsd.isZero()) return zero;
  return lib.dstAmount(get(srcTokenAtom)!, get(dstTokenAtom)!, get(srcAmountGet), srcUsd, dstUsd, get(limitPriceGet(false)).limitPrice, !get(isLimitOrderAtom));
});

export const srcAmountPercentSet = atom(null, (get, set, percent: number) => {
  if (!get(srcTokenAtom)) return;
  set(srcAmountUiAtom, amountUi(get(srcTokenAtom)!, get(balanceGet(get(srcTokenAtom))).value.times(percent)));
});

export const srcChunkAmountGet = atom((get) => (get(twapLibAtom) ? get(twapLibAtom)!.srcChunkAmount(get(srcAmountGet), get(totalChunksAtom)) : zero));

export const switchTokensSet = atom(null, (get, set) => {
  const srcToken = get(srcTokenAtom);
  const dstToken = get(dstTokenAtom);
  const dstAmountUi = get(dstAmountUiGet);
  const dstAmount = get(dstAmountGet);
  set(srcTokenAtom, dstToken);
  set(dstTokenAtom, srcToken);
  set(srcAmountUiAtom, dstAmount.isZero() ? "" : dstAmountUi);
});

export const dstMinAmountOutGet = atom((get) =>
  get(twapLibAtom) && get(srcTokenAtom) && get(dstTokenAtom) && get(limitPriceGet(false)).limitPrice.gt(0)
    ? get(twapLibAtom)!.dstMinAmountOut(get(srcTokenAtom)!, get(dstTokenAtom)!, get(srcChunkAmountGet), get(limitPriceGet(false)).limitPrice, !get(isLimitOrderAtom))
    : BN(1)
);

export const dstAmountUiGet = atom((get) => amountUi(get(dstTokenAtom), get(dstAmountGet)));
export const srcUsdUiGet = atom((get) => amountUi(get(srcTokenAtom), get(srcAmountGet).times(get(usdGet(get(srcTokenAtom))).value)));
export const dstUsdUiGet = atom((get) => amountUi(get(dstTokenAtom), get(dstAmountGet).times(get(usdGet(get(dstTokenAtom))).value)));
export const srcBalanceUiGet = atom((get) => amountUi(get(srcTokenAtom), get(balanceGet(get(srcTokenAtom))).value));
export const dstBalanceUiGet = atom((get) => amountUi(get(dstTokenAtom), get(balanceGet(get(dstTokenAtom))).value));
export const srcChunkAmountUiGet = atom((get) => amountUi(get(srcTokenAtom), get(srcChunkAmountGet)));
export const dstMinAmountOutUiGet = atom((get) => (get(dstMinAmountOutGet).eq(1) ? "" : amountUi(get(dstTokenAtom), get(dstMinAmountOutGet))));
export const srcChunkAmountUsdUiGet = atom((get) => amountUi(get(srcTokenAtom), get(srcChunkAmountGet).times(get(usdGet(get(srcTokenAtom))).value)));
export const shouldWrapNativeGet = atom(
  (get) =>
    !!get(srcTokenAtom) &&
    !!get(twapLibAtom) &&
    !!get(dstTokenAtom) &&
    [TokensValidation.wrapAndOrder, TokensValidation.wrapOnly].includes(get(twapLibAtom)!.validateTokens(get(srcTokenAtom)!, get(dstTokenAtom)!))
);

export const invalidTokenGet = atom(
  (get) => !!get(srcTokenAtom) && !!get(dstTokenAtom) && get(twapLibAtom)?.validateTokens(get(srcTokenAtom)!, get(dstTokenAtom)!) === TokensValidation.invalid
);

export const shouldUnwrapGet = atom(
  (get) => !!get(srcTokenAtom) && !!get(dstTokenAtom) && get(twapLibAtom)?.validateTokens(get(srcTokenAtom)!, get(dstTokenAtom)!) === TokensValidation.unwrapOnly
);

export const marketPriceGet = atomFamily((inverted: boolean) =>
  atom((get) => {
    const srcToken = get(srcTokenAtom);
    const dstToken = get(dstTokenAtom);
    const srcUsd = get(usdGet(srcToken)).value;
    const dstUsd = get(usdGet(dstToken)).value;
    const leftToken = inverted ? dstToken : srcToken;
    const rightToken = !inverted ? dstToken : srcToken;
    const leftUsd = inverted ? dstUsd : srcUsd;
    const rightUsd = !inverted ? dstUsd : srcUsd;
    const marketPrice = !leftUsd.isZero() && !rightUsd.isZero() ? leftUsd.div(rightUsd) : zero;

    return {
      leftToken,
      rightToken,
      marketPrice,
      marketPriceUi: marketPrice.toFormat(),
    };
  })
);

export const limitPriceGet = atomFamily((showingInverted: boolean) =>
  atom((get) => {
    const srcToken = get(srcTokenAtom);
    const dstToken = get(dstTokenAtom);
    const leftToken = showingInverted ? dstToken : srcToken;
    const rightToken = !showingInverted ? dstToken : srcToken;

    const limitUi = get(limitPriceUiAtom);
    const invertedPriceUi = parsebn(limitUi.price).isZero() ? "" : BN(1).div(parsebn(limitUi.price)).toFormat();
    const limitPriceUi = showingInverted === limitUi.inverted ? limitUi.price : invertedPriceUi;
    const limitPrice = parsebn(limitPriceUi);

    return {
      leftToken,
      rightToken,
      limitPriceUi,
      limitPrice,
    };
  })
);

/**
 * ---------------
 * queries
 * ---------------
 */

const usdValueQuery = atomFamily(
  (token: TokenData) =>
    atomWithQuery((get) => ({
      queryKey: [`usdValue`, token.address],
      queryFn: () => get(priceUsdFetcherAtom).priceUsd(get(twapLibAtom)!.config.chainId, token),
      enabled: !!get(twapLibAtom) && !!token,
      refetchInterval: 60_000,
      staleTime: 60_000,
    })),
  _.isEqual
);

const sameNativeBasedTokenGet = atom((get) => {
  const srcToken = get(srcTokenAtom);
  const dstToken = get(dstTokenAtom);
  const lib = get(twapLibAtom);
  if (!srcToken || !dstToken || !lib) return false;
  return (lib.isNativeToken(srcToken) || lib.isNativeToken(dstToken)) && (lib.isWrappedToken(srcToken) || lib.isWrappedToken(dstToken));
});

const usdValueLoad = atomFamily((token: TokenData) => loadable(usdValueQuery(token)), _.isEqual);
export const usdGet = atomFamily(
  (token: TokenData | undefined) =>
    atom((get) => {
      if (!token) {
        return {
          loading: false,
          value: zero,
        };
      }

      const result = get(usdValueLoad(get(sameNativeBasedTokenGet) ? get(twapLibAtom)!.config.wToken : token));
      return {
        loading: result.state === "loading",
        value: result.state === "hasData" ? result.data! : zero,
      };
    }),
  _.isEqual
);

const allowanceQuery = atomWithQuery((get) => ({
  queryKey: [`allowanceQuery`, get(twapLibAtom)?.maker, get(srcTokenAtom)?.address, get(srcAmountUiAtomValue)],
  queryFn: () => get(twapLibAtom)!.hasAllowance(get(srcTokenAtom)!, get(srcAmountGet)),
  enabled: !!get(twapLibAtom) && !!get(twapLibAtom)?.maker && !!get(srcTokenAtom) && !!get(srcTokenValue) && get(srcAmountGet).gt(0),
  staleTime: 10_000,
  refetchOnWindowFocus: true,
}));

export const refetchAllowanceSet = atom(null, (get, set) => {
  set(allowanceQuery, { type: "refetch" });
});

const allowanceLoad = loadable(allowanceQuery);
export const tokenAllowanceGet = atom((get) => {
  const allowance = get(allowanceLoad);
  return {
    loading: allowance.state === "loading",
    hasAllowance: allowance.state === "hasData" ? allowance.data : false,
  };
});

const accountBalanceQuery = atomFamily(
  (token: TokenData) =>
    atomWithQuery((get) => ({
      queryKey: ["accountBalanceQuery", get(twapLibAtom)?.maker, token!.address],
      queryFn: () => get(twapLibAtom)!.makerBalance(token!),
      enabled: !!get(twapLibAtom) && !!token,
      refetchInterval: 10_000,
    })),
  _.isEqual
);
const accountBalanceLoad = atomFamily((token: TokenData) => loadable(accountBalanceQuery(token)), _.isEqual);
export const balanceGet = atomFamily(
  (token: TokenData | undefined) =>
    atom((get) => {
      if (!token) return { value: zero, loading: false };
      const result = get(accountBalanceLoad(token));
      return { value: result.state === "hasData" ? result.data! : zero, loading: result.state === "loading" };
    }),
  _.isEqual
);

const gasPriceQuery = atomWithQuery((get) => ({
  queryKey: ["gasPriceQuery", get(twapLibAtom)!.config.chainId],
  queryFn: () => Paraswap.gasPrices(get(twapLibAtom)!.config.chainId),
  enabled: !!get(twapLibAtom),
  refetchInterval: 60_000,
}));

const gasPriceLoad = loadable(gasPriceQuery);

export const gasPriceGet = atomFamily((gasPrice?: { priorityFeePerGas?: string; maxFeePerGas?: string }) =>
  atom((get) => {
    const value = { maxFeePerGas: BN(gasPrice?.maxFeePerGas || 0), priorityFeePerGas: BN(gasPrice?.priorityFeePerGas || 0) };
    if (value.priorityFeePerGas.gt(0) && value.maxFeePerGas.gt(0)) return value;
    const result = get(gasPriceLoad);
    if (result.state !== "hasData") return value;
    const priorityFeePerGas = value.priorityFeePerGas.gt(0) ? value.priorityFeePerGas : result.data!.low;
    return {
      priorityFeePerGas,
      maxFeePerGas: BN.max(value.maxFeePerGas.gt(0) ? value.maxFeePerGas : result.data!.instant, priorityFeePerGas),
    };
  })
);

const prepareHistoryTokens = async (rawOrders: Order[], get: Getter) => {
  const srcTokens = _.map(rawOrders, (order) => get(allTokensListAtom).find((it) => it.address === order.ask.srcToken));
  const dstTokens = _.map(rawOrders, (order) => get(allTokensListAtom).find((it) => it.address === order.ask.dstToken));
  const client = get(queryClientAtom);
  const tokens = _.uniqBy(
    _.filter([...srcTokens, ...dstTokens], (t) => !!t),
    (t) => t!.address
  );

  const values = await Promise.all(
    tokens.map(async (token) => {
      await client.prefetchQuery({
        queryKey: [`usdValue`, token!.address],
        queryFn: () => get(priceUsdFetcherAtom).priceUsd(get(twapLibAtom)!.config.chainId, token!),
        staleTime: 60_000,
      });
      const res = get(usdValueQuery(token!));
      return res;
    })
  );
  return _.mapKeys(
    _.map(tokens, (token, i) => ({ token: token!, usd: values[i] || zero })),
    (t) => t.token.address
  );
};

const orderHistoryQuery = atomWithQuery((get) => ({
  queryKey: ["orderHistoryQuery", get(twapLibAtom)!.maker],
  queryFn: async () => {
    const rawOrders = await get(twapLibAtom)!.getAllOrders();
    const tokens = await prepareHistoryTokens(rawOrders, get);
    const lib = get(twapLibAtom);
    const parsedOrders = _.map(rawOrders, (o) => parseOrder(lib!, tokens, o));
    return _.chain(parsedOrders)
      .orderBy((o: OrderUI) => o.order.ask.deadline, "desc")
      .groupBy((o: OrderUI) => o.ui.status)
      .value();
  },
  refetchInterval: 10_000,
  enabled: !!get(twapLibAtom) && !!get(twapLibAtom)?.maker && !!get(allTokensListAtom) && get(allTokensListAtom).length > 0,
}));

const orderHistoryLoad = loadable(orderHistoryQuery);
export const orderHistoryGet = atom((get) => {
  const result = get(orderHistoryLoad);
  return {
    loading: result.state === "loading",
    orders: result.state === "hasData" ? result.data! : undefined,
  };
});

export type OrderUI = ReturnType<typeof parseOrder>;
const parseOrder = (lib: TWAPLib, usdValues: { [address: string]: { token: TokenData; usd: BN } }, o: Order) => {
  const { usd: srcUsd, token: srcToken } = usdValues[o.ask.srcToken];
  const { usd: dstUsd, token: dstToken } = usdValues[o.ask.dstToken];

  const isMarketOrder = lib.isMarketOrder(o);
  const priceDstFor1Src = isMarketOrder ? srcUsd.div(dstUsd) : o.ask.dstMinAmount.div(convertDecimals(o.ask.srcBidAmount, srcToken?.decimals || 0, dstToken?.decimals || 0));
  const dstAmount = priceDstFor1Src.times(convertDecimals(o.ask.srcAmount, srcToken?.decimals || 0, dstToken?.decimals || 0));
  const srcRemainingAmount = o.ask.srcAmount.minus(o.srcFilledAmount);
  const progress = lib.orderProgress(o) * 100;
  const status = lib.status(o);

  return {
    order: o,
    ui: {
      srcToken,
      dstToken,
      status: progress >= 99.9 ? Status.Completed : status,
      srcUsdUi: srcUsd.toFormat(),
      dstUsdUi: dstUsd.toFormat(),
      srcAmountUi: amountUi(srcToken, o.ask.srcAmount),
      dstAmountUi: amountUi(dstToken, dstAmount),
      dstAmountUsdUi: amountUi(dstToken, dstAmount.times(dstUsd)),
      dstAmountUsd: dstAmount.times(dstUsd),
      dstPriceFor1Src: lib.dstPriceFor1Src(srcToken, dstToken, srcUsd, dstUsd, o.ask.srcBidAmount, o.ask.dstMinAmount),
      srcChunkAmountUi: amountUi(srcToken, o.ask.srcBidAmount),
      srcChunkAmountUsdUi: amountUi(srcToken, o.ask.srcBidAmount.times(srcUsd)),
      srcFilledAmountUi: amountUi(srcToken, o.srcFilledAmount),
      srcFilledAmountUsdUi: amountUi(srcToken, o.srcFilledAmount.times(srcUsd)),
      srcRemainingAmountUi: amountUi(srcToken, srcRemainingAmount),
      srcRemainingAmountUsdUi: amountUi(srcToken, srcRemainingAmount.times(srcUsd)),
      dstMinAmountOutUi: amountUi(dstToken, o.ask.dstMinAmount),
      dstMinAmountOutUsdUi: amountUi(dstToken, o.ask.dstMinAmount.times(dstUsd)),
      srcAmountUsdUi: amountUi(srcToken, o.ask.srcAmount.times(srcUsd)),
      fillDelay: o.ask.fillDelay * 1000,
      createdAtUi: moment(o.ask.time * 1000).format("DD/MM/YY HH:mm"),
      deadlineUi: moment(o.ask.deadline * 1000).format("DD/MM/YY HH:mm"),
      progress: progress >= 99.9 ? 100 : progress,
      isMarketOrder,
      prefix: isMarketOrder ? "~" : "≥",
      totalChunks: o.ask.srcAmount.div(o.ask.srcBidAmount).integerValue(BN.ROUND_CEIL).toNumber(),
    },
  };
};
const amountUi = (token: TokenData | undefined, amount: BN) => amount.div(BN(10).pow(token?.decimals || 0)).toFormat();
