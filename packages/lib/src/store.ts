import BN from "bignumber.js";
import { isNativeAddress, Order, OrderInputValidation, Status, TokenData, TokensValidation, TWAPLib } from "@orbs-network/twap";
import moment from "moment";
import { create } from "zustand";
import { combine } from "zustand/middleware";
import _ from "lodash";
import { eqIgnoreCase, parsebn } from "@defi.org/web3-candies";
import { State, StoreOverride, Translations } from "./types";
import { analytics } from "./analytics";
import { MIN_NATIVE_BALANCE } from "./consts";

export enum TimeResolution {
  Minutes = 60 * 1000,
  Hours = Minutes * 60,
  Days = Hours * 24,
}
const SUGGEST_CHUNK_VALUE = 100;
export type Duration = { resolution: TimeResolution; amount?: number };

/**
 * TWAP Store
 */

const initialState: State = {
  lib: undefined,
  srcToken: undefined,
  dstToken: undefined,
  wrongNetwork: undefined,
  srcAmountUi: "",

  limitPriceUi: { priceUi: "", inverted: false },
  srcUsd: BN(0),
  dstUsd: BN(0),
  srcBalance: BN(0),
  dstBalance: BN(0),

  loading: false,
  isLimitOrder: false,
  confirmationClickTimestamp: moment(),
  showConfirmation: false,
  disclaimerAccepted: false,

  chunks: 0,
  fillDelay: { resolution: TimeResolution.Minutes, amount: 2 },
  customDuration: { resolution: TimeResolution.Minutes, amount: undefined },
  waitingForNewOrder: false,
};

