import { Config, TimeDuration } from "@orbs-network/twap-sdk";

export type Token = {
  address: string;
  symbol: string;
  decimals: number;
};

export type State = {
  typedChunks?: number;
  typedFillDelay: TimeDuration;
  typedDuration?: TimeDuration;

  typedPrice?: string;
  isInvertedLimitPrice?: boolean;
  limitPricePercent?: string;
  isMarketOrder?: boolean;

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
  RESET = "RESET",
}

export type Action = { type: ActionType.UPDATED_STATE; value: Partial<State> } | { type: ActionType.RESET };
