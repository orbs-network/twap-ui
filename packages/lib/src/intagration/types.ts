import { Moment } from "moment";
import { useSwapData } from "../hooks";
import { Config, Duration, Token, Translations } from "../types";

export interface ItegrationState {
  // swapStep?: SwapStep;
  // swapSteps?: SwapStep[];
  // swapState?: SwapState;
  srcAmountUi: string;
  srcAmount?: string;

  confirmationClickTimestamp: Moment;

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

  swapData?: ReturnType<typeof useSwapData>;

  srcToken?: Token;
  dstToken?: Token;
}

export interface IntegrationProps {
  translationsOverride?: Partial<Translations>;
  marketPrice: string;
  config: Config;
  askDataParams: any;
  isLimitPanel?: boolean;
  srcUsdPrice?: string;
  dstUsdPrice?: string;
  srcToken?: Token;
  dstToken?: Token;
}