export const useTwapStore = create(
  combine(initialState, (set, get) => ({
    setValues: (storeOverride: StoreOverride) => set({ ...storeOverride }),
    setWaitingForNewOrder: (waitingForNewOrder: boolean) => set({ waitingForNewOrder }),
    reset: (storeOverride: StoreOverride) => set({ ...initialState, lib: get().lib, ...storeOverride }),
    setLib: (lib?: TWAPLib) => set({ lib }),
    setLoading: (loading: boolean) => set({ loading }),
    setSrcToken: (srcToken?: TokenData) => {
      srcToken && analytics.onSrcTokenClick(srcToken?.symbol);
      set({ srcToken });
    },
    setDstToken: (dstToken?: TokenData) => {
      dstToken && analytics.onDstTokenClick(dstToken.symbol);
      set({ dstToken, limitPriceUi: initialState.limitPriceUi });
    },
    setSrcAmountUi: (srcAmountUi: string) => {
      set({ srcAmountUi });
      (get() as any).setChunks(get().chunks);
    },
    setSrcBalance: (srcBalance: BN) => set({ srcBalance }),
    setDstBalance: (dstBalance: BN) => set({ dstBalance }),
    setSrcUsd: (srcUsd: BN) => set({ srcUsd }),
    setDstUsd: (dstUsd: BN) => set({ dstUsd }),
    getMaxSrcInputAmount: () => {
      const srcToken = get().srcToken;
      if (isNativeAddress(srcToken?.address || "")) {
        const balance = get().srcBalance;
        const srcTokenMinimum = amountBN(srcToken, MIN_NATIVE_BALANCE.toString());
        return BN.max(0, BN.min(balance.minus(srcTokenMinimum)));
      }
    },
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
    getFillWarning: (translation?: Translations) => {
      if (!translation) return;
      const chunkSize = (get() as any).getSrcChunkAmount();
      const srcToken = get().srcToken;
      const dstToken = get().dstToken;
      const srcBalance = get().srcBalance;
      const srcAmount = (get() as any).getSrcAmount();
      const lib = get().lib;
      const deadline = (get() as any).getDeadline();
      const isLimitOrder = get().isLimitOrder;
      const limitPrice = (get() as any).getLimitPrice(false);
      const maxSrcInputAmount = (get() as any).getMaxSrcInputAmount();

      const isNativeTokenAndValueBiggerThanMax = maxSrcInputAmount && srcAmount?.gt(maxSrcInputAmount);
      if (!srcToken || !dstToken || lib?.validateTokens(srcToken, dstToken) === TokensValidation.invalid) return translation.selectTokens;
      if (srcAmount.isZero()) return translation.enterAmount;
      if ((srcBalance && srcAmount.gt(srcBalance)) || isNativeTokenAndValueBiggerThanMax) return translation.insufficientFunds;
      if (chunkSize.isZero()) return translation.enterTradeSize;
      if ((get() as any).getDurationUi().amount === 0) return translation.enterMaxDuration;
      if (isLimitOrder && limitPrice.limitPrice.isZero()) return translation.insertLimitPriceWarning;
      const valuesValidation = lib?.validateOrderInputs(
        srcToken!,
        dstToken!,
        srcAmount,
        chunkSize,
        (get() as any).getDstMinAmountOut(),
        deadline,
        (get() as any).getFillDelayUiMillis() / 1000,
        get().srcUsd
      );

      if (valuesValidation === OrderInputValidation.invalidTokens) {
        return translation.selectTokens;
      }

      if (valuesValidation === OrderInputValidation.invalidSmallestSrcChunkUsd) {
        return translation.tradeSizeMustBeEqual;
      }
      if ((get() as any).getFillDelayWarning()) {
        return translation.fillDelayWarning;
      }
    },
    getIsPartialFillWarning: () => (get() as any).getChunks() * (get() as any).getFillDelayUiMillis() > (get() as any).getDurationMillis(),
    setDisclaimerAccepted: (disclaimerAccepted: boolean) => set({ disclaimerAccepted }),
    setWrongNetwork: (wrongNetwork?: boolean) => set({ wrongNetwork }),
    setLimitOrder: (limit?: boolean) => {
      set({ isLimitOrder: limit, limitPriceUi: { priceUi: (get() as any).getMarketPrice(false).marketPriceUi, inverted: false } });
    },
    setLimitPriceUi: (limitPriceUi: { priceUi: string; inverted: boolean }) => set({ limitPriceUi }),
    setChunks: (chunks: number) => set({ chunks: Math.min(chunks, (get() as any).getMaxPossibleChunks()) }),
    setDuration: (customDuration: Duration) => set({ customDuration }),

    isSameNativeBasedToken: () =>
      !!get().lib &&
      !!get().srcToken &&
      !!get().dstToken &&
      (get().lib!.isNativeToken(get().srcToken!) || get().lib!.isNativeToken(get().dstToken!)) &&
      (get().lib!.isWrappedToken(get().srcToken!) || get().lib!.isWrappedToken(get().dstToken!)),

    getMaxPossibleChunks: () => (get().lib && get().srcToken ? get().lib!.maxPossibleChunks(get().srcToken!, amountBN(get().srcToken, get().srcAmountUi), get().srcUsd) : 1),
    getChunks: () => {
      const srcUsd = get().srcUsd;
      const srcToken = get().srcToken;
      const chunks = get().chunks;
      if (!srcUsd || !srcToken) return 1;
      if (chunks >= 1) return chunks;

      const maxPossibleChunks = (get() as any).getMaxPossibleChunks();
      const srcAmountUsd = (get() as any).getSrcAmount().times(get().srcUsd);

      return Math.min(maxPossibleChunks, srcAmountUsd.div(BN(10).pow(srcToken.decimals)).idiv(SUGGEST_CHUNK_VALUE).toNumber() || 1);
    },
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
        loading: !leftToken || !rightToken ? false : leftUsd.isZero() || rightUsd.isZero(),
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
    setTokens: (srcToken?: TokenData, dstToken?: TokenData) => {
      srcToken && (get() as any).setSrcToken(srcToken);
      dstToken && (get() as any).setDstToken(dstToken);
    },
    setFillDelay: (fillDelay: Duration) => {
      set({ fillDelay });
    },

    getDurationUi: () => {
      if (!get().lib) return { resolution: TimeResolution.Minutes, amount: 0 };

      if (get().customDuration.amount !== undefined) return get().customDuration;

      const _millis = (get() as any).getFillDelayUiMillis() * 2 * (get() as any).getChunks();

      const resolution = _.find([TimeResolution.Days, TimeResolution.Hours, TimeResolution.Minutes], (r) => r <= _millis) || TimeResolution.Minutes;
      return { resolution, amount: Number(BN(_millis / resolution).toFixed(2)) };
    },

    getFillDelayText: (translations: Translations) => fillDelayText((get() as any).getFillDelayUiMillis(), translations),
    getFillDelayUiMillis: () => get().fillDelay.amount! * get().fillDelay.resolution,

    getDurationMillis: () => ((get() as any).getDurationUi().amount || 0) * (get() as any).getDurationUi().resolution,

    getMinimumDelayMinutes: () => (get().lib?.estimatedDelayBetweenChunksMillis() || 0) / 1000 / 60,
    getFillDelayWarning: () => {
      return get().lib && (get() as any).getFillDelayUiMillis() < (get() as any).getMinimumDelayMinutes() * 60 * 1000;
    },
    switchTokens: () => {
      const srcToken = get().srcToken!;
      const dstToken = get().dstToken!;

      const dstAmount: BN = (get() as any).getDstAmount();
      const dstAmountUi: string = (get() as any).getDstAmountUi();

      (get() as any).setTokens(dstToken, srcToken);
      (get() as any).setSrcAmountUi(dstAmount.isZero() ? "" : dstAmountUi);

      set({
        srcUsd: get().dstUsd,
        dstUsd: get().srcUsd,
        srcBalance: get().dstBalance,
        dstBalance: get().srcBalance,
      });
    },

    getSrcChunkAmount: () => get().lib?.srcChunkAmount((get() as any).getSrcAmount(), (get() as any).getChunks()) || BN(0),

    getDstMinAmountOut: () =>
      get().lib && get().srcToken && get().dstToken && (get() as any).getLimitPrice(false).limitPrice.gt(0)
        ? get().lib!.dstMinAmountOut(get().srcToken!, get().dstToken!, (get() as any).getSrcChunkAmount(), (get() as any).getLimitPrice(false).limitPrice, !get().isLimitOrder)
        : BN(1),

    setSrcAmountPercent: (percent: number) => {
      const srcToken = get().srcToken;
      const balance = get().srcBalance;
      const setSrcAmountUi = (get() as any).setSrcAmountUi;
      const maxAmount: BN | undefined = (get() as any).getMaxSrcInputAmount();
      if (!srcToken) {
        return;
      }

      //max amount will be greater than zero only if the src token is native token
      const _maxAmount = maxAmount && percent === 1 && maxAmount.gt(0) ? maxAmount : undefined;

      setSrcAmountUi(amountUi(srcToken, _maxAmount || balance.times(percent)));
    },

    shouldWrap: () =>
      get().lib &&
      get().srcToken &&
      get().dstToken &&
      [TokensValidation.wrapAndOrder, TokensValidation.wrapOnly].includes(get().lib!.validateTokens(get().srcToken!, get().dstToken!)),

    shouldUnwrap: () => get().lib && get().srcToken && get().dstToken && get().lib!.validateTokens(get().srcToken!, get().dstToken!) === TokensValidation.unwrapOnly,

    isInvalidTokens: () => get().lib && get().srcToken && get().dstToken && get().lib!.validateTokens(get().srcToken!, get().dstToken!) === TokensValidation.invalid,
    setShowConfirmation: (showConfirmation: boolean) => set({ showConfirmation, confirmationClickTimestamp: moment(), disclaimerAccepted: false }),
    getDeadline: () =>
      moment(get().confirmationClickTimestamp)
        .add(((get() as any).getDurationUi().amount || 0) * (get() as any).getDurationUi().resolution)
        .add(1, "minute")
        .valueOf(),
    getDeadlineUi: () => moment((get() as any).getDeadline()).format("L HH:mm"),
    getDstAmountUi: () => amountUi(get().dstToken, (get() as any).getDstAmount()),
    getSrcAmountUsdUi: () => amountUi(get().srcToken, (get() as any).getSrcAmount().times(get().srcUsd)),
    getDstAmountUsdUi: () => amountUi(get().dstToken, (get() as any).getDstAmount().times(get().dstUsd)),
    getSrcBalanceUi: () => amountUi(get().srcToken, get().srcBalance),
    getDstBalanceUi: () => amountUi(get().dstToken, get().dstBalance),
    getSrcChunkAmountUi: () => amountUi(get().srcToken, (get() as any).getSrcChunkAmount()),
    getDstMinAmountOutUi: () => ((get() as any).getDstMinAmountOut().eq(1) ? "" : amountUi(get().dstToken, (get() as any).getDstMinAmountOut())),
    getSrcChunkAmountUsdUi: () => amountUi(get().srcToken, (get() as any).getSrcChunkAmount().times(get().srcUsd)),
    getChunksBiggerThanOne: () => !!get().srcToken && !!get().srcAmountUi && (get() as any).getMaxPossibleChunks() > 1,
  }))
);

