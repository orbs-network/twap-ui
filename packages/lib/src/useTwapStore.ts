import { create } from "zustand";
import { CancelOrderState, State } from "./types";
import { useMemo } from "react";

interface TwapStore {
  resetState: () => void;
  updateState: (value: Partial<State>) => void;
  updateCancelOrderState: (orderId: number, value: Partial<CancelOrderState>) => void;
  state: State;
}

const initialState = {
  disclaimerAccepted: true,
  currentTime: Date.now(),
  cancelOrderState: {},
} as State;

export const useTwapStore = create<TwapStore>((set, get) => ({
  state: initialState,
  updateState: (value: Partial<State>) => set((state) => ({ state: { ...state.state, ...value } })),
  updateCancelOrderState: (orderId, value) =>
    set((store) => ({
      state: {
        ...store.state,
        cancelOrderState: {
          ...store.state.cancelOrderState,
          [orderId]: {
            ...store.state.cancelOrderState?.[orderId],
            ...value,
          },
        },
      },
    })),
  resetState: () => {
    set({
      state: {
        ...initialState,
        currentTime: Date.now(),
        acceptedDstAmount: get().state.acceptedDstAmount,
        isMarketOrder: get().state.isMarketOrder,
        cancelOrderState: get().state.cancelOrderState,
      },
    });
  },
}));

export const useCancelOrderState = (orderId?: number) => {
  const cancelOrderState = useTwapStore((s) => s.state.cancelOrderState);
  const updateCancelOrderState = useTwapStore((s) => s.updateCancelOrderState);
  const state = useMemo(() => (orderId ? cancelOrderState?.[orderId] : undefined), [cancelOrderState, orderId]);
  return {
    state,
    setState: (state: Partial<CancelOrderState>) => {
      if (orderId) {
        updateCancelOrderState(orderId, state);
      }
    },
  };
};
