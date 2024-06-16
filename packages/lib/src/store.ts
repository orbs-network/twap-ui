import BN from "bignumber.js";
import { TokenData } from "@orbs-network/twap";
import moment from "moment";
import { create } from "zustand";
import { combine } from "zustand/middleware";
import _ from "lodash";
import { State, StoreOverride, SwapState } from "./types";
import { QUERY_PARAMS } from "./consts";
import { getQueryParam, setQueryParam } from "./utils";

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
    srcToken: undefined,
    dstToken: undefined,
    srcAmountUi: !queryParamsEnabled ? "" : srcAmountUi || "",
    createOrderLoading: false,
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
    srcUsd: undefined,
    dstUsd: undefined,
    swapState: undefined,
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
        srcToken: get().srcToken,
        dstToken: get().dstToken,
        srcUsd: get().srcUsd,
        dstUsd: get().dstUsd,
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
        srcUsd: get().srcUsd,
        dstUsd: get().dstUsd,
      });
    },
    setSrcToken: (srcToken?: TokenData) => {
      set({ srcToken });
    },
    setDstToken: (dstToken?: TokenData) => set({ dstToken }),
    setDisclaimerAccepted: (disclaimerAccepted: boolean) => set({ disclaimerAccepted }),
    setDuration: (customDuration: Duration) => {
      setQueryParam(QUERY_PARAMS.MAX_DURATION, !customDuration.amount ? undefined : customDuration.amount.toString());
      set({ customDuration });
    },
    setFillDelay: (fillDelay: Duration) => {
      setQueryParam(QUERY_PARAMS.TRADE_INTERVAL, !fillDelay.amount ? undefined : fillDelay.amount?.toString());
      set({ customFillDelay: fillDelay });
    },
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
  inverted: boolean;
  toggleInverted: () => void;
  onLimitInput: (limitPrice?: string) => void;
  onReset: () => void;
  isCustom: boolean;
  hide: boolean;
  setHide: (value: boolean) => void;
  priceFromQueryParams: string | undefined;
  setPriceFromQueryParams: (value?: string | null) => void;
}

export const useLimitPriceStore = create<LimitPriceStore>((set, get) => ({
  isCustom: false,
  inverted: false,
  hide: false,
  limitPrice: undefined,
  priceFromQueryParams: undefined,
  setPriceFromQueryParams: (price) => {
    if (price) {
      set({ priceFromQueryParams: price });
    }
  },

  setHide: (hide) => {
    set({ hide });
  },

  toggleInverted: () => {
    set({
      inverted: !get().inverted,
    });
    const limitPrice = get().limitPrice;
    if (limitPrice) {
      set({
        limitPrice: BN(1).div(limitPrice).toString(),
      });
    }
  },
  onLimitInput: (limitPrice) => {
    set({
      limitPrice,
      isCustom: true,
    });
    const inverted = get().inverted;
    setQueryParam(
      QUERY_PARAMS.LIMIT_PRICE,
      !limitPrice || BN(limitPrice).isZero()
        ? undefined
        : inverted
        ? BN(1)
            .div(limitPrice || "0")
            .decimalPlaces(8)
            .toString()
        : limitPrice
    );
  },
  onReset: () => {
    setQueryParam(QUERY_PARAMS.LIMIT_PRICE, undefined);
    set({
      limitPrice: undefined,
      isCustom: false,
      priceFromQueryParams: undefined,
    });
  },
}));
