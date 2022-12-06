import BN from "bignumber.js";
import { Order, Status, TokenData, TokensValidation, TWAPLib } from "@orbs-network/twap";
import moment from "moment";
import create from "zustand";
import { combine } from "zustand/middleware";
import _ from "lodash";
import { parsebn } from "@defi.org/web3-candies";

export enum TimeResolution {
  Minutes = 60 * 1000,
  Hours = Minutes * 60,
  Days = Hours * 24,
}

export type Duration = { resolution: TimeResolution; amount: number };

/**
 * TWAP Store
 */

const initialState = {
  lib: undefined as TWAPLib | undefined,
  srcToken: undefined as TokenData | undefined,
  dstToken: undefined as TokenData | undefined,
  wrongNetwork: false,

  srcAmountUi: "",

  limitPriceUi: { priceUi: "", inverted: false },
  srcUsd: BN(0),
  dstUsd: BN(0),
  srcBalance: BN(0),
  dstBalance: BN(0),

  loading: false,
  isLimitOrder: false,
  confirmationClickTimestamp: 0,
  showConfirmation: false,
  disclaimerAccepted: false,

  chunks: 1,
  duration: { resolution: TimeResolution.Minutes, amount: 5 },
  customFillDelay: { resolution: TimeResolution.Minutes, amount: 0 },
  customFillDelayEnabled: false,
};

