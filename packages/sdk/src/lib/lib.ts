import BN from "bignumber.js";
import { MIN_FILL_DELAY_MINUTES } from "./consts";
import { Config, DerivedSwapValuesArgs, PrepareOrderArgs, PrepareOrderArgsResult, TimeDuration, TimeUnit } from "./types";
import { amountUi, findTimeUnit, getTimeDurationMillis } from "./utils";
import { getChunksWarning, getDurationWarning, getFillDelayWarning, getPartialFillWarning, getSrcAmountWarning, getLimitPriceWarning, getTradeSizeWarning } from "./warnings";
export const DEFAULT_FILL_DELAY = { unit: TimeUnit.Minutes, value: MIN_FILL_DELAY_MINUTES } as TimeDuration;

export const getDestTokenAmount = (srcAmount?: string, limitPrice?: string, srcDecimals?: number, destDecimals?: number) => {
  if (!srcAmount || !limitPrice || !srcDecimals || !destDecimals) return undefined;

  let result = BN(srcAmount).times(limitPrice);
  const decimalAdjustment = BN(10).pow(srcDecimals);
  return result.div(decimalAdjustment).toFixed(0);
};

export const getDestTokenMinAmount = (srcChunkAmount?: string, limitPrice?: string, isMarketOrder?: boolean, srcDecimals?: number, destDecimals?: number) => {
  if (isMarketOrder || !srcDecimals || !destDecimals || !srcChunkAmount || !limitPrice) return BN(1).toString();
  const result = BN(srcChunkAmount).times(BN(limitPrice));
  const decimalAdjustment = BN(10).pow(srcDecimals);
  const adjustedResult = result.div(decimalAdjustment);
  return BN.max(1, adjustedResult).integerValue(BN.ROUND_FLOOR).toFixed(0);
};

export const getDuration = (chunks: number, fillDelay: TimeDuration, customDuration?: TimeDuration): TimeDuration => {
  const minDuration = getTimeDurationMillis(fillDelay) * 2 * chunks;
  const unit = findTimeUnit(minDuration);

  return customDuration || { unit, value: Number(BN(minDuration / unit).toFixed(2)) };
};

export const getChunks = (maxPossibleChunks: number, isLimitPanel = false, typedChunks?: number) => {
  if (isLimitPanel) return 1;
  if (typedChunks !== undefined) return typedChunks;
  return maxPossibleChunks;
};

export const getMaxPossibleChunks = (config: Config, srcAmount?: string, oneSrcTokenUsd?: string | number, srcDecimals?: number) => {
  if (!srcAmount || !oneSrcTokenUsd || !srcDecimals) return 1;
  const normalizedSrcAmount = BN(srcAmount).div(BN(10).pow(srcDecimals));

  const amount = BN(oneSrcTokenUsd).times(normalizedSrcAmount);

  const res = BN.max(1, amount.div(config.minChunkSizeUsd)).integerValue(BN.ROUND_FLOOR).toNumber();

  return res > 1 ? res : 1;
};

export const getFillDelay = (isLimitPanel = false, customFillDelay?: TimeDuration) => {
  if (isLimitPanel || !customFillDelay) return DEFAULT_FILL_DELAY;
  return customFillDelay;
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

export const prepareOrderArgs = (config: Config, args: PrepareOrderArgs) => {
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

export const derivedSwapValues = (
  config: Config,
  minChunkSizeUsd: number,
  { srcAmount, oneSrcTokenUsd, customChunks, isLimitPanel, srcDecimals, customFillDelay, customDuration, limitPrice, destDecimals, isMarketOrder }: DerivedSwapValuesArgs,
) => {
  const maxPossibleChunks = getMaxPossibleChunks(config, srcAmount, oneSrcTokenUsd, srcDecimals);
  const chunks = getChunks(maxPossibleChunks, isLimitPanel, customChunks);
  const srcChunkAmount = getSrcChunkAmount(srcAmount, chunks);
  const fillDelay = getFillDelay(isLimitPanel, customFillDelay);
  const duration = getDuration(chunks, fillDelay, customDuration);
  const destTokenMinAmount = getDestTokenMinAmount(srcChunkAmount, limitPrice, isMarketOrder, srcDecimals, destDecimals);
  const srcChunkAmountUsd = BN(srcChunkAmount)
    .times(oneSrcTokenUsd || 0)
    .toFixed(0);

  const errors = {
    fillDelay: getFillDelayWarning(fillDelay, isLimitPanel),
    tradeSize: getTradeSizeWarning(minChunkSizeUsd, amountUi(srcDecimals, srcChunkAmountUsd), chunks),
    srcAmount: getSrcAmountWarning(srcAmount),
    limitPrice: getLimitPriceWarning(limitPrice),
    chunks: getChunksWarning(chunks, maxPossibleChunks, Boolean(isLimitPanel), srcAmount),
    duration: getDurationWarning(duration, isLimitPanel),
  };

  return {
    chunks,
    duration,
    fillDelay,
    srcChunkAmount,
    destTokenMinAmount,
    destTokenAmount: getDestTokenAmount(srcAmount, limitPrice, srcDecimals, destDecimals),
    maxPossibleChunks,
    errors: {
      ...errors,
      hasErrors: Object.values(errors).some(Boolean),
    },

    warnings: {
      partialFill: getPartialFillWarning(chunks, duration, fillDelay),
    },
  };
};

export type DerivedSwapValues = ReturnType<typeof derivedSwapValues>;
