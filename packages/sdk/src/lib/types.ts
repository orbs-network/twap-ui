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

export interface getAskArgsProps {
  destTokenMinAmount: string;
  srcChunkAmount: string;
  deadline: number;
  fillDelay: TimeDuration;
  srcAmount: string;
  srcTokenAddress: string;
  destTokenAddress: string;
}

export enum Warnings {
  PARTIAL_FILL = "PARTIAL_FILL",
}
export enum Errors {
  MIN_FILL_DELAY = "MIN_FILL_DELAY",
  MAX_FILL_DELAY = "MAX_FILL_DELAY",
  MIN_TRADE_DURATION = "MIN_TRADE_DURATION",
  MAX_TRADE_DURATION = "MAX_TRADE_DURATION",
  TRADE_SIZE = "TRADE_SIZE",
  SRC_AMOUNT = "SRC_AMOUNT",
  LIMIT_PRICE = "LIMIT_PRICE",
  MIN_CHUNKS = "MIN_CHUNKS",
  MAX_CHUNKS = "MAX_CHUNKS",
}

export type TwapError =
  | {
      type: Errors;
      text: string;
    }
  | undefined;

export type TwapWarning =
  | {
      type: Warnings;
      text: string;
    }
  | undefined;

export type PrepareOrderArgsResult = [string, string, string, string, string, string, string, string, string, string[]];
