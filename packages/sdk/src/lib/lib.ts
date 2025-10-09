import BN from "bignumber.js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as Spot from "@orbs-network/spot";
import Configs from "@orbs-network/twap/configs.json";
import { DEFAULT_FILL_DELAY, MAX_ORDER_DURATION_MILLIS, MIN_FILL_DELAY_MILLIS, MIN_ORDER_DURATION_MILLIS } from "./consts";
import { Config, Module, Partners, SpotConfig, TimeDuration, TimeUnit } from "./types";
import { findTimeUnit, getTimeDurationMillis } from "./utils";
console.log(Spot);

// values calculations

export const getDestTokenAmount = (srcAmount?: string, limitPrice?: string, srcTokenDecimals?: number) => {
  if (!srcAmount || !limitPrice || !srcTokenDecimals) return undefined;

  const result = BN(srcAmount).times(limitPrice);
  const decimalAdjustment = BN(10).pow(srcTokenDecimals);
  return result.div(decimalAdjustment).toFixed(0);
};

export const getDestTokenMinAmountPerChunk = (srcChunkAmount?: string, limitPrice?: string, isMarketOrder?: boolean, srcTokenDecimals?: number) => {
  if (isMarketOrder || !srcTokenDecimals || !srcChunkAmount || !limitPrice) return BN(0).toString();
  const result = BN(srcChunkAmount).times(BN(limitPrice));
  const decimalAdjustment = BN(10).pow(srcTokenDecimals);
  const adjustedResult = result.div(decimalAdjustment);
  return BN.max(1, adjustedResult).integerValue(BN.ROUND_FLOOR).toFixed(0);
};

export const getTriggerPricePerChunk = (module: Module, srcChunkAmount?: string, triggerPrice?: string, srcTokenDecimals?: number) => {
  if (module === Module.TWAP || module === Module.LIMIT) {
    return "0";
  }

  if (!srcTokenDecimals || !srcChunkAmount || !triggerPrice) return;
  const result = BN(srcChunkAmount).times(BN(triggerPrice));
  const decimalAdjustment = BN(10).pow(srcTokenDecimals);
  const adjustedResult = result.div(decimalAdjustment);
  return BN.max(1, adjustedResult).integerValue(BN.ROUND_FLOOR).toFixed(0) || "0";
};

export const getDuration = (module: Module, chunks: number, fillDelay: TimeDuration, customDuration?: TimeDuration): TimeDuration => {
  const minDuration = getTimeDurationMillis(fillDelay) * 2 * chunks;
  const unit = findTimeUnit(minDuration);

  if (customDuration) {
    return customDuration;
  }

  if (module === Module.LIMIT) {
    return { unit: TimeUnit.Days, value: 7 } as TimeDuration;
  }

  if (module === Module.STOP_LOSS || module === Module.TAKE_PROFIT) {
    return { unit: TimeUnit.Days, value: 30 } as TimeDuration;
  }

  return { unit, value: Number(BN(minDuration / unit).toFixed(2)) };
};

export const getChunks = (maxPossibleChunks: number, module: Module, typedChunks?: number) => {
  if (module !== Module.TWAP) return 1;
  if (typedChunks !== undefined) return typedChunks;
  return maxPossibleChunks;
};
export const getMaxPossibleChunks = (fillDelay: TimeDuration, typedSrcAmount?: string, oneSrcTokenUsd?: string, minChunkSizeUsd?: number) => {
  if (!typedSrcAmount || !oneSrcTokenUsd || !minChunkSizeUsd) return 1;

  const totalUsd = BN(oneSrcTokenUsd).times(typedSrcAmount);

  const maxChunksBySize = totalUsd.div(minChunkSizeUsd).integerValue(BN.ROUND_FLOOR).toNumber();

  const maxChunksByTime = Math.floor(MAX_ORDER_DURATION_MILLIS / 2 / getTimeDurationMillis(fillDelay));

  return Math.max(1, Math.min(maxChunksBySize, maxChunksByTime));
};

export const getMinimumDelayMinutes = (config: Config) => {
  return getEstimatedDelayBetweenChunksMillis(config) / 1000 / 60;
};

export const getDeadline = (currentTimeMillis: number, duration: TimeDuration) => {
  const minute = 60_000;

  return currentTimeMillis + getTimeDurationMillis(duration) + minute;
};

