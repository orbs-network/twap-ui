import { BigNumber, Token } from "@defi.org/web3-candies";
import { TimeFormat } from "./store/TimeFormat";
import Web3 from "web3";

export interface Store {
  srcToken?: Token;
  srcTokenInfo?: TokenInfo;
  srcTokenAmount?: BigNumber;
  dstTokenInfo?: TokenInfo;
  dstToken?: Token;
  maxDurationMillis: number;
  maxDurationTimeFormat: TimeFormat;
  customInterval: boolean;
  showConfirmation: boolean;
  disclaimerAccepted: boolean;
  limitPrice?: BigNumber;
  isLimitOrder: boolean;
  totalTrades: number;
  customTradeIntervalMillis: number;
  customTradeIntervalTimeFormat: TimeFormat;

  //actions
  onMaxDurationChange: (timeFormat: TimeFormat, millis: number) => void;
  setSrcToken: (value?: TokenInfo, amount?: BigNumber) => void;
  setSrcTokenAmount: (value?: BigNumber) => void;
  onSrcTokenChange: (value: string) => void;
  setDstToken: (value?: TokenInfo) => void;
  setCustomInterval: (value: boolean) => void;
  onTradeIntervalChange: (timeFormat: TimeFormat, millis: number) => void;
  onTradeSizeChange: (totalTrades: number, token?: Token, amount?: BigNumber) => void;
  toggleLimit: (limitPrice?: BigNumber) => void;
  setLimitPrice: (value?: BigNumber) => void;
  hideLimit: () => void;
  setShowConfirmation: (value: boolean) => void;
  setDisclaimerAccepted: (value: boolean) => void;
  resetLimitPrice: () => void;
  switchTokens: (dstTokenAmount?: BigNumber) => void;
  reset: () => void;

  // derived
  computed: {
    tradeIntervalMillis: number;
    tradeIntervalTimeFormat: TimeFormat;
    deadline: number;
    deadlineUi: string;
    tradeSize?: BigNumber;
    derivedTradeInterval: { millis: number; timeFormat: TimeFormat };
    minAmountOut: BigNumber;
  };
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

export interface TokenInfo {
  symbol: string;
  address: string;
  decimals: number;
  logoUrl?: string;
  isNative?: boolean;
}

export enum OrderStatus {
  Open = "Open",
  Filled = "Filled",
  Expired = "Expired",
  Canceled = "Canceled",
}

export type Order = {
  dstPrice: BigNumber;
  srcToken: Token;
  dstToken: Token;
  srcTokenAmount: BigNumber;
  tradeSize: BigNumber;
  dstMinAmount: BigNumber;
  deadline: number;
  delay: number;
  id: string;
  status: OrderStatus;
  srcFilledAmount: BigNumber;
  time: number;
  tradeIntervalMillis: number;
  createdAtUi: string;
  deadlineUi: string;
  progress: number;
  srcRemainingAmount: BigNumber;
  isMarketOrder: boolean;
  dstAmount: BigNumber;
  prefix: string;
  srcTokenInfo: TokenInfo;
  dstTokenInfo: TokenInfo;
  srcUsdValueUi: string;
  dstUsdValueUi: string;
  srcTokenAmountUi: string;
  dstTokenAmountUi: string;
  tradeSizeAmountUi: string;
  tradeSizeUsdValueUi: string;
  srcFilledAmountUi: string;
  srcRemainingAmountUi: string;
  srcFilledUsdValueUi: string;
  srcRemainingUsdValueUi: string;
};

export interface Translations {
  confirmationDeadlineTooltip: string;
  confirmationtradeIntervalTooltip: string;
  confirmationTradeSizeTooltip: string;
  confirmationTotalTradesTooltip: string;
  confirmationMinDstAmountTootip: string;
  confirmationLimitOrderTooltip: string;
  confirmationMarketOrderTooltip: string;
  confirmationMinReceivedPerTradeTooltip: string;
  marketPriceTooltip: string;
  limitPriceTooltip: string;
  tradeSizeTooltip: string;
  maxDurationTooltip: string;
  tradeIntervalTootlip: string;
  customIntervalTooltip: string;
  totalTradesTooltip: string;
  connect: string;
  selectTokens: string;
  acceptDisclaimer: string;
  outputWillBeSentTo: string;
  disclaimer1: string;
  disclaimer2: string;
  disclaimer3: string;
  disclaimer4: string;
  disclaimer5: string;
  disclaimer6: string;
  disclaimer7: string;
  link: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  switchNetwork: string;
  wrap: string;
  approve: string;
  placeOrder: string;
  confirmOrder: string;
  partialFillWarning: string;
  enterAmount: string;
  insufficientFunds: string;
  enterTradeSize: string;
  enterMaxDuration: string;
  enterTradeInterval: string;
  tradeSizeMustBeEqual: string;
  tradeSize: string;
  tradeInterval: string;
  maxDuration: string;
  totalTrades: string;
  deadline: string;
  filled: string;
  remaining: string;
  cancelOrder: string;
  marketOrder: string;
  limitOrder: string;
  limitPrice: string;
  marketPrice: string;
  max: string;
  currentMarketPrice: string;
  from: string;
  to: string;
  none: string;
  orders: string;
  Open: string;
  Filled: string;
  Expired: string;
  Canceled: string;
  noOrdersFound: string;
  confirmTx: string;
  expiration: string;
  orderType: string;
  minReceivedPerTrade: string;
  confirmationLimitPriceTooltip: string;
}
