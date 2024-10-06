import { Analytics } from "./analytics";
import {
  getChunks,
  getCreateOrderArgs,
  getDeadline,
  getDestTokenAmount,
  getDestTokenMinAmount,
  getDuration,
  getEstimatedDelayBetweenChunksMillis,
  getFillDelay,
  getMaxPossibleChunks,
  getSrcChunkAmount,
  getDerivedSwapValues,
} from "./lib";
import { getOrders, waitForUpdatedOrders } from "./orders";
import { Config, GetCreateOrderArgs, GetSwapValuesArgs, Order, TimeDuration } from "./types";
import { getMaxFillDelayWarning, getMaxTradeDurationWarning, getMinFillDelayWarning, getMinTradeDurationWarning, getPartialFillWarning, getTradeSizeWarning } from "./warnings";

interface Props {
  config: Config;
}

const analytics = new Analytics();

const analyticsCallback = {
  onApproveRequest: analytics.onApproveRequest.bind(analytics),
  onApproveSuccess: analytics.onApproveSuccess.bind(analytics),
  onApproveError: analytics.onApproveError.bind(analytics),
  onWrapRequest: analytics.onWrapRequest.bind(analytics),
  onWrapSuccess: analytics.onWrapSuccess.bind(analytics),
  onWrapError: analytics.onWrapError.bind(analytics),
  onCreateOrderRequest: analytics.onCreateOrderRequest.bind(analytics),
  onCreateOrderSuccess: analytics.onCreateOrderSuccess.bind(analytics),
  onCreateOrderError: analytics.onCreateOrderError.bind(analytics),
  onCancelOrderRequest: analytics.onCancelOrder.bind(analytics),
  onCancelOrderSuccess: analytics.onCancelOrderSuccess.bind(analytics),
  onCancelOrderError: analytics.onCancelOrder.bind(analytics),
};

export class TwapSDK {
  public config: Config;
  public analytics = analyticsCallback;
  public estimatedDelayBetweenChunksMillis: number;
  constructor(props: Props) {
    this.config = props.config;
    analytics.onConfigChange(props.config);
    this.estimatedDelayBetweenChunksMillis = getEstimatedDelayBetweenChunksMillis(this.config);
  }

  getCreateOrderArgs(props: GetCreateOrderArgs) {
    return getCreateOrderArgs(this.config, props);
  }
  public swapWarnings = {
    partialFill: (chunks: number, duration: TimeDuration, fillDelay: TimeDuration) => {
      return getPartialFillWarning(chunks, duration, fillDelay);
    },

    maxFillDelay: (fillDelay: TimeDuration) => {
      return getMaxFillDelayWarning(fillDelay);
    },

    tradeSizeWarning: (srcChunkAmountUsd?: string | number | undefined, chunks?: number) => {
      return getTradeSizeWarning(this.config, srcChunkAmountUsd, chunks);
    },

    minFillDelay: (fillDelay: TimeDuration) => {
      return getMinFillDelayWarning(fillDelay);
    },
    minTradeDuration(duration: TimeDuration) {
      return getMinTradeDurationWarning(duration);
    },

    maxTradeDuration: (duration: TimeDuration) => {
      return getMaxTradeDurationWarning(duration);
    },
  };

  getSwapData(props: GetSwapValuesArgs) {
    return getDerivedSwapValues(this.config, props);
  }

  getDeadline(duration: TimeDuration) {
    return getDeadline(duration);
  }

  getDuration(chunks: number, fillDelay: TimeDuration, customDuration?: TimeDuration) {
    return getDuration(chunks, fillDelay, customDuration);
  }

  getFillDelay(isLimitPanel: boolean, customFillDelay?: TimeDuration) {
    return getFillDelay(isLimitPanel, customFillDelay);
  }
  getChunks(maxPossibleChunks: number, isLimitPanel: boolean, customChunks?: number) {
    return getChunks(maxPossibleChunks, isLimitPanel, customChunks);
  }

  getSrcChunkAmount(srcAmount: string, chunks: number) {
    return getSrcChunkAmount(srcAmount, chunks);
  }
  getMaxPossibleChunks(srcAmount: string, oneSrcTokenUsd: string | number, srcTokenDecimals: number) {
    return getMaxPossibleChunks(this.config, srcAmount, oneSrcTokenUsd, srcTokenDecimals);
  }

  getDestTokenMinAmount(srcChunkAmount: string, limitPrice: string, isMarketOrder: boolean, srcTokenDecimals: number, dstTokenDecimals: number) {
    return getDestTokenMinAmount(srcChunkAmount, limitPrice, isMarketOrder, srcTokenDecimals, dstTokenDecimals);
  }

  getDestTokenAmount(srcAmount: string, limitPrice: string, srcTokenDecimals: number, destTokenDecimals: number) {
    return getDestTokenAmount(srcAmount, limitPrice, srcTokenDecimals, destTokenDecimals);
  }
  async getOrders(account: string, signal?: AbortSignal) {
    return getOrders(this.config, account, signal);
  }
  async fetchUpdatedOrders(account: string, orderId: number, signal?: AbortSignal) {
    return waitForUpdatedOrders(this.config, orderId, account, signal);
  }
}

export const constructSDK = (props: Props) => {
  return new TwapSDK(props);
};
