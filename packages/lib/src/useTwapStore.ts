import { create } from "zustand";
import { State, SwapState } from "./types";
import { useCallback, useMemo } from "react";

interface TwapStore {
  resetState: () => void;
  updateState: (value: Partial<State>) => void;
  state: State;
}

const initialState = {
  disclaimerAccepted: true,
  currentTime: Date.now(),
  swapIndex: 0,
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
        swap: get().state.swap,
        swapIndex: get().state.swapIndex,
      },
    });
  },
}));

export const useSwap = () => {
  const swapIndex = useTwapStore((s) => s.state.swapIndex);
  const swap = useTwapStore((s) => s.state.swap);
  const _updateState = useTwapStore((s) => s.updateState);
  const state = useMemo(() => {
    return swap?.[swapIndex];
  }, [swapIndex, swap]);
  
  

  const updateSwapState = useCallback(
    (index: number, partialState: Partial<SwapState>) => {
      
      const currentSwap = swap?.[index] || {};
      _updateState({
        swap: {
          ...(swap || {}),
          [index]: {
            ...currentSwap,
            ...partialState,
          },
        },
      });
    },
    [swap, _updateState],
  );

  console.log({state, swapIndex});


  return {
    state,
    updateSwapState,
  };
};
