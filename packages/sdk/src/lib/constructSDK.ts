import { Analytics } from "./analytics";
import {
  getChunks,
  getCreateOrderArgs,
  getDeadline,
  getDstTokenMinAmount,
  getDuration,
  getEstimatedDelayBetweenChunksMillis,
  getFillDelay,
  getMaxPossibleChunks,
  getSrcChunkAmount,
  getSwapValues,
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
    return getCreateOrderArgs(props, this.config);
  }
  getSwapValues(props: GetSwapValuesArgs) {
    return getSwapValues(props, this.config);
  }

  getDeadline(duration: TimeDuration) {
    return getDeadline(duration);
  }

  getDuration(chunks?: number, fillDelay?: TimeDuration | undefined, customDuration?: TimeDuration | undefined) {
    return getDuration(chunks, fillDelay, customDuration);
  }

  getFillDelay(customFillDelay: TimeDuration, isLimitPanel?: boolean) {
    return getFillDelay(customFillDelay, isLimitPanel);
  }
  getChunks(maxPossibleChunks: number, customChunks?: number, isLimitPanel?: boolean) {
    return getChunks(maxPossibleChunks, customChunks, isLimitPanel);
  }

  getSrcChunkAmount(srcAmount?: string, chunks?: number) {
    return getSrcChunkAmount(srcAmount, chunks);
  }
  getMaxPossibleChunks(typedSrcAmount?: string | undefined, oneSrcTokenUsd?: string | number | undefined) {
    return getMaxPossibleChunks(this.config, typedSrcAmount, oneSrcTokenUsd);
  }

  getDstTokenMinAmount(srcChunkAmount?: string, typedLimitPrice?: string, isMarketOrder?: boolean, srcTokenDecimals?: number, dstTokenDecimals?: number) {
    return getDstTokenMinAmount(srcChunkAmount, typedLimitPrice, isMarketOrder, srcTokenDecimals, dstTokenDecimals);
  }
  getPartialFillWarning(chunks: number, duration: TimeDuration, fillDelay: TimeDuration) {
    return getPartialFillWarning(chunks, duration, fillDelay);
  }

  getMaxFillDelayWarning(fillDelay: TimeDuration) {
    return getMaxFillDelayWarning(fillDelay);
  }

  getTradeSizeWarning(srcChunkAmountUsd?: string | number | undefined, chunks?: number) {
    return getTradeSizeWarning(this.config, srcChunkAmountUsd, chunks);
  }

  getMinFillDelayWarning(fillDelay: TimeDuration) {
    return getMinFillDelayWarning(fillDelay);
  }
  getMinTradeDurationWarning(duration: TimeDuration) {
    return getMinTradeDurationWarning(duration);
  }

  getMaxTradeDurationWarning(duration: TimeDuration) {
    return getMaxTradeDurationWarning(duration);
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
