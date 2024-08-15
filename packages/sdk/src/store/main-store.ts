import moment from "moment";
import { create } from "zustand";
import { MIN_TRADE_INTERVAL_FORMATTED } from "../consts";
import { State, TimeResolution } from "../types";

interface MainState extends State {
  updateState: (state: Partial<State>) => void;
}

export const getInitialState = (props?: { state?: Partial<State> }): State => {
  return {
    srcAmountUi: "",
    confirmationClickTimestamp: moment(),
    showConfirmation: false,
    disclaimerAccepted: true,
    customChunks: undefined,
    customFillDelay: { resolution: TimeResolution.Minutes, amount: MIN_TRADE_INTERVAL_FORMATTED },
    isMarketOrder: false,
    selectedOrdersTab: 0,
    ...props?.state,
  };
};

export const useMainStore = create<MainState>((set) => ({
  ...getInitialState(),
  updateState: (state) => set(state),
}));
