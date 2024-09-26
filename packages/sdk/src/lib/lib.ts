import BN from "bignumber.js";
import { MIN_FILL_DELAY_MINUTES } from "./consts";
import { Config, GetAskValuesArgs, GetSwapValuesArgs, TimeDuration, TimeUnit } from "./types";
import { amountUi, convertDecimals, findTimeUnit, getTimeDurationMillis, parsebn, safeInteger } from "./utils";
import { getMaxFillDelayWarning, getMaxTradeDurationWarning, getMinFillDelayWarning, getMinTradeDurationWarning, getPartialFillWarning, getTradeSizeWarning } from "./warnings";
export const DEFAULT_FILL_DELAY = { unit: TimeUnit.Minutes, value: MIN_FILL_DELAY_MINUTES } as TimeDuration;

export const getDstTokenMinAmount = (srcChunkAmount = "", typedLimitPrice = "", isMarketOrder = false, srcTokenDecimals?: number, dstTokenDecimals?: number) => {
  if (!srcChunkAmount || isMarketOrder || !srcTokenDecimals || !dstTokenDecimals || !typedLimitPrice) {
    return BN(1).toString();
  }
  const convertedAmount = convertDecimals(BN(srcChunkAmount), srcTokenDecimals, dstTokenDecimals);
  return BN.max(1, BN(convertedAmount.times(parsebn(typedLimitPrice || "0"))).integerValue(BN.ROUND_FLOOR)).toString();
};

export const getDuration = (chunks = 1, fillDelay?: TimeDuration, customDuration?: TimeDuration): TimeDuration => {
  const minDuration = getTimeDurationMillis(fillDelay) * 2 * chunks;
  const unit = findTimeUnit(minDuration);
  return customDuration || { unit, value: Number(BN(minDuration / unit).toFixed(2)) };
};

export const getChunks = (maxPossibleChunks = 1, typedChunks?: number, isLimitPanel?: boolean) => {
  if (isLimitPanel) return 1;
  if (typedChunks !== undefined) return typedChunks;
  return maxPossibleChunks;
};

export const getMaxPossibleChunks = (config: Config, typedSrcAmount?: string, oneSrcTokenUsd?: string | number) => {
  if (!config || !typedSrcAmount || !oneSrcTokenUsd) return 1;

  const res = BN.max(1, BN(typedSrcAmount).div(config.minChunkSizeUsd).times(oneSrcTokenUsd)).integerValue(BN.ROUND_FLOOR).toNumber();

  return res > 1 ? res : 1;
};

export const getFillDelay = (customFillDelay?: TimeDuration, isLimitPanel?: boolean) => {
  if (isLimitPanel || !customFillDelay) return DEFAULT_FILL_DELAY;
  return customFillDelay;
};

export const getMinimumDelayMinutes = (config?: Config) => {
  return getEstimatedDelayBetweenChunksMillis(config) / 1000 / 60;
};

export const getDeadline = (duration: TimeDuration) => {
  const minute = 60_000;
  return Date.now() + getTimeDurationMillis(duration) + minute;
};

export const getEstimatedDelayBetweenChunksMillis = (config?: Config) => {
  return !config ? 0 : config.bidDelaySeconds * 1000 * 2;
};

export const getSrcChunkAmount = (srcAmount = "", chunks = 1) => {
  if (BN(srcAmount || 0).isZero() || BN(chunks || 0).isZero()) return "0";
  return BN(srcAmount).div(chunks).integerValue(BN.ROUND_FLOOR).toFixed();
};

export const getCreateOrderArgs = (args: GetAskValuesArgs, config: Config) => {
  const fillDelayMillis = getTimeDurationMillis(args.fillDelay);
  const fillDelaySeconds = (fillDelayMillis - getEstimatedDelayBetweenChunksMillis(config)) / 1000;

  return [
    config.exchangeAddress,
    args.srcTokenAddress,
    args.dstTokenAddress,
    BN(args.srcAmount).toFixed(0),
    BN(args.srcChunkAmount).toFixed(0),
    BN(args.dstTokenMinAmount).toFixed(0),
    BN(args.deadline).div(1000).toFixed(0),
    BN(config.bidDelaySeconds).toFixed(0),
    BN(fillDelaySeconds).toFixed(0),
    [],
  ];
};

export const getSwapValues = (
  { srcAmount, oneSrcTokenUsd, customChunks, isLimitPanel, srcDecimals, customFillDelay, customDuration, limitPrice, dstDecimals, isMarketOrder }: GetSwapValuesArgs,
  config: Config
) => {
  const srcAmountUi = amountUi(srcDecimals, srcAmount);
  const maxPossibleChunks = getMaxPossibleChunks(config, srcAmountUi, oneSrcTokenUsd);
  const chunks = getChunks(maxPossibleChunks, customChunks, isLimitPanel);
  const srcChunkAmount = getSrcChunkAmount(srcAmount, chunks);
  const fillDelay = getFillDelay(customFillDelay, isLimitPanel);
  const duration = getDuration(chunks, fillDelay, customDuration);
  const deadline = getDeadline(duration);
  const dstTokenMinAmount = getDstTokenMinAmount(srcChunkAmount, limitPrice, isMarketOrder, srcDecimals, dstDecimals);
  const srcChunkAmountUsd = BN(srcChunkAmount)
    .times(oneSrcTokenUsd || 0)
    .toFixed(0);
  return {
    chunks,
    duration,
    deadline,
    fillDelay,
    srcChunkAmount,
    dstTokenMinAmount,
    warnings: {
      partialFill: getPartialFillWarning(chunks, duration, fillDelay),
      minFillDelay: getMinFillDelayWarning(fillDelay),
      maxFillDelay: getMaxFillDelayWarning(fillDelay),
      minDuration: getMinTradeDurationWarning(duration),
      maxDuration: getMaxTradeDurationWarning(duration),
      tradeSize: getTradeSizeWarning(config, srcChunkAmountUsd, chunks),
    },
  };
};

// export const getLimitPricePercentDiffFromMarket = (limitPrice?: string, marketPrice?: string, isLimitPriceInverted?: boolean) => {
//   if (!limitPrice || !marketPrice || BN(limitPrice).isZero() || BN(limitPrice).isZero()) return "0";
//   const from = isLimitPriceInverted ? marketPrice : limitPrice;
//   const to = isLimitPriceInverted ? limitPrice : marketPrice;
//   return BN(from).div(to).minus(1).multipliedBy(100).decimalPlaces(2, BN.ROUND_HALF_UP).toFixed();
// };
