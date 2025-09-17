import { create } from "zustand";
import { State, Swap } from "./types";
import { useCallback } from "react";

interface TwapStore {
  resetState: () => void;
  updateState: (value: Partial<State>) => void;
  updateSwap: (value: Partial<Swap>) => void;
  state: State;
}

const initialState = {
  disclaimerAccepted: true,
  currentTime: Date.now(),
  swap: {} as Swap,
} as State;

export const useTwapStore = create<TwapStore>((set, get) => ({
  state: initialState,
  updateState: (value: Partial<State>) => set((state) => ({ state: { ...state.state, ...value } })),
  updateSwap: (data: Partial<Swap>) => set((state) => ({ state: { ...state.state, swap: { ...state.state.swap, ...data } } })),

  resetState: () => {
    set({
      state: {
        ...initialState,
        currentTime: Date.now(),
        swap: get().state.swap,
        isMarketOrder: get().state.isMarketOrder,
      },
    });
  },
}));

export const useResetState = (partialState?: Partial<State>) => {
  const updateState = useTwapStore((s) => s.updateState);
  const state = useTwapStore((s) => s.state);
  return useCallback(() => {
    updateState({
      ...(partialState || {}),
      triggerPricePercent: state.triggerPricePercent,
      limitPricePercent: state.limitPricePercent,
    });
  }, [updateState, partialState, state]);
};
