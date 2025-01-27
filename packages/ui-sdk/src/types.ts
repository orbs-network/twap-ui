import { Config, TimeDuration } from "@orbs-network/twap-sdk";

export type Token = {
  address: string;
  symbol: string;
  decimals: number;
  logoUrl: string;
};

export type State = {
  typedSrcAmount?: string;

  srcToken?: Token;
  destToken?: Token;

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
};

export type TwapProviderProps = {
  config: Config;
  chainId?: number;
  children: React.ReactNode;
  isLimitPanel?: boolean;
  walletAddress?: string;
};

export enum ActionType {
  UPDATED_STATE = "UPDATED_STATE",
}

export type Action = { type: ActionType.UPDATED_STATE; value: Partial<State> };
