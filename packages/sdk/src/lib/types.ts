export type Config = {
  chainName: string;
  chainId: number;
  twapVersion: number;
  twapAddress: string;
  lensAddress: string;
  bidDelaySeconds: number;
  minChunkSizeUsd: number;
  name: string;
  partner: string;
  exchangeAddress: string;
  exchangeType: string;
  pathfinderKey: string;
};

export enum OrderStatus {
  All = "all",
  Open = "open",
  Canceled = "canceled",
  Completed = "completed",
  Expired = "expired",
}

export enum TimeUnit {
  Minutes = 60 * 1000,
  Hours = Minutes * 60,
  Weeks = 7 * 24 * Hours,
  Days = Hours * 24,
  Months = 30 * Days,
  Years = 365 * Days,
}

export type TimeDuration = { unit: TimeUnit; value: number };

export enum OrderType {
  LIMIT = "limit",
  DCA_LIMIT = "dca-limit",
  DCA_MARKET = "dca-market",
}

export type Order = {
  id: number;
  exchange: string;
  dex: string;
  deadline: number;
  createdAt: number;
  srcAmount: string;
  dstMinAmount: string;
  status: OrderStatus;
  srcBidAmount: string;
  txHash: string;
  dstFilledAmount: string;
  srcFilledAmount: string;
  srcFilledAmountUsd: string;
  dstFilledAmountUsd: string;
  progress: number;
  srcTokenAddress: string;
  dstTokenAddress: string;
  totalChunks: number;
  isMarketOrder: boolean;
  fillDelay: number;
  orderType: OrderType;
  getLimitPrice: (srcTokenDecimals: number, dstTokenDecimals: number) => string | undefined;
  getExcecutionPrice: (srcTokenDecimals: number, dstTokenDecimals: number) => string | undefined;
};

export interface PrepareOrderArgs {
  destTokenMinAmount: bigint;
  srcChunkAmount: bigint;
  deadline: number;
  fillDelay: TimeDuration;
  srcAmount: bigint;
  srcTokenAddress: string;
  destTokenAddress: string;
}

export interface DerivedSwapValuesArgs {
  srcAmount?: bigint;
  limitPrice?: bigint;
  customDuration?: TimeDuration;
  customFillDelay?: TimeDuration;
  customChunks?: number;
  isLimitPanel?: boolean;
  oneSrcTokenUsd?: number;
  srcDecimals?: number;
  destDecimals?: number;
  isMarketOrder?: boolean;
}

export interface DerivedSwapValuesResponse {
  chunks: number;
  duration: TimeDuration;
  deadline: number;
  fillDelay: TimeDuration;
  srcChunkAmount: bigint;
  destTokenMinAmount: bigint;
  destTokenAmount?: bigint;
  maxPossibleChunks: number;
  warnings: {
    partialFill: boolean;
    minFillDelay: boolean;
    maxFillDelay: boolean;
    minDuration: boolean;
    maxDuration: boolean;
    tradeSize: boolean;
  };
}

export type PrepareOrderArgsResult = [string, string, string, string, string, string, string, string, string, string[]];
