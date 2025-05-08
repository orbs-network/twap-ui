import { create } from "zustand";
import { State } from "./types";

interface TwapStore extends State {
  resetStore: () => void;
  updateStore: (value: Partial<State>) => void;
}

const initialState = {
  disclaimerAccepted: true,
  currentTime: Date.now(),
} as State;

export const useTwapStore = create<TwapStore>((set, get) => ({
  ...initialState,
  updateStore: (value: Partial<State>) => set((state) => ({ ...state, ...value })),
  resetStore: () =>
    set({
      ...initialState,
      currentTime: Date.now(),
      trade: get().trade,
      swapStatus: get().swapStatus,
      isMarketOrder: get().isMarketOrder,
      typedDuration: get().typedDuration,
    }),
}));
