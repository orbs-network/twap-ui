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
  TWAP_LIMIT = "twap-limit",
  TWAP_MARKET = "twap-market",
}

export interface PrepareOrderArgs {
  destTokenMinAmount: string;
  srcChunkAmount: string;
  deadline: number;
  fillDelay: TimeDuration;
  srcAmount: string;
  srcTokenAddress: string;
  destTokenAddress: string;
}

export interface DerivedSwapValuesArgs {
  srcAmount?: string;
  price?: string;
  customDuration?: TimeDuration;
  customFillDelay?: TimeDuration;
  customChunks?: number;
  isLimitPanel?: boolean;
  oneSrcTokenUsd?: string | number;
  srcDecimals?: number;
  destDecimals?: number;
  isMarketOrder?: boolean;
}

export interface DerivedSwapValuesResponse {
  chunks: number;
  duration: TimeDuration;
  fillDelay: TimeDuration;
  srcChunkAmount: string;
  destTokenMinAmount: string;
  destTokenAmount?: string;
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
