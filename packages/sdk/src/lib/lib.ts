import { MIN_FILL_DELAY_MINUTES } from "./consts";
import { Config, DerivedSwapValuesArgs, DerivedSwapValuesResponse, PrepareOrderArgs, PrepareOrderArgsResult, TimeDuration, TimeUnit } from "./types";
import { BigintMax, BigintToNum, findTimeUnit, getTimeDurationMillis } from "./utils";
import { getMaxFillDelayWarning, getMaxTradeDurationWarning, getMinFillDelayWarning, getMinTradeDurationWarning, getPartialFillWarning, getTradeSizeWarning } from "./warnings";
export const DEFAULT_FILL_DELAY = { unit: TimeUnit.Minutes, value: MIN_FILL_DELAY_MINUTES } as TimeDuration;

export const getDestTokenAmount = (srcAmount?: bigint, limitPrice?: bigint, srcDecimals?: number, destDecimals?: number) => {
  if (!srcAmount || !limitPrice || !srcDecimals || !destDecimals) return undefined;

  const result = srcAmount * limitPrice;
  return result / BigInt(10 ** srcDecimals);
};

export const getDestTokenMinAmount = (srcChunkAmount?: bigint, limitPrice?: bigint, isMarketOrder?: boolean, srcDecimals?: number, destDecimals?: number) => {
  if (isMarketOrder || !srcDecimals || !destDecimals || !srcChunkAmount || !limitPrice) return BigInt(1);
  const result = srcChunkAmount * limitPrice;
  const adjustedResult = result / BigInt(10 ** srcDecimals);
  return BigintMax(BigInt(1), adjustedResult);
};

export const getDuration = (chunks: number, fillDelay: TimeDuration, customDuration?: TimeDuration): TimeDuration => {
  const minDuration = getTimeDurationMillis(fillDelay) * 2 * chunks;
  const unit = findTimeUnit(minDuration);
  return customDuration || { unit, value: Number((minDuration / unit).toFixed(2)) };
};

export const getChunks = (maxPossibleChunks: number, isLimitPanel = false, typedChunks?: number) => {
  if (isLimitPanel) return 1;
  if (typedChunks !== undefined) return typedChunks;
  return maxPossibleChunks;
};

export const getMaxPossibleChunks = (config: Config, srcAmount?: bigint, oneSrcTokenUsd?: string | number, srcDecimals?: number) => {
  if (!srcAmount || !oneSrcTokenUsd || !srcDecimals) return 1;
  const normalizedSrcAmount = BigintToNum(srcAmount, srcDecimals);

  const amount = Number(oneSrcTokenUsd) * normalizedSrcAmount;
  console.log({ amount: amount.toString() });

  const res = Math.floor(Math.max(1, amount / config.minChunkSizeUsd));

  return res > 1 ? res : 1;
};

export const getFillDelay = (isLimitPanel = false, customFillDelay?: TimeDuration) => {
  if (isLimitPanel || !customFillDelay) return DEFAULT_FILL_DELAY;
  return customFillDelay;
};

export const getMinimumDelayMinutes = (config: Config) => {
  return getEstimatedDelayBetweenChunksMillis(config) / 1000 / 60;
};

export const getDeadline = (duration: TimeDuration) => {
  const minute = 60_000;
  return Date.now() + getTimeDurationMillis(duration) + minute;
};

export const getEstimatedDelayBetweenChunksMillis = (config: Config) => {
  return config.bidDelaySeconds * 1000 * 2;
};

export const getSrcChunkAmount = (srcAmount?: bigint, chunks?: number) => {
  if (!srcAmount || !chunks) return BigInt(0);
  return srcAmount / BigInt(chunks);
};

export const getSrcChunkAmountUsd = (srcChunkAmount?: bigint, oneSrcTokenUsd?: string | number, srcDecimals?: number) => {
  if (!srcChunkAmount || !oneSrcTokenUsd || !srcDecimals) return 0;
  const normalizedSrcChunkAmount = BigintToNum(srcChunkAmount, srcDecimals);

  const amount = Number(oneSrcTokenUsd) * normalizedSrcChunkAmount;
  return amount;
};

export const prepareOrderArgs = (config: Config, args: PrepareOrderArgs): PrepareOrderArgsResult => {
  const fillDelayMillis = getTimeDurationMillis(args.fillDelay);
  const fillDelaySeconds = (fillDelayMillis - getEstimatedDelayBetweenChunksMillis(config)) / 1000;

  return [
    config.exchangeAddress,
    args.srcTokenAddress,
    args.destTokenAddress,
    Number(args.srcAmount).toFixed(0),
    Number(args.srcChunkAmount).toFixed(0),
    Number(args.destTokenMinAmount).toFixed(0),
    (Number(args.deadline) / 1000).toFixed(0),
    Number(config.bidDelaySeconds).toFixed(0),
    Number(fillDelaySeconds).toFixed(0),
    [],
  ];
};

export const derivedSwapValues = (
  config: Config,
  { srcAmount, oneSrcTokenUsd, customChunks, isLimitPanel, srcDecimals, customFillDelay, customDuration, limitPrice, destDecimals, isMarketOrder }: DerivedSwapValuesArgs
): DerivedSwapValuesResponse => {
  const maxPossibleChunks = getMaxPossibleChunks(config, srcAmount, oneSrcTokenUsd, srcDecimals);
  const chunks = getChunks(maxPossibleChunks, isLimitPanel, customChunks);
  const srcChunkAmount = getSrcChunkAmount(srcAmount, chunks);
  const fillDelay = getFillDelay(isLimitPanel, customFillDelay);
  const duration = getDuration(chunks, fillDelay, customDuration);
  const deadline = getDeadline(duration);
  const destTokenMinAmount = getDestTokenMinAmount(srcChunkAmount, limitPrice, isMarketOrder, srcDecimals, destDecimals);
  const srcChunkAmountUsd = getSrcChunkAmountUsd(srcChunkAmount, oneSrcTokenUsd, srcDecimals);
  return {
    chunks,
    duration,
    deadline,
    fillDelay,
    srcChunkAmount,
    destTokenMinAmount,
    destTokenAmount: getDestTokenAmount(srcAmount, limitPrice, srcDecimals, destDecimals),
    maxPossibleChunks,
    warnings: {
      partialFill: getPartialFillWarning(chunks, duration, fillDelay),
      minFillDelay: getMinFillDelayWarning(fillDelay),
      maxFillDelay: getMaxFillDelayWarning(fillDelay),
      minDuration: getMinTradeDurationWarning(duration),
      maxDuration: getMaxTradeDurationWarning(duration),
      tradeSize: !!getTradeSizeWarning(config, srcChunkAmountUsd, chunks),
    },
  };
};
