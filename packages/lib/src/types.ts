import { BigNumber } from "@defi.org/web3-candies";
import { TimeFormat } from "./store/TimeFormat";
import Web3 from "web3";
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

export interface Web3State {
  web3?: Web3;
  setWeb3: (web3?: Web3) => void;
  account?: string;
  setAccount: (value?: string) => void;
  chain?: number;
  setChain: (chain?: number) => void;
}

export interface PriceState extends BaseState {
  showLimit: Boolean;
  toggleLimit: () => void;
  price?: BigNumber;
  setPrice: (value?: BigNumber) => void;
}
