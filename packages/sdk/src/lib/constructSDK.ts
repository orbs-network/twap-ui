import { Analytics } from "./analytics";
import {
  getEstimatedDelayBetweenChunksMillis,
  getDeadline,
  getMaxPossibleChunks,
  getChunks,
  getSrcChunkAmount,
  getFillDelay,
  getDuration,
  getDestTokenMinAmount,
  getDestTokenAmount,
  getAskParams,
} from "./lib";
import { addCancelledOrder, addNewOrder, getOrders, RawOrder } from "./orders";
import { Config, getAskParamsProps, TimeDuration } from "./types";
import { getChunksWarning, getDurationWarning, getFillDelayWarning, getLimitPriceWarning, getPartialFillWarning, getTradeSizeWarning } from "./warnings";

interface Props {
  config: Config;
  minChunkSizeUsd?: number;
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
  onCancelOrderError: analytics.onCanelOrderError.bind(analytics),
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

  getAskParams(props: getAskParamsProps) {
    return getAskParams(this.config, props);
  }
  getMaxChunks(typedSrcAmount: string, oneSrcTokenUsd: number, minChunkSizeUsd: number) {
    return getMaxPossibleChunks(this.config, typedSrcAmount, oneSrcTokenUsd, minChunkSizeUsd);
  }
  getChunks(maxChunks: number, isLimitPanel: boolean, customChunks?: number) {
    return getChunks(maxChunks, isLimitPanel, customChunks);
  }
  getSrcTokenChunkAmount(srcAmount: string, chunks?: number) {
    return getSrcChunkAmount(srcAmount, chunks);
  }
  getFillDelay(isLimitPanel: boolean, typedFillDelay?: TimeDuration) {
    return getFillDelay(isLimitPanel, typedFillDelay);
  }
  getOrderDuration(chunks: number, fillDelay: TimeDuration, typedDuration?: TimeDuration) {
    return getDuration(chunks, fillDelay, typedDuration);
  }
  getDestTokenMinAmount(srcTokenChunkAmount: string, limitPrice: string, isMarketOrder: boolean, srcTokenDecimals: number) {
    return getDestTokenMinAmount(srcTokenChunkAmount, limitPrice, isMarketOrder, srcTokenDecimals);
  }
  getDestTokenAmount(srcAmount: string, limitPrice: string, srcTokenDecimals: number) {
    return getDestTokenAmount(srcAmount, limitPrice, srcTokenDecimals);
  }
  getFillDelayError(fillDelay: TimeDuration, isLimitPanel: boolean) {
    return getFillDelayWarning(fillDelay, isLimitPanel);
  }
  getOrderDeadline(currentTimeMillis: number, orderDuration: TimeDuration) {
    return getDeadline(currentTimeMillis, orderDuration);
  }

  getTradeSizeError(typedSrcAmount: string, oneSrcTokenUsd: number, minChunkSizeUsd: number) {
    return getTradeSizeWarning(minChunkSizeUsd, oneSrcTokenUsd, typedSrcAmount);
  }
  getChunksError(chunks: number, maxChunks: number, isLimitPanel: boolean) {
    return getChunksWarning(chunks, maxChunks, Boolean(isLimitPanel));
  }
  getLimitPriceError(typedLimitPrice?: string) {
    return getLimitPriceWarning(typedLimitPrice);
  }
  getDurationError(orderDuration: TimeDuration, isLimitPanel: boolean) {
    return getDurationWarning(orderDuration, isLimitPanel);
  }
  getPartialFillWarning(chunks: number, orderDuration: TimeDuration, fillDelay: TimeDuration) {
    return getPartialFillWarning(chunks, orderDuration, fillDelay);
  }

  async getUserOrders({ account, signal, page, limit }: { account: string; signal?: AbortSignal; page?: number; limit?: number }) {
    return getOrders({ chainId: this.config.chainId, config: this.config, account, signal, page, limit });
  }

  async addNewOrder(account: string, rawOrder: RawOrder) {
    return addNewOrder(account, this.config.exchangeAddress, rawOrder);
  }

  async addCancelledOrder(account: string, orderId: number) {
    return addCancelledOrder(account, this.config.exchangeAddress, orderId);
  }
}

export const constructSDK = (props: Props) => {
  return new TwapSDK(props);
};
