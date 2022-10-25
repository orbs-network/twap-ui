import { BigNumber, Token } from "@defi.org/web3-candies";
import { TimeFormat } from "./store/TimeFormat";
import Web3 from "web3";
interface BaseState {
  reset: () => void;
}

export interface GlobalState extends BaseState {
  showConfirmation: boolean;
  setShowConfirmation: (value: boolean) => void;
  disclaimerAccepted: boolean;
  setDisclaimerAccepted: (value: boolean) => void;
}

export interface SrcTokenState extends BaseState {
  srcTokenInfo?: TokenInfo;
  srcToken?: Token;
  srcTokenAmount?: BigNumber;
  setSrcToken: (value?: TokenInfo, keepAmount?: boolean) => void;
  setSrcTokenAmount: (value?: BigNumber) => void;
}

export interface DstTokenState extends BaseState {
  dstTokenInfo?: TokenInfo;
  dstToken?: Token;
  setDstToken: (value?: TokenInfo) => void;
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
  integrationChain?: number;
  setIntegrationChain: (value?: number) => void;
  integrationKey?: string;
  setIntegrationKey: (value?: string) => void;
}

export interface PriceState extends BaseState {
  isLimitOrder: boolean;
  toggleLimit: (limitPrice?: BigNumber) => void;
  limitPrice?: BigNumber;
  setLimitPrice: (value?: BigNumber) => void;
  hideLimit: () => void;
}

export interface TokenInfo {
  symbol: string;
  address: string;
  decimals: number;
  logoUrl?: string;
  isNative?: boolean;
}
