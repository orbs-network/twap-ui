import { BigNumber } from "@defi.org/web3-candies";
import { TimeFormat } from "./store/TimeFormat";

interface BaseState {
  reset: () => void;
}

export interface SrcTokenState extends BaseState {
  address?: string;
  amount?: BigNumber;
  setAddress: (value?: string) => void;
  setAmount: (value?: BigNumber) => void;
}

export interface DstTokenState extends BaseState {
  address?: string;
  setAddress: (value?: string) => void;
}

export interface MaxDurationState extends BaseState {
  millis: number;
  timeFormat: TimeFormat;
  setMillis: (value: number) => void;
  setTimeFormat: (value: TimeFormat) => void;
}

export interface TradeIntervalState extends MaxDurationState {
  customInterval: boolean;
  setCustomInterval: (value: boolean) => void;
}

export interface TradeSizeState extends BaseState {
  tradeSize?: BigNumber;
  setTradeSize: (tradeSize?: BigNumber) => void;
}

export interface PriceState extends BaseState {
  inverted: boolean;
  invertPrice: () => void;
  showPrice: Boolean;
  togglePrice: (value: boolean) => void;
  price?: number;
  setPrice: (value?: number) => void;
  showDerived: boolean;
  setShowDerived: (value: boolean) => void;
}
