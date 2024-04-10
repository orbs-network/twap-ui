import BN from "bignumber.js";
import { Order, OrderInputValidation, Status, TokenData, TokensValidation, TWAPLib } from "@orbs-network/twap";
import moment from "moment";
import { create } from "zustand";
import { combine } from "zustand/middleware";
import _, { get } from "lodash";
import { eqIgnoreCase, parsebn, isNativeAddress } from "@defi.org/web3-candies";
import { State, StoreOverride, Translations } from "./types";
import { MIN_NATIVE_BALANCE, QUERY_PARAMS } from "./consts";
import { amountBN, amountUi, fillDelayText, getQueryParam, setQueryParam } from "./utils";

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

const defaultCustomFillDelay = { resolution: TimeResolution.Minutes, amount: 2 };
const defaultCustomDuration = { resolution: TimeResolution.Minutes, amount: undefined };

const getInitialState = (queryParamsEnabled?: boolean): State => {
  const limitPriceQueryParam = getQueryParam(QUERY_PARAMS.LIMIT_PRICE);
  const tradeIntervalQueryParam = getQueryParam(QUERY_PARAMS.TRADE_INTERVAL);
  const maxDurationQueryParam = getQueryParam(QUERY_PARAMS.MAX_DURATION);
  const srcAmountUi = getQueryParam(QUERY_PARAMS.INPUT_AMOUNT);
  const chunks = getQueryParam(QUERY_PARAMS.TRADES_AMOUNT);
  return {
    showSuccessModal: true,
    showLoadingModal: false,
    lib: undefined,
    srcToken: undefined,
    dstToken: undefined,
    wrongNetwork: undefined,
    srcAmountUi: !queryParamsEnabled ? "" : srcAmountUi || "",

    limitPriceUi: !queryParamsEnabled ? { priceUi: "", inverted: false, custom: false } : { priceUi: limitPriceQueryParam || "", inverted: false, custom: !!limitPriceQueryParam },
    srcUsd: BN(0),
    dstUsd: BN(0),
    srcBalance: BN(0),
    dstBalance: BN(0),

    loading: false,
    isLimitOrder: true,
    confirmationClickTimestamp: moment(),
    showConfirmation: false,
    disclaimerAccepted: true,

    chunks: !queryParamsEnabled ? 0 : chunks ? Number(chunks) : 0,
    customDuration: !queryParamsEnabled ? defaultCustomDuration : { resolution: TimeResolution.Minutes, amount: maxDurationQueryParam ? Number(maxDurationQueryParam) : undefined },
    customFillDelay: !queryParamsEnabled ? defaultCustomFillDelay : { resolution: TimeResolution.Minutes, amount: tradeIntervalQueryParam ? Number(tradeIntervalQueryParam) : 2 },

    orderCreatedTimestamp: undefined,
    dstAmount: undefined,
    dstAmountLoading: !queryParamsEnabled ? false : limitPriceQueryParam ? false : !!srcAmountUi,
    dstAmountFromDex: undefined,
    txHash: undefined,

    enableQueryParams: false,
    waitingForOrdersUpdate: false,
  };
};
const initialState = getInitialState();

