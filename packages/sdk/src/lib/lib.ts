import BN from "bignumber.js";
import { MIN_FILL_DELAY_MINUTES } from "./consts";
import { Config, getAskParamsProps, Module, TimeDuration, TimeUnit } from "./types";
import { findTimeUnit, getTimeDurationMillis } from "./utils";
export const DEFAULT_FILL_DELAY = { unit: TimeUnit.Minutes, value: MIN_FILL_DELAY_MINUTES } as TimeDuration;

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

export const getTriggerPricePerChunk = (srcChunkAmount?: string, triggerPrice?: string, srcTokenDecimals?: number) => {
  if (!srcTokenDecimals || !srcChunkAmount || !triggerPrice) return;
  const result = BN(srcChunkAmount).times(BN(triggerPrice));
  const decimalAdjustment = BN(10).pow(srcTokenDecimals);
  const adjustedResult = result.div(decimalAdjustment);
  return BN.max(1, adjustedResult).integerValue(BN.ROUND_FLOOR).toFixed(0);
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
  if (module === Module.STOP_LOSS || module === Module.LIMIT) return 1;
  if (typedChunks !== undefined) return typedChunks;
  return maxPossibleChunks;
};

export const getMaxPossibleChunks = (config: Config, typedSrcAmount?: string, oneSrcTokenUsd?: string, minChunkSizeUsd?: number) => {
  if (!typedSrcAmount || !oneSrcTokenUsd || !minChunkSizeUsd) return 1;
  const amount = BN(oneSrcTokenUsd).times(typedSrcAmount);

  const res = BN.max(1, amount.div(minChunkSizeUsd)).integerValue(BN.ROUND_FLOOR).toNumber();

  return res > 1 ? res : 1;
};

export const getFillDelay = (customFillDelay?: TimeDuration) => {
  if (customFillDelay) {
    return customFillDelay;
  }

  return DEFAULT_FILL_DELAY;
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

export const getSrcChunkAmount = (srcAmount?: string, chunks?: number) => {
  if (!srcAmount || !chunks) return "0";
  return BN(srcAmount).div(chunks).integerValue(BN.ROUND_FLOOR).toFixed(0);
};

export const getAskParams = (config: Config, args: getAskParamsProps) => {
  const fillDelayMillis = getTimeDurationMillis(args.fillDelay);
  const fillDelaySeconds = (fillDelayMillis - getEstimatedDelayBetweenChunksMillis(config)) / 1000;

  return [
    config.exchangeAddress,
    args.srcTokenAddress,
    args.destTokenAddress,
    BN(args.srcAmount).toFixed(0),
    BN(args.srcChunkAmount).toFixed(0),
    BN(args.destTokenMinAmount).toFixed(0),
    BN(args.deadline).div(1000).toFixed(0),
    BN(config.bidDelaySeconds).toFixed(0),
    BN(fillDelaySeconds).toFixed(0),
    [],
  ].map((it) => it.toString());
};
