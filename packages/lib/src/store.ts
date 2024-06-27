import BN from "bignumber.js";
import moment from "moment";
import { create } from "zustand";
import { combine } from "zustand/middleware";
import _ from "lodash";
import { maxUint256 } from "@defi.org/web3-candies";
import { ConfirmationDetails, State, StoreOverride, Translations } from "./types";
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

export const defaultCustomFillDelay = { resolution: TimeResolution.Minutes, amount: MIN_TRADE_INTERVAL_FORMATTED };

const getInitialState = (queryParamsEnabled?: boolean): State => {
  const tradeIntervalQueryParam = getQueryParam(QUERY_PARAMS.TRADE_INTERVAL);
  const srcAmountUi = getQueryParam(QUERY_PARAMS.INPUT_AMOUNT);
  const chunks = getQueryParam(QUERY_PARAMS.TRADES_AMOUNT);
  return {
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
    onModalCloseAfterTx: () => {
      set({ swapSteps: undefined, swapState: undefined, swapStep: undefined });
    },
    setConfirmationDetails: (confirmationDetails: ConfirmationDetails) => {
      if (get().confirmationDetails) {
        set({ confirmationDetails: { ...get().confirmationDetails, ...confirmationDetails } });
      } else {
        set({ confirmationDetails });
      }
    },
    resetAfterSwap: () =>
      set({
        srcAmountUi: "",
        limitPricePercent: undefined,
        customLimitPrice: undefined,
        isCustomLimitPrice: false,
        isInvertedLimitPrice: false,
        customChunks: undefined,
        customFillDelay: defaultCustomFillDelay,
        isMarketOrder: false,
      }),
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
        limitPricePercent: undefined,
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
        limitPricePercent: undefined,
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
