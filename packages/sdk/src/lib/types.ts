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
  pathfinderKey?: string;
};

export enum OrderStatus {
  Open = "OPEN",
  Canceled = "CANCELED",
  Completed = "COMPLETED",
  Expired = "EXPIRED",
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

export interface getAskParamsProps {
  destTokenMinAmount: string;
  srcChunkAmount: string;
  deadline: number;
  fillDelay: TimeDuration;
  srcAmount: string;
  srcTokenAddress: string;
  destTokenAddress: string;
}

export type PrepareOrderArgsResult = [string, string, string, string, string, string, string, string, string, string[]];

export type TwapFill = {
  TWAP_id: number;
  dollarValueIn: string;
  dollarValueOut: string;
  dstAmountOut: string;
  dstFee: string;
  id: string;
  srcAmountIn: string;
  srcFilledAmount: string;
  timestamp: number;
  twapAddress: string;
  exchange: string;
  transactionHash: string;
};

export type LensOrder = {
  id: bigint;
  ask: {
    bidDelay: number;
    data: `0x${string}`;
    deadline: number;
    dstMinAmount: bigint;
    dstToken: `0x${string}`;
    exchange: `0x${string}`;
    fillDelay: number;
    srcAmount: bigint;
    srcBidAmount: bigint;
    srcToken: `0x${string}`;
  };
  bid: {
    data: `0x${string}`;
    dstAmount: bigint;
    dstFee: bigint;
    exchange: `0x${string}`;
    taker: `0x${string}`;
    time: number;
  };
  maker: `0x${string}`;
  status: number;
  time: number;
  filledTime: number;
  srcFilledAmount: bigint;
};