export const useTwapStore = create(
  combine(initialState, (set, get) => ({
    reset: () => set(initialState),
    setLib: (lib?: TWAPLib) => set({ lib }),
    setLoading: (loading: boolean) => set({ loading }),
    setSrcToken: (srcToken?: TokenData) => set({ srcToken, chunks: 1, limitPriceUi: initialState.limitPriceUi, srcAmountUi: "" }),
    setDstToken: (dstToken?: TokenData) => set({ dstToken, limitPriceUi: initialState.limitPriceUi }),
    setSrcAmountUi: (srcAmountUi: string) => set({ srcAmountUi, chunks: 1 }),
    setSrcBalance: (srcBalance: BN) => set({ srcBalance }),
    setDstBalance: (dstBalance: BN) => set({ dstBalance }),
    setSrcUsd: (srcUsd: BN) => set({ srcUsd }),
    setDstUsd: (dstUsd: BN) => set({ dstUsd }),
    getSrcAmount: () => amountBN(get().srcToken, get().srcAmountUi),
    getDstAmount: () => {
      if (!get().lib || !get().srcToken || !get().dstToken || get().srcUsd.isZero() || get().dstUsd.isZero()) return BN(0);
      return get().lib!.dstAmount(
        get().srcToken!,
        get().dstToken!,
        (get() as any).getSrcAmount(),
        get().srcUsd,
        get().dstUsd,
        (get() as any).getLimitPrice(false).limitPrice,
        !get().isLimitOrder
      );
    },
    setDisclaimerAccepted: (disclaimerAccepted: boolean) => set({ disclaimerAccepted }),
    setWrongNetwork: (wrongNetwork: boolean) => set({ wrongNetwork }),
    setShowConfirmation: (showConfirmation: boolean) => set({ showConfirmation }),

    toggleLimitOrder: () => set({ isLimitOrder: !get().isLimitOrder, limitPriceUi: (get() as any).getMarketPrice(false) }),
    setLimitPriceUi: (limitPriceUi: { priceUi: string; inverted: boolean }) => set({ limitPriceUi }),

    setChunks: (chunks: number) => set({ chunks: Math.min(chunks, (get() as any).getMaxPossibleChunks()) }),

    setDuration: (duration: Duration) =>
      get().lib &&
      set(() => ({
        duration:
          duration.resolution * duration.amount < get().lib!.config.bidDelaySeconds * 2 * 1000
            ? { resolution: TimeResolution.Minutes, amount: (get().lib!.config.bidDelaySeconds * 2) / 60 }
            : duration,
      })),

    isSameNativeBasedToken: () =>
      !!get().lib &&
      !!get().srcToken &&
      !!get().dstToken &&
      (get().lib!.isNativeToken(get().srcToken!) || get().lib!.isNativeToken(get().dstToken!)) &&
      (get().lib!.isWrappedToken(get().srcToken!) || get().lib!.isWrappedToken(get().dstToken!)),

    getMaxPossibleChunks: () => (get().lib && get().srcToken ? get().lib!.maxPossibleChunks(get().srcToken!, amountBN(get().srcToken, get().srcAmountUi), get().srcUsd) : 1),

    getMarketPrice: (inverted: boolean) => {
      const leftToken = inverted ? get().dstToken : get().srcToken;
      const rightToken = !inverted ? get().dstToken : get().srcToken;
      const leftUsd = inverted ? get().dstUsd : get().srcUsd;
      const rightUsd = !inverted ? get().dstUsd : get().srcUsd;
      const marketPrice = !leftUsd.isZero() && !rightUsd.isZero() ? leftUsd.div(rightUsd) : BN(0);

      return {
        leftToken,
        rightToken,
        marketPrice,
        marketPriceUi: marketPrice.toFormat(),
      };
    },

    getLimitPrice: (showingInverted: boolean) => {
      const leftToken = showingInverted ? get().dstToken : get().srcToken;
      const rightToken = !showingInverted ? get().dstToken : get().srcToken;

      const invertedUi = parsebn(get().limitPriceUi.priceUi).isZero() ? "" : BN(1).div(parsebn(get().limitPriceUi.priceUi)).toFormat();
      const limitPriceUi = showingInverted === get().limitPriceUi.inverted ? get().limitPriceUi.priceUi : invertedUi;
      const limitPrice = parsebn(limitPriceUi);

      return {
        leftToken,
        rightToken,
        limitPriceUi,
        limitPrice,
      };
    },

    setFillDelay: (customFillDelay: { resolution: TimeResolution; amount: number }) => set({ customFillDelay }),
    getFillDelay: () => {
      if (!get().lib) return { resolution: TimeResolution.Minutes, amount: 0 };
      if (get().customFillDelayEnabled && get().customFillDelay) return get().customFillDelay;
      const millis = get().lib!.fillDelayMillis(get().chunks, get().duration.resolution * get().duration.amount);
      const resolution = _.find([TimeResolution.Days, TimeResolution.Hours, TimeResolution.Minutes], (r) => r <= millis) || TimeResolution.Minutes;
      return { resolution, amount: Number(BN(millis / resolution).toFixed(2)) };
    },
    getFillDelayMillis: () => (get() as any).getFillDelay().amount * (get() as any).getFillDelay().resolution,
    setCustomFillDelayEnabled: () => set({ customFillDelayEnabled: true }),

    switchTokens: () => {
      const srcToken = get().srcToken!;
      const dstToken = get().dstToken!;
      const dstAmountUi: string = (get() as any).getDstAmountUi();
      const dstAmount: BN = (get() as any).getDstAmount();
      (get() as any).setSrcToken(dstToken);
      (get() as any).setDstToken(srcToken);
      (get() as any).setSrcAmountUi(dstAmount.isZero() ? "" : dstAmountUi);
    },

    getSrcChunkAmount: () => get().lib?.srcChunkAmount((get() as any).getSrcAmount(), get().chunks) || BN(0),

    getDstMinAmountOut: () =>
      get().lib && get().srcToken && get().dstToken && (get() as any).getLimitPrice(false).limitPrice.gt(0)
        ? get().lib!.dstMinAmountOut(get().srcToken!, get().dstToken!, (get() as any).getSrcChunkAmount(), (get() as any).getLimitPrice(false).limitPrice, !get().isLimitOrder)
        : BN(1),

    setSrcAmountPercent: (percent: number) => (get().srcToken ? (get() as any).setSrcAmountUi(amountUi(get().srcToken, get().srcBalance.times(percent))) : undefined),

    shouldWrap: () =>
      get().lib &&
      get().srcToken &&
      get().dstToken &&
      [TokensValidation.wrapAndOrder, TokensValidation.wrapOnly].includes(get().lib!.validateTokens(get().srcToken!, get().dstToken!)),

    shouldUnwrap: () => get().lib && get().srcToken && get().dstToken && get().lib!.validateTokens(get().srcToken!, get().dstToken!) === TokensValidation.unwrapOnly,

    isInvalidTokens: () => get().lib && get().srcToken && get().dstToken && get().lib!.validateTokens(get().srcToken!, get().dstToken!) === TokensValidation.invalid,

    onClickConfirmation: () => set({ confirmationClickTimestamp: Date.now() }),
    getDeadline: () =>
      moment(get().confirmationClickTimestamp)
        .add(get().duration.amount * get().duration.resolution)
        .add(1, "minute")
        .valueOf(),
    getDeadlineUi: () => moment((get() as any).getDeadline()).format("DD/MM/YYYY HH:mm"),

    getDstAmountUi: () => amountUi(get().dstToken, (get() as any).getDstAmount()),
    getSrcAmountUsdUi: () => amountUi(get().srcToken, (get() as any).getSrcAmount().times(get().srcUsd)),
    getDstAmountUsdUi: () => amountUi(get().dstToken, (get() as any).getDstAmount().times(get().dstUsd)),
    getSrcBalanceUi: () => amountUi(get().srcToken, get().srcBalance),
    getDstBalanceUi: () => amountUi(get().dstToken, get().dstBalance),
    getSrcChunkAmountUi: () => amountUi(get().srcToken, (get() as any).getSrcChunkAmount()),
    getDstMinAmountOutUi: () => ((get() as any).getDstMinAmountOut().eq(1) ? "" : amountUi(get().dstToken, (get() as any).getDstMinAmountOut())),
    getSrcChunkAmountUsdUi: () => amountUi(get().srcToken, (get() as any).getSrcChunkAmount().times(get().srcUsd)),
  }))
);

