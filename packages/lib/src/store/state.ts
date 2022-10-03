import { erc20s } from "@defi.org/web3-candies";
import create from "zustand";
import { MaxDurationState, PriceState, TimeFormat, TokenState, TradeIntervalState, TradeSizeState } from "../types";

export const useSrcTokenState = create<TokenState>((set) => ({
  address: erc20s.eth.WETH().address,
  amount: undefined,
  setAddress: (address) => set({ address }),
  setAmount: (amount) => set({ amount }),
}));


export const useDstTokenState = create<TokenState>((set, get) => ({
  address: erc20s.eth.USDC().address,
  amount: undefined,
  setAddress: (address) => set({ address }),
  setAmount: (amount) => set({ amount }),
}));


export const useMaxDurationState = create<MaxDurationState>((set, get) => ({
  millis: 0,
  timeFormat: TimeFormat.Minutes,
  setMillis: (millis) => set({ millis }),
  setTimeFormat: (timeFormat) => set({ timeFormat }),
}));

export const useTradeIntervalState = create<TradeIntervalState>((set, get) => ({
  millis: 0,
  timeFormat: TimeFormat.Minutes,
  customInterval: false,
  setMillis: (millis) => set({ millis }),
  setTimeFormat: (timeFormat) => set({ timeFormat }),
  setCustomInterval: (customInterval) => set({ customInterval }),
}));


export const usePriceState = create<PriceState>((set) => ({
  inverted: false,
  invertPrice: () => set((state) => ({ inverted: !state.inverted })),
  showPrice: false,
  togglePrice: (showPrice) => set({ showPrice }),
  price: undefined,
  setPrice: (price) => set({ price }),
  showDerived: true,
  setShowDerived: (showDerived) => set({ showDerived }),
}));

export const useTradeSizeState = create<TradeSizeState>((set, get) => ({
  tradeSize: undefined,
  setTradeSize: (tradeSize) => set({ tradeSize }),
}));