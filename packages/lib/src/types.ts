import { BigNumber } from "@defi.org/web3-candies";

interface BaseState {
  reset: () => void;
}

export interface TokenState extends BaseState {
  address?: string;
  amount?: BigNumber;
  setAddress: (value?: string) => void;
  setAmount: (value?: BigNumber) => void;
  uiAmount?: string;
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

export enum TimeFormat {
  Minutes,
  Hours,
  Days,
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
  price?: BigNumber;
  setPrice: (value?: BigNumber) => void;
  showDerived: boolean;
  setShowDerived: (value: boolean) => void;
}