export const prepareOrdersTokensWithUsd = async (allTokens: TokenData[], rawOrders: Order[], fetchUsd: (token: TokenData) => Promise<BN>) => {
  const relevantTokens = allTokens.filter((t) => rawOrders.find((o) => t.address === o.ask.srcToken || t.address === o.ask.dstToken));
  const usdValues = await Promise.all(relevantTokens.map(fetchUsd));
  return _.mapKeys(
    relevantTokens.map((t, i) => ({ token: t, usd: usdValues[i] || BN(0) })),
    (t) => t.token.address
  );
};

export const parseOrderUi = (lib: TWAPLib, usdValues: { [address: string]: { token: TokenData; usd: BN } }, o: Order) => {
  const { token: srcToken, usd: srcUsd } = usdValues[o.ask.srcToken] || { token: undefined, usd: BN(0) };
  const { token: dstToken, usd: dstUsd } = usdValues[o.ask.dstToken] || { token: undefined, usd: BN(0) };

  const isMarketOrder = lib.isMarketOrder(o);
  const dstPriceFor1Src = lib.dstPriceFor1Src(srcToken, dstToken, srcUsd, dstUsd, o.ask.srcBidAmount, o.ask.dstMinAmount);
  const dstAmount = lib.dstAmount(srcToken, dstToken, o.ask.srcAmount, srcUsd, dstUsd, dstPriceFor1Src, isMarketOrder);
  const srcRemainingAmount = o.ask.srcAmount.minus(o.srcFilledAmount);
  const progress = lib.orderProgress(o) < 99 ? lib.orderProgress(o) : 100;
  const status = progress === 100 ? Status.Completed : lib.status(o);

  return {
    order: o,
    ui: {
      srcToken,
      dstToken,
      status,
      progress,
      isMarketOrder,
      dstPriceFor1Src,
      srcUsdUi: srcUsd.toFormat(),
      dstUsdUi: dstUsd.toFormat(),
      srcAmountUi: amountUi(srcToken, o.ask.srcAmount),
      srcAmountUsdUi: amountUi(srcToken, o.ask.srcAmount.times(srcUsd)),
      dstAmountUi: amountUi(dstToken, dstAmount),
      dstAmountUsdUi: amountUi(dstToken, dstAmount.times(dstUsd)),
      dstAmountUsd: dstAmount.times(dstUsd),
      srcChunkAmountUi: amountUi(srcToken, o.ask.srcBidAmount),
      srcChunkAmountUsdUi: amountUi(srcToken, o.ask.srcBidAmount.times(srcUsd)),
      srcFilledAmountUi: amountUi(srcToken, o.srcFilledAmount),
      srcFilledAmountUsdUi: amountUi(srcToken, o.srcFilledAmount.times(srcUsd)),
      srcRemainingAmountUi: amountUi(srcToken, srcRemainingAmount),
      srcRemainingAmountUsdUi: amountUi(srcToken, srcRemainingAmount.times(srcUsd)),
      dstMinAmountOutUi: amountUi(dstToken, o.ask.dstMinAmount),
      dstMinAmountOutUsdUi: amountUi(dstToken, o.ask.dstMinAmount.times(dstUsd)),
      fillDelay: o.ask.fillDelay * 1000,
      createdAtUi: moment(o.ask.time * 1000).format("DD/MM/YY HH:mm"),
      deadlineUi: moment(o.ask.deadline * 1000).format("DD/MM/YY HH:mm"),
      prefix: isMarketOrder ? "~" : "≥",
      totalChunks: o.ask.srcAmount.div(o.ask.srcBidAmount).integerValue(BN.ROUND_CEIL).toNumber(),
    },
  };
};

const amountBN = (token: TokenData | undefined, amount: string) => parsebn(amount).times(BN(10).pow(token?.decimals || 0));
const amountUi = (token: TokenData | undefined, amount: BN) => amount.div(BN(10).pow(token?.decimals || 0)).toFormat();
