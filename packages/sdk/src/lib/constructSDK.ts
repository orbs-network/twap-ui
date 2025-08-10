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
  getDestTokenAmount,
  DEFAULT_FILL_DELAY,
  getDestTokenMinAmountPerChunk,
  getTriggerPricePerChunk,
  getPermitData,
} from "./lib";
import { getOrders } from "./orders";
import { submitOrder } from "./submit-order";
import { Config, GetPermitDataProps, Module, RePermitTypedData, Signature, TimeDuration } from "./types";
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
  getPermitData(props: GetPermitDataProps) {
    return getPermitData(props);
  }
  submitOrder(permitData: RePermitTypedData, signature: Signature) {
    return submitOrder(permitData, signature);
  }
  getMaxChunks(typedSrcAmount: string, oneSrcTokenUsd: string, minChunkSizeUsd: number) {
    return getMaxPossibleChunks(this.config, typedSrcAmount, oneSrcTokenUsd, minChunkSizeUsd);
  }
  getChunks(maxChunks: number, module: Module, customChunks?: number) {
    return getChunks(maxChunks, module, customChunks);
  }
  getSrcTokenChunkAmount(srcAmount: string, chunks?: number) {
    return getSrcChunkAmount(srcAmount, chunks);
  }
  getFillDelay(typedFillDelay?: TimeDuration) {
    return getFillDelay(typedFillDelay);
  }
  getDuration(module: Module, chunks: number, fillDelay: TimeDuration, typedDuration?: TimeDuration) {
    return getDuration(module, chunks, fillDelay, typedDuration);
  }
  getDestTokenMinAmountPerChunk(srcTokenChunkAmount: string, limitPrice: string, isMarketOrder: boolean, srcTokenDecimals: number) {
    return getDestTokenMinAmountPerChunk(srcTokenChunkAmount, limitPrice, isMarketOrder, srcTokenDecimals);
  }
  getTriggerPricePerChunk(srcChunkAmount: string, triggerPrice: string, srcTokenDecimals: number) {
    return getTriggerPricePerChunk(srcChunkAmount, triggerPrice, srcTokenDecimals);
  }

  getDestTokenAmount(srcAmount: string, limitPrice: string, srcTokenDecimals: number) {
    return getDestTokenAmount(srcAmount, limitPrice, srcTokenDecimals);
  }
  getOrderDeadline(currentTimeMillis: number, orderDuration: TimeDuration) {
    return getDeadline(currentTimeMillis, orderDuration);
  }

  // errors
  getMaxFillDelayError(fillDelay: TimeDuration, chunks: number) {
    const isDefault = fillDelay.unit === DEFAULT_FILL_DELAY.unit && fillDelay.value === DEFAULT_FILL_DELAY.value;
    return {
      isError: !isDefault && getTimeDurationMillis(fillDelay) * chunks > MAX_ORDER_DURATION_MILLIS,
      value: Math.floor(MAX_ORDER_DURATION_MILLIS / chunks),
    };
  }

  getStopLossPriceError(marketPrice = "", triggerPrice = "", module: Module) {
    if (module === Module.STOP_LOSS) {
      return {
        isError: BN(triggerPrice || 0).gte(BN(marketPrice || 0)),
        value: marketPrice,
      };
    }
  }

  getTakeProfitPriceError(marketPrice = "", triggerPrice = "", module: Module) {
    if (module === Module.TAKE_PROFIT) {
      return {
        isError: BN(triggerPrice || 0).lte(BN(marketPrice || 0)),
        value: marketPrice,
      };
    }
  }

  getStopLossLimitPriceError(triggerPrice = "", limitPrice = "", isMarketOrder = false, module: Module) {
    if (!isMarketOrder && module === Module.STOP_LOSS) {
      return {
        isError: BN(limitPrice || 0).gte(BN(triggerPrice || 0)),
        value: triggerPrice,
      };
    }
  }

  getTakeProfitLimitPriceError(triggerPrice = "", limitPrice = "", isMarketOrder = false, module: Module) {
    if (!isMarketOrder && module === Module.TAKE_PROFIT) {
      return {
        isError: BN(limitPrice || 0).gte(BN(triggerPrice || 0)),
        value: triggerPrice,
      };
    }
  }

  getMaxOrderDurationError(module: Module, duration: TimeDuration) {
    if (module === Module.STOP_LOSS || module === Module.TAKE_PROFIT) {
      const max = 90 * 24 * 60 * 60 * 1000; // 3 months
      return {
        isError: getTimeDurationMillis(duration) > max,
        value: max,
      };
    }
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
  getMaxChunksError(chunks: number, maxChunks: number, module: Module) {
    return {
      isError: module === Module.TWAP && BN(chunks).isGreaterThan(maxChunks),
      value: maxChunks,
    };
  }

  async getOrders(account: string, signal?: AbortSignal) {
    return getOrders({ chainId: this.config.chainId, signal, filters: { accounts: [account], configs: [this.config] } });
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
