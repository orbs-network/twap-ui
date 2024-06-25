import BN from "bignumber.js";
import { TokenData } from "@orbs-network/twap";
import moment from "moment";
import { create } from "zustand";
import { combine } from "zustand/middleware";
import _ from "lodash";
import { maxUint256 } from "@defi.org/web3-candies";
import { State, StoreOverride, Translations } from "./types";
import { MIN_TRADE_INTERVAL_FORMATTED, QUERY_PARAMS } from "./consts";
import { amountBN, formatDecimals, getQueryParam, setQueryParam } from "./utils";

export enum TimeResolution {
  Minutes = 60 * 1000,
  Hours = Minutes * 60,
  Weeks = 7 * 24 * Hours,
  Days = Hours * 24,
}
export type Duration = { resolution: TimeResolution; amount?: number };

const handleLimitPriceQueryParam = (value?: string, inverted?: boolean) => {
  let newValue = value;

  if (BN(newValue || 0).isZero()) {
    setQueryParam(QUERY_PARAMS.LIMIT_PRICE, undefined);
  }
  if (inverted) {
    newValue = BN(1)
      .div(value || "0")
      .toString();
  }
  setQueryParam(QUERY_PARAMS.LIMIT_PRICE, newValue);
};

const limitPriceFromQueryParams = () => {
  const price = getQueryParam(QUERY_PARAMS.LIMIT_PRICE);
  if (price && BN(price).gt(0)) {
    return formatDecimals(price);
  }
};

/**
 * TWAP Store
 */

const defaultCustomFillDelay = { resolution: TimeResolution.Minutes, amount: MIN_TRADE_INTERVAL_FORMATTED };

const getInitialState = (queryParamsEnabled?: boolean): State => {
  const tradeIntervalQueryParam = getQueryParam(QUERY_PARAMS.TRADE_INTERVAL);
  const srcAmountUi = getQueryParam(QUERY_PARAMS.INPUT_AMOUNT);
  const chunks = getQueryParam(QUERY_PARAMS.TRADES_AMOUNT);
  return {
    showSuccessModal: false,
    showLoadingModal: false,
    srcToken: undefined,
    dstToken: undefined,
    srcAmountUi: !queryParamsEnabled ? "" : srcAmountUi || "",

    confirmationClickTimestamp: moment(),
    showConfirmation: false,
    disclaimerAccepted: true,

    customChunks: !queryParamsEnabled ? undefined : chunks ? Number(chunks) : undefined,
    customFillDelay: !queryParamsEnabled
      ? defaultCustomFillDelay
      : { resolution: TimeResolution.Minutes, amount: tradeIntervalQueryParam ? Number(tradeIntervalQueryParam) : MIN_TRADE_INTERVAL_FORMATTED },

    orderCreatedTimestamp: undefined,
    enableQueryParams: false,
    waitingForOrdersUpdate: false,
    isMarketOrder: false,
    isCustomLimitPrice: !!limitPriceFromQueryParams(),
    customLimitPrice: limitPriceFromQueryParams(),
  };
};
const initialState = getInitialState();

export const useTwapStore = create(
  combine(initialState, (set, get) => ({
    setShowSuccessModal: (showSuccessModal: boolean) => set({ showSuccessModal }),
    setShowLodingModal: (showLoadingModal: boolean) => set({ showLoadingModal }),
    setLimitOrderPriceUi: () => {
      setQueryParam(QUERY_PARAMS.LIMIT_PRICE, undefined);
    },
    setStoreOverrideValues: (storeOverride: StoreOverride, enableQueryParams?: boolean) => {
      set({
        ...getInitialState(enableQueryParams),
        ...storeOverride,
        enableQueryParams,
        srcToken: get().srcToken,
        dstToken: get().dstToken,
      });
    },
    updateState: (values: Partial<State>) => set({ ...values }),
    setOrderCreatedTimestamp: (orderCreatedTimestamp: number) => set({ orderCreatedTimestamp }),
    reset: (storeOverride: StoreOverride) => {
      set({
        ...getInitialState(),
        ...storeOverride,
        srcToken: get().srcToken,
        dstToken: get().dstToken,
        waitingForOrdersUpdate: get().waitingForOrdersUpdate,
      });
    },
    setSrcToken: (srcToken?: TokenData) => {
      set({ srcToken });
    },
    setDstToken: (dstToken?: TokenData) => set({ dstToken }),
    getSrcAmount: () => BN.min(amountBN(get().srcToken, get().srcAmountUi), maxUint256).decimalPlaces(0),
    setDisclaimerAccepted: (disclaimerAccepted: boolean) => set({ disclaimerAccepted }),
    setFillDelay: (fillDelay: Duration) => {
      setQueryParam(QUERY_PARAMS.TRADE_INTERVAL, !fillDelay.amount ? undefined : fillDelay.amount?.toString());
      set({ customFillDelay: fillDelay });
    },

    setShowConfirmation: (showConfirmation: boolean) => set({ showConfirmation, confirmationClickTimestamp: moment() }),
    invertLimit: () => {
      handleLimitPriceQueryParam();
      set({
        isInvertedLimitPrice: !get().isInvertedLimitPrice,
        customLimitPrice: undefined,
        isCustomLimitPrice: false,
      });
    },
    onLimitChange: (customLimitPrice: string) => {
      handleLimitPriceQueryParam(customLimitPrice, get().isInvertedLimitPrice);
      set({
        customLimitPrice,
        isCustomLimitPrice: true,
        isMarketOrder: false,
      });
    },
    setLimitPricePercent: (limitPricePercent?: string) => {
      set({
        limitPricePercent,
      });
    },
    onResetCustomLimit: () => {
      handleLimitPriceQueryParam();
      set({
        isCustomLimitPrice: false,
        customLimitPrice: undefined,
      });
    },

    resetLimit: () => {
      handleLimitPriceQueryParam();
      set({
        isCustomLimitPrice: false,
        customLimitPrice: undefined,
        isInvertedLimitPrice: false,
        limitPricePercent: undefined,
      });
    },
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
  },
  setOpen: (value) => {
    set({ open: value });
  },
}));
