import { Config, TimeDuration } from "@orbs-network/twap-sdk";

export type Token = {
  address: string;
  symbol: string;
  decimals: number;
  logoUrl: string;
};
export type SwapStep = "createOrder" | "wrap" | "approve";
export type SwapState = "loading" | "success" | "failed" | "rejected";

export type State = {
  swapStep?: SwapStep;
  swapSteps?: SwapStep[];
  swapStatus?: SwapState;
  typedSrcAmount?: string;

  rawSrcToken?: any;
  rawDstToken?: any;

  typedChunks?: number;
  typedFillDelay: TimeDuration;
  typedDuration?: TimeDuration;

  typedPrice?: string;
  isInvertedLimitPrice?: boolean;
  limitPricePercent?: string;
  isMarketOrder?: boolean;
  isLimitPanel?: boolean;

  marketPrice?: string;
  oneSrcTokenUsd?: number;
  currentTime: number;
  showConfirmation?: boolean;

  approveSuccess?: boolean;
  wrapSuccess?: boolean;
  wrapTxHash?: string;
  unwrapTxHash?: string;
  approveTxHash?: string;
  createOrderSuccess?: boolean;
  createOrderTxHash?: string;
};

export type TwapProviderProps = {
  config: Config;
  children: React.ReactNode;
  parseToken: (token: any) => Token;
  isLimitPanel?: boolean;
};
