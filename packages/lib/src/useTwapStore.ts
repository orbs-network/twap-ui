import { create } from "zustand";
import { State } from "./types";

interface TwapStore {
  resetState: () => void;
  updateState: (value: Partial<State>) => void;
  state: State;
}

const initialState = {
  disclaimerAccepted: true,
  currentTime: Date.now(),
} as State;

export const useTwapStore = create<TwapStore>((set, get) => ({
  state: initialState,
  updateState: (value: Partial<State>) => set((state) => ({ state: { ...state.state, ...value } })),
  resetState: () => {
    set({
      state: {
        ...initialState,
        currentTime: Date.now(),
        trade: get().state.trade,
        swapStatus: get().state.swapStatus,
        isMarketOrder: get().state.isMarketOrder,
        typedDuration: get().state.typedDuration,
      },
    });
  },
}));
