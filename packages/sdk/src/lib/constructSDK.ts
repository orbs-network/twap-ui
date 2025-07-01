import { Analytics } from "./analytics";
import { MAX_ORDER_DURATION_MILLIS, MIN_FILL_DELAY_MILLIS, MIN_ORDER_DURATION_MILLIS } from "./consts";
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
import { getOrders } from "./orders";
import { Config, getAskParamsProps, TimeDuration } from "./types";
import { getTimeDurationMillis } from "./utils";
import BN from "bignumber.js";

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
  //create order values
  getAskParams(props: getAskParamsProps) {
    return getAskParams(this.config, props);
  }
  getMaxChunks(typedSrcAmount: string, oneSrcTokenUsd: string, minChunkSizeUsd: number) {
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
  getOrderDeadline(currentTimeMillis: number, orderDuration: TimeDuration) {
    return getDeadline(currentTimeMillis, orderDuration);
  }

  // errors
  getMaxFillDelayError(fillDelay: TimeDuration, chunks: number) {
    return {
      isError: getTimeDurationMillis(fillDelay) * chunks > MAX_ORDER_DURATION_MILLIS,
      value: Math.floor(MAX_ORDER_DURATION_MILLIS / chunks),
    };
  }

  getMaxOrderDurationError(duration: TimeDuration) {
    return {
      isError: getTimeDurationMillis(duration) > MAX_ORDER_DURATION_MILLIS,
      value: MAX_ORDER_DURATION_MILLIS,
    };
  }

  getMinOrderDurationError(duration: TimeDuration) {
    return {
      isError: getTimeDurationMillis(duration) < MIN_ORDER_DURATION_MILLIS,
      value: MIN_ORDER_DURATION_MILLIS,
    };
  }

  getMinFillDelayError(fillDelay: TimeDuration) {
    return {
      isError: getTimeDurationMillis(fillDelay) < MIN_FILL_DELAY_MILLIS,
      value: MIN_FILL_DELAY_MILLIS,
    };
  }
  getMinTradeSizeError(typedSrcAmount: string, oneSrcTokenUsd: string, minChunkSizeUsd: number) {
    return {
      isError: BN(oneSrcTokenUsd || 0)
        .multipliedBy(typedSrcAmount || 0)
        .isLessThan(minChunkSizeUsd),
      value: minChunkSizeUsd,
    };
  }
  getMaxChunksError(chunks: number, maxChunks: number, isLimitPanel: boolean) {
    return {
      isError: !isLimitPanel && BN(chunks).isGreaterThan(maxChunks),
      value: maxChunks,
    };
  }

  async getOrders(account: string, signal?: AbortSignal) {
    return getOrders({ chainId: this.config.chainId, signal, filters: { account, config: this.config } });
  }
}

let sdk: TwapSDK;

export const constructSDK = (props: Props) => {
  if (props.config.chainId === sdk?.config.chainId && props.config.name === sdk.config.name) {
    return sdk;
  }
  sdk = new TwapSDK(props);
  return sdk;
};