export const parseOrderUi = (lib: TWAPLib, tokensWithUsd: (TokenData & { usd: BN })[], o: Order) => {
  const srcToken = tokensWithUsd.find((t) => eqIgnoreCase(o.ask.srcToken, t.address));
  const dstToken = tokensWithUsd.find((t) => eqIgnoreCase(o.ask.dstToken, t.address));
  const srcUsd = srcToken?.usd;
  const dstUsd = dstToken?.usd;

  if (!srcToken || !dstToken || !srcUsd || !dstUsd) throw new Error(`parseOrderUi srcToken:${srcToken} dstToken:${dstToken}`);

  const isMarketOrder = lib.isMarketOrder(o);
  const dstPriceFor1Src = lib.dstPriceFor1Src(srcToken, dstToken, srcUsd, dstUsd, o.ask.srcBidAmount, o.ask.dstMinAmount);
  const dstAmount = lib.dstAmount(srcToken, dstToken, o.ask.srcAmount, srcUsd, dstUsd, dstPriceFor1Src, isMarketOrder);
  const srcRemainingAmount = o.ask.srcAmount.minus(o.srcFilledAmount);
  const progress = lib.orderProgress(o) < 0.99 ? lib.orderProgress(o) * 100 : 100;
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
      fillDelay: o.ask.fillDelay * 1000 + lib.estimatedDelayBetweenChunksMillis(),
      createdAtUi: moment(o.time * 1000).format("L HH:mm"),
      deadlineUi: moment(o.ask.deadline * 1000).format("L HH:mm"),
      prefix: isMarketOrder ? "~" : "≥",
      totalChunks: o.ask.srcAmount.div(o.ask.srcBidAmount).integerValue(BN.ROUND_CEIL).toNumber(),
    },
  };
};

const amountBN = (token: TokenData | undefined, amount: string) => parsebn(amount).times(BN(10).pow(token?.decimals || 0));
export const amountUi = (token: TokenData | undefined, amount: BN) => {
  if (!token) return "";
  const percision = BN(10).pow(token?.decimals || 0);
  return amount.times(percision).idiv(percision).div(percision).toFormat();
};

export const fillDelayText = (value: number, translations: Translations) => {
  if (!value) {
    return "0";
  }
  const time = moment.duration(value);
  const days = time.days();
  const hours = time.hours();
  const minutes = time.minutes();
  const seconds = time.seconds();

  const arr: string[] = [];

  if (days) {
    arr.push(`${days} ${translations.days} `);
  }
  if (hours) {
    arr.push(`${hours} ${translations.hours} `);
  }
  if (minutes) {
    arr.push(`${minutes} ${translations.minutes}`);
  }
  if (seconds) {
    arr.push(`${seconds} ${translations.seconds}`);
  }
  return arr.join(" ");
};

export const handleFillDelayText = (text: string, minutes: number) => {
  return text.replace("{{minutes}}", minutes.toString());
};
