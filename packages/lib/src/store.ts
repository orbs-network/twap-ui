import BN from "bignumber.js";
import { TokenData, TokensValidation, TWAPLib } from "@orbs-network/twap";
import moment from "moment";
import { create } from "zustand";
import { combine } from "zustand/middleware";
import _ from "lodash";
import { maxUint256 } from "@defi.org/web3-candies";
import { State, StoreOverride, Translations } from "./types";
import { QUERY_PARAMS } from "./consts";
import { amountBN, amountUi, fillDelayText, getQueryParam, setQueryParam } from "./utils";

export enum TimeResolution {
  Minutes = 60 * 1000,
  Hours = Minutes * 60,
  Days = Hours * 24,
}
export type Duration = { resolution: TimeResolution; amount?: number };

/**
 * TWAP Store
 */

const defaultCustomFillDelay = { resolution: TimeResolution.Minutes, amount: 2 };
const defaultCustomDuration = { resolution: TimeResolution.Minutes, amount: undefined };

const getInitialState = (queryParamsEnabled?: boolean): State => {
  const tradeIntervalQueryParam = getQueryParam(QUERY_PARAMS.TRADE_INTERVAL);
  const maxDurationQueryParam = getQueryParam(QUERY_PARAMS.MAX_DURATION);
  const srcAmountUi = getQueryParam(QUERY_PARAMS.INPUT_AMOUNT);
  const chunks = getQueryParam(QUERY_PARAMS.TRADES_AMOUNT);
  return {
    showSuccessModal: true,
    showLoadingModal: false,
    lib: undefined,
    wrongNetwork: undefined,
    srcAmountUi: !queryParamsEnabled ? "" : srcAmountUi || "",

    loading: false,
    isLimitOrder: true,
    confirmationClickTimestamp: moment(),
    showConfirmation: false,
    disclaimerAccepted: true,

    chunks: !queryParamsEnabled ? 0 : chunks ? Number(chunks) : 0,
    customDuration: !queryParamsEnabled ? defaultCustomDuration : { resolution: TimeResolution.Minutes, amount: maxDurationQueryParam ? Number(maxDurationQueryParam) : undefined },
    customFillDelay: !queryParamsEnabled ? defaultCustomFillDelay : { resolution: TimeResolution.Minutes, amount: tradeIntervalQueryParam ? Number(tradeIntervalQueryParam) : 2 },

    orderCreatedTimestamp: undefined,
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
    },
    setLimitOrder: (isLimitOrder?: boolean) => {
      set({ isLimitOrder });
      if (!isLimitOrder) {
        setQueryParam(QUERY_PARAMS.LIMIT_PRICE, undefined);
      }
    },
    setStoreOverrideValues: (storeOverride: StoreOverride, enableQueryParams?: boolean) => {
      set({
        ...getInitialState(enableQueryParams),
        ...storeOverride,
        enableQueryParams,
        lib: get().lib,
        wrongNetwork: get().wrongNetwork,
      });
    },
    updateState: (values: Partial<State>) => set({ ...values }),
    setOrderCreatedTimestamp: (orderCreatedTimestamp: number) => set({ orderCreatedTimestamp }),
    reset: (storeOverride: StoreOverride) => {
      set({
        ...getInitialState(),
        lib: get().lib,
        ...storeOverride,
      });
    },
    setLib: (lib?: TWAPLib) => set({ lib }),
    setLoading: (loading: boolean) => set({ loading }),
    setDisclaimerAccepted: (disclaimerAccepted: boolean) => set({ disclaimerAccepted }),
    setWrongNetwork: (wrongNetwork?: boolean) => set({ wrongNetwork }),
    setDuration: (customDuration: Duration) => {
      setQueryParam(QUERY_PARAMS.MAX_DURATION, !customDuration.amount ? undefined : customDuration.amount.toString());
      set({ customDuration });
    },
    setFillDelay: (fillDelay: Duration) => {
      setQueryParam(QUERY_PARAMS.TRADE_INTERVAL, !fillDelay.amount ? undefined : fillDelay.amount?.toString());
      set({ customFillDelay: fillDelay });
    },
    getFillDelayText: (translations: Translations) => fillDelayText((get() as any).getFillDelayUiMillis(), translations),
    getFillDelayUiMillis: () => get().customFillDelay.amount! * get().customFillDelay.resolution,
    getMinimumDelayMinutes: () => (get().lib?.estimatedDelayBetweenChunksMillis() || 0) / 1000 / 60,
    getFillDelayWarning: () => {
      return get().lib && (get() as any).getFillDelayUiMillis() < (get() as any).getMinimumDelayMinutes() * 60 * 1000;
    },
    // shouldWrap: () =>
    //   get().lib &&
    //   get().srcToken &&
    //   get().dstToken &&
    //   [TokensValidation.wrapAndOrder, TokensValidation.wrapOnly].includes(get().lib!.validateTokens(get().srcToken!, get().dstToken!)),

    // shouldUnwrap: () => get().lib && get().srcToken && get().dstToken && get().lib!.validateTokens(get().srcToken!, get().dstToken!) === TokensValidation.unwrapOnly,
    // isInvalidTokens: () => get().lib && get().srcToken && get().dstToken && get().lib!.validateTokens(get().srcToken!, get().dstToken!) === TokensValidation.invalid,
    setShowConfirmation: (showConfirmation: boolean) => set({ showConfirmation, confirmationClickTimestamp: moment() }),
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

interface LimitPriceStore {
  limitPrice?: string;
  onLimitInput: (limitPrice?: string) => void;
  onReset: () => void;
  gainPercent?: number;
  setGainPercent: (value?: number) => void;
}

export const useLimitPriceStore = create<LimitPriceStore>((set, get) => ({
  isCustom: false,
  inverted: false,
  gainPercent: undefined,
  setGainPercent: (gainPercent) => {
    setQueryParam(QUERY_PARAMS.LIMIT_PRICE_GAIN, gainPercent ? gainPercent?.toString() : undefined);
    set({ gainPercent });
  },
  limitPrice: undefined,
  onLimitInput: (limitPrice) => {
    setQueryParam(QUERY_PARAMS.LIMIT_PRICE, BN(limitPrice || 0).isZero() ? undefined : limitPrice);

    set({
      limitPrice,
    });
  },
  onReset: () => {
    setQueryParam(QUERY_PARAMS.LIMIT_PRICE, undefined);
    setQueryParam(QUERY_PARAMS.LIMIT_PRICE_GAIN, undefined);
    set({
      limitPrice: undefined,
      gainPercent: undefined,
    });
  },
}));