export const getEstimatedDelayBetweenChunksMillis = (config: Config) => {
  return config.bidDelaySeconds * 1000 * 2;
};

export const getSrcTokenChunkAmount = (srcAmount?: string, chunks?: number) => {
  if (!srcAmount || !chunks) return "0";
  return BN(srcAmount).div(chunks).integerValue(BN.ROUND_FLOOR).toFixed(0);
};

// errors
export const getMaxFillDelayError = (fillDelay: TimeDuration, chunks: number) => {
  const isDefault = fillDelay.unit === DEFAULT_FILL_DELAY.unit && fillDelay.value === DEFAULT_FILL_DELAY.value;
  return {
    isError: !isDefault && getTimeDurationMillis(fillDelay) * chunks > MAX_ORDER_DURATION_MILLIS,
    value: Math.floor(MAX_ORDER_DURATION_MILLIS / chunks),
  };
};

export const getStopLossPriceError = (marketPrice = "", triggerPrice = "", module: Module) => {
  if (module === Module.STOP_LOSS) {
    return {
      isError: BN(triggerPrice || 0).gte(BN(marketPrice || 0)),
      value: marketPrice,
    };
  }
};

export const getTakeProfitPriceError = (marketPrice = "", triggerPrice = "", module: Module) => {
  if (module === Module.TAKE_PROFIT) {
    return {
      isError: BN(triggerPrice || 0).lte(BN(marketPrice || 0)),
      value: marketPrice,
    };
  }
};

export const getStopLossLimitPriceError = (triggerPrice = "", limitPrice = "", isMarketOrder = false, module: Module) => {
  if (!isMarketOrder && module === Module.STOP_LOSS) {
    return {
      isError: BN(limitPrice || 0).gte(BN(triggerPrice || 0)),
      value: triggerPrice,
    };
  }
};

export const getTakeProfitLimitPriceError = (triggerPrice = "", limitPrice = "", isMarketOrder = false, module: Module) => {
  if (!isMarketOrder && module === Module.TAKE_PROFIT) {
    return {
      isError: BN(limitPrice || 0).gte(BN(triggerPrice || 0)),
      value: triggerPrice,
    };
  }
};

export const getMaxOrderDurationError = (module: Module, duration: TimeDuration) => {
  if (module === Module.STOP_LOSS || module === Module.TAKE_PROFIT) {
    const max = 90 * 24 * 60 * 60 * 1000; // 3 months
    return {
      isError: getTimeDurationMillis(duration) > max,
      value: max,
    };
  }
  return {
    isError: getTimeDurationMillis(duration) > MAX_ORDER_DURATION_MILLIS, // 365 days
    value: MAX_ORDER_DURATION_MILLIS,
  };
};

export const getMinOrderDurationError = (duration: TimeDuration) => {
  return {
    isError: getTimeDurationMillis(duration) < MIN_ORDER_DURATION_MILLIS,
    value: MIN_ORDER_DURATION_MILLIS,
  };
};

export const getMinFillDelayError = (fillDelay: TimeDuration) => {
  return {
    isError: getTimeDurationMillis(fillDelay) < MIN_FILL_DELAY_MILLIS,
    value: MIN_FILL_DELAY_MILLIS,
  };
};
export const getMinTradeSizeError = (typedSrcAmount: string, oneSrcTokenUsd: string, minChunkSizeUsd: number) => {
  return {
    isError: BN(oneSrcTokenUsd || 0)
      .multipliedBy(typedSrcAmount || 0)
      .isLessThan(minChunkSizeUsd),
    value: minChunkSizeUsd,
  };
};
export const getMaxChunksError = (chunks: number, maxChunks: number, module: Module) => {
  return {
    isError: module === Module.TWAP && BN(chunks).isGreaterThan(maxChunks),
    value: maxChunks,
  };
};

export const getConfig = (chainId?: number, _dex?: Partners): SpotConfig | undefined => {
  try {
    if (!chainId || !_dex) throw new Error("Invalid chainId or _dex");

    const twapConfig = Object.entries(Configs).find(([key, value]) => value.chainId === chainId && key.toLowerCase().indexOf(_dex.toLowerCase()) >= 0)?.[1];
    const dexConfig = Spot.config(chainId, _dex);

    const result = {
      ...dexConfig,
      partner: _dex,
      twapConfig: twapConfig as Config | undefined,
    };

    return result;
  } catch (error) {
    return undefined;
  }
};
