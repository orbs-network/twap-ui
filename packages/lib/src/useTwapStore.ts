import { create } from "zustand";
import { State } from "./types";
import { useCallback } from "react";

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
        acceptedDstAmount: get().state.acceptedDstAmount,
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
