import { Config, TokenData } from "@orbs-network/twap";
import { ReactNode } from "react";

export interface Translations {
  confirmationDeadlineTooltip: string;
  confirmationtradeIntervalTooltip: string;
  confirmationTradeSizeTooltip: string;
  confirmationTotalTradesTooltip: string;
  confirmationMinDstAmountTootipMarket: string;
  confirmationMinDstAmountTootipLimit: string;
  confirmationOrderType: string;
  confirmationMarketOrderTooltip: string;
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
  Completed: string;
  Expired: string;
  Canceled: string;
  noOrdersFound: string;
  confirmTx: string;
  expiration: string;
  orderType: string;
  minReceivedPerTrade: string;
  confirmationLimitPriceTooltip: string;
  ordersTooltip: string;
  noOrdersFound1: string;
  poweredBy: string;
  insertLimitPriceWarning: string;
  unwrap: string;
  balance: string;
  selectToken: string;
  sliderMinSizeTooltip: string;
}

interface BaseProps {
  connectedChainId?: number;
  account?: any;
  provider: any;
  translations: Translations;
  getProvider: () => any;

  getTokenImage?: (value: any) => string;
  dappTokens: any;
  gasPrice?: {
    priorityFeePerGas?: string;
    maxFeePerGas?: string;
  };
}
export interface TWAPProps extends BaseProps {
  connect?: () => void;
  srcToken?: string;
  dstToken?: string;
  onSrcTokenSelected?: (token: TokenData) => void;
  onDstTokenSelected?: (token: TokenData) => void;
  TokenSelectModal?: any;
}
export interface OrdersProps extends BaseProps {}

interface LibProps {
  children: ReactNode;
  connectedChainId?: number;
  account?: any;
  config: Config;
  provider: any;
  translations: Translations;
  getTokenImage?: (value: any) => string;
  gasPrice?: {
    priorityFeePerGas?: string;
    maxFeePerGas?: string;
  };
}

export interface TwapLibProps extends LibProps {
  connect?: () => void;
  onSrcTokenSelected?: (token: TokenData) => void;
  onDstTokenSelected?: (token: TokenData) => void;
  TokenSelectModal?: any;
}

export interface OrderLibProps extends LibProps {
  tokenList: TokenData[];
}
