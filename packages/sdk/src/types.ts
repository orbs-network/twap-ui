import ConfigJson from "@orbs-network/twap/configs.json";
import { Moment } from "moment";
import { IconType } from "@react-icons/all-files";
export type Config = typeof ConfigJson.Arbidex;
export type StoreOverride = Partial<State>;


export interface HistoryOrder {
  id: number;
  deadline: number;
  createdAt: number;
  srcAmount: string;
  dstMinAmount: string;
  status?: Status;
  srcBidAmount: string;
  fillDelay?: number;
  txHash?: string;
  dstAmount?: string;
  srcFilledAmount?: string;
  dollarValueIn?: string;
  dollarValueOut?: string;
  progress?: number;
  srcTokenAddress?: string;
  dstTokenAddress?: string;
  totalChunks?: number;
  srcToken?: Token;
  dstToken?: Token;
  dex?: string;
  exchange?: string;
}

export type Token = {
  address: string;
  symbol: string;
  decimals: number;
  logoUrl: string;
};

export interface OrdersData {
  [Status.All]?: HistoryOrder[];
  [Status.Open]?: HistoryOrder[];
  [Status.Canceled]?: HistoryOrder[];
  [Status.Expired]?: HistoryOrder[];
  [Status.Completed]?: HistoryOrder[];
}

export type SwapState = "loading" | "success" | "failed" | "rejected";
export type SwapStep = "createOrder" | "wrap" | "approve";

export interface State {
  swapStep?: SwapStep;
  swapSteps?: SwapStep[];
  swapState?: SwapState;
  srcAmountUi: string;

  confirmationClickTimestamp: Moment;
  showConfirmation: boolean;
  disclaimerAccepted: boolean;

  customChunks?: number;
  customFillDelay: Duration;
  customDuration?: Duration;

  createOrdertxHash?: string;
  wrapTxHash?: string;
  approveTxHash?: string;
  unwrapTxHash?: string;

  isCustomLimitPrice?: boolean;
  customLimitPrice?: string;
  isInvertedLimitPrice?: boolean;
  limitPricePercent?: string;
  isMarketOrder?: boolean;

  createOrderSuccess?: boolean;
  wrapSuccess?: boolean;
  approveSuccess?: boolean;

  selectedOrdersTab: number;
}




export interface OrderCreated {
  Contract_id: string;
  ask_bidDelay: string;
  ask_data: string;
  ask_deadline: string;
  ask_dstMinAmount: string;
  ask_dstToken: string;
  ask_exchange: string;
  ask_fillDelay: string;
  ask_srcAmount: string;
  ask_srcBidAmount: string;
  ask_srcToken: string;
  blockNumber: string;
  blockTimestamp: string;
  dex: string;
  dollarValueIn: string;
  dstTokenSymbol: string;
  exchange: string;
  id: string;
  maker: string;
  srcTokenSymbol: string;
  timestamp: string;
  transactionHash: string;
}



export type Step = {
  title: string;
  description?: string;
  link?: {
    url: string;
    text: string;
  };
  Icon?: IconType;
  image?: string;
  status: "pending" | "loading" | "completed" | "disabled";
};



export enum TimeResolution {
  Minutes = 60 * 1000,
  Hours = Minutes * 60,
  Weeks = 7 * 24 * Hours,
  Days = Hours * 24,
  Months = 30 * Days,
  Years = 365 * Days,
}
export type Duration = { resolution: TimeResolution; amount?: number };


export enum Status {
  All = "All",
  Open = "Open",
  Canceled = "Canceled",
  Completed = "Completed",
  Expired = "Expired",
}