export const useTwapStore = create(
  combine(initialState, (set, get) => ({
    setTxHash: (txHash?: string) => set({ txHash }),
    setShowSuccessModal: (showSuccessModal: boolean) => set({ showSuccessModal }),
    setShowLodingModal: (showLoadingModal: boolean) => set({ showLoadingModal }),
    setLimitOrderPriceUi: () => {
      setQueryParam(QUERY_PARAMS.LIMIT_PRICE, undefined);
      let price = (get() as any).getMarketPrice(false).marketPrice;
      price = BN(price).times(0.95).toString();
      set({ limitPriceUi: { priceUi: price, inverted: false, custom: false } });
    },
    setLimitOrder: (isLimitOrder?: boolean) => {
      set({ isLimitOrder });
      if (!isLimitOrder) {
        setQueryParam(QUERY_PARAMS.LIMIT_PRICE, undefined);
        set({ dstAmount: get().dstAmountFromDex, limitPriceUi: { inverted: false, priceUi: "", custom: false } });
      }
    },
    setStoreOverrideValues: (storeOverride: StoreOverride, enableQueryParams?: boolean) => {
      set({
        ...getInitialState(enableQueryParams),
        ...storeOverride,
        enableQueryParams,
        lib: get().lib,
        srcToken: get().srcToken,
        dstToken: get().dstToken,
        srcUsd: get().srcUsd,
        dstUsd: get().dstUsd,
        srcBalance: get().srcBalance,
        dstBalance: get().dstBalance,
        wrongNetwork: get().wrongNetwork,
        dstAmount: get().dstAmount,
        dstAmountFromDex: get().dstAmountFromDex,
      });
    },
    setOutAmount: (dstAmount?: string, dstAmountLoading?: boolean, custom?: boolean) => {
      set({ dstAmountFromDex: dstAmount });
      if (!custom && !get().limitPriceUi.custom) {
        set({ dstAmount, dstAmountLoading });
        (get() as any).setLimitOrderPriceUi();
      }
    },
    updateState: (values: Partial<State>) => set({ ...values }),
    setOrderCreatedTimestamp: (orderCreatedTimestamp: number) => set({ orderCreatedTimestamp }),
    reset: (storeOverride: StoreOverride) => {
      set({
        ...getInitialState(),
        lib: get().lib,
        ...storeOverride,
        srcUsd: get().srcUsd,
        dstUsd: get().dstUsd,
        srcBalance: get().srcBalance,
        dstBalance: get().dstBalance,
        srcToken: get().srcToken,
        dstToken: get().dstToken,
        limitPriceUi: get().limitPriceUi,
      });
    },
    setLib: (lib?: TWAPLib) => set({ lib }),
    setLoading: (loading: boolean) => set({ loading }),
    setSrcToken: (srcToken?: TokenData) => {
      set({ srcToken });
    },
    setDstToken: (dstToken?: TokenData) => {
      const limitPriceQueryParam = getQueryParam(QUERY_PARAMS.LIMIT_PRICE);

      set({ dstToken, limitPriceUi: { ...get().limitPriceUi, custom: !!limitPriceQueryParam } });
    },
    setSrcAmountUi: (srcAmountUi: string) => {
      setQueryParam(QUERY_PARAMS.INPUT_AMOUNT, !srcAmountUi ? undefined : srcAmountUi);
      if (!srcAmountUi) {
        set({ srcAmountUi, dstAmount: undefined, limitPriceUi: { ...get().limitPriceUi, priceUi: "", custom: false } });
        return;
      }
      if (get().limitPriceUi.custom && get().limitPriceUi.priceUi) {
        set({
          srcAmountUi,
          dstAmount: amountBN(get().srcToken, srcAmountUi)
            .times(get().limitPriceUi.priceUi || "0")
            .toString(),
        });
      } else {
        set({ srcAmountUi, dstAmountLoading: true, limitPriceUi: { ...get().limitPriceUi, priceUi: "", custom: false } });
      }

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
    setLimitPriceUi: (limitPriceUi: { priceUi: string; inverted: boolean }) => {
      set({
        limitPriceUi: { ...limitPriceUi, custom: true },
        dstAmount: BN((get() as any).getSrcAmount() || "0")
          .times(limitPriceUi.priceUi || "0")
          .toString(),
      });
      setQueryParam(QUERY_PARAMS.LIMIT_PRICE, limitPriceUi.priceUi);
    },
    setChunks: (chunks: number) => {
      const _chunks = Math.min(chunks, (get() as any).getMaxPossibleChunks());
      setQueryParam(QUERY_PARAMS.TRADES_AMOUNT, _chunks > 0 ? _chunks.toString() : undefined);
      set({ chunks: _chunks });
    },
    setDuration: (customDuration: Duration) => {
      setQueryParam(QUERY_PARAMS.MAX_DURATION, !customDuration.amount ? undefined : customDuration.amount.toString());
      set({ customDuration });
    },
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
      (get() as any).setSrcToken(srcToken);
      (get() as any).setDstToken(dstToken);
    },
    setFillDelay: (fillDelay: Duration) => {
      setQueryParam(QUERY_PARAMS.TRADE_INTERVAL, !fillDelay.amount ? undefined : fillDelay.amount?.toString());
      set({ customFillDelay: fillDelay });
    },

    getDurationUi: () => {
      if (!get().lib) return { resolution: TimeResolution.Minutes, amount: 0 };

      if (get().customDuration.amount !== undefined) return get().customDuration;

      const _millis = (get() as any).getFillDelayUiMillis() * 2 * (get() as any).getChunks();

      const resolution = _.find([TimeResolution.Days, TimeResolution.Hours, TimeResolution.Minutes], (r) => r <= _millis) || TimeResolution.Minutes;
      return { resolution, amount: Number(BN(_millis / resolution).toFixed(2)) };
    },

    getFillDelayText: (translations: Translations) => fillDelayText((get() as any).getFillDelayUiMillis(), translations),
    getFillDelayUiMillis: () => get().customFillDelay.amount! * get().customFillDelay.resolution,

    getDurationMillis: () => ((get() as any).getDurationUi().amount || 0) * (get() as any).getDurationUi().resolution,

    getMinimumDelayMinutes: () => (get().lib?.estimatedDelayBetweenChunksMillis() || 0) / 1000 / 60,
    getFillDelayWarning: () => {
      return get().lib && (get() as any).getFillDelayUiMillis() < (get() as any).getMinimumDelayMinutes() * 60 * 1000;
    },
    switchTokens: () => {
      const srcToken = get().srcToken!;
      const dstToken = get().dstToken!;

      const dstAmount = get().dstAmount;
      const dstAmountUi: string = (get() as any).getDstAmountUi();

      (get() as any).setTokens(dstToken, srcToken);
      (get() as any).setSrcAmountUi(BN(dstAmount || "0").isZero() ? "" : dstAmountUi);

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
    setShowConfirmation: (showConfirmation: boolean) => set({ showConfirmation, confirmationClickTimestamp: moment() }),
    getDeadline: () =>
      moment(get().confirmationClickTimestamp)
        .add(((get() as any).getDurationUi().amount || 0) * (get() as any).getDurationUi().resolution)
        .add(1, "minute")
        .valueOf(),
    getDeadlineUi: () => moment((get() as any).getDeadline()).format("ll HH:mm"),
    getDstAmountUi: () => amountUi(get().dstToken, BN(get().dstAmount || "0")),
    getSrcAmountUsdUi: () => amountUi(get().srcToken, (get() as any).getSrcAmount().times(get().srcUsd)),
    getDstAmountUsdUi: () => amountUi(get().dstToken, BN(get().dstAmount || "0").times(get().dstUsd)),
    getSrcBalanceUi: () => amountUi(get().srcToken, get().srcBalance),
    getDstBalanceUi: () => amountUi(get().dstToken, get().dstBalance),
    getSrcChunkAmountUi: () => amountUi(get().srcToken, (get() as any).getSrcChunkAmount()),
    getDstMinAmountOutUi: () => ((get() as any).getDstMinAmountOut().eq(1) ? "" : amountUi(get().dstToken, (get() as any).getDstMinAmountOut())),
    getSrcChunkAmountUsdUi: () => amountUi(get().srcToken, (get() as any).getSrcChunkAmount().times(get().srcUsd)),
    getChunksBiggerThanOne: () => !!get().srcToken && !!get().srcAmountUi && (get() as any).getMaxPossibleChunks() > 1,
  }))
);

interface OrdersStore {
  tab: number;
  setTab: (value: number) => void;
}

export const useOrdersStore = create<OrdersStore>((set) => ({
  tab: 0,
  setTab: (value: number) => set({ tab: value }),
}));

export enum WizardAction {
  CREATE_ORDER = "CREATE_ORDER",
  CANCEL_ORDER = "CANCEL_ORDER",
  WRAP = "WRAP",
  APPROVE = "APPROVE",
  UNWRAP = "UNWRAP",
}

export enum WizardActionStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

interface WizardStore {
  error?: string;
  action?: WizardAction;
  status?: WizardActionStatus;
  open: boolean;
  timeout?: any;
  setAction: (value?: WizardAction) => void;
  setStatus: (value?: WizardActionStatus, error?: string) => void;
  setOpen: (value: boolean) => void;
}

export const useWizardStore = create<WizardStore>((set, get) => ({
  action: undefined,
  status: undefined,
  error: undefined,
  open: false,
  timeout: undefined,
  setAction: (action) => {
    set({ action, open: !!action });
    clearTimeout(get().timeout);
  },
  setStatus: (status, error) => {
    clearTimeout(get().timeout);
    set({ status, error, open: !!status });
    if (status === WizardActionStatus.SUCCESS) {
      set({ timeout: setTimeout(() => set({ open: false }), 5000) });
    }
  },
  setOpen: (value) => {
    set({ open: value });
  },
}));
