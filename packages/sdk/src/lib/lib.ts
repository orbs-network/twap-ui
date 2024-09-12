import BN from "bignumber.js";
import { MIN_FILL_DELAY_MINUTES } from "./consts";
import { Config, TimeDuration, TimeUnit } from "./types";
import { convertDecimals, findTimeUnit, getTimeDurationMillis, parsebn } from "./utils";
export const DEFAULT_FILL_DELAY = { unit: TimeUnit.Minutes, value: MIN_FILL_DELAY_MINUTES } as TimeDuration;

export const getDstTokenMinAmount = (srcTokenDecimals: number, dstTokenDecimals: number, srcChunkAmount = "", limitPrice = "", isMarketOrder = false) => {
  let amount = BN(1).toString();
  if (srcChunkAmount && !isMarketOrder && srcTokenDecimals && dstTokenDecimals && BN(limitPrice || "0").gt(0)) {
    amount = BN.max(1, convertDecimals(BN(srcChunkAmount).times(parsebn(limitPrice || "0")), srcTokenDecimals, dstTokenDecimals).integerValue(BN.ROUND_FLOOR)).toString();
  }
  return amount;
};

export const getDstTokenAmount = (typedValue?: string, limitPrice?: string) => {
  if (!limitPrice || !typedValue) return undefined;
  return BN(limitPrice).multipliedBy(typedValue).decimalPlaces(0).toString();
};

export const getDuration = (chunks = 1, fillDelay?: TimeDuration, customDuration?: TimeDuration, isLimitPanel?: boolean): TimeDuration => {
  if (isLimitPanel) return { unit: TimeUnit.Days, value: 7 };
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

export const getFillDelay = (isLimitPanel?: boolean, customFillDelay?: TimeDuration) => {
  if (isLimitPanel || !customFillDelay) return DEFAULT_FILL_DELAY;
  return customFillDelay;
};

export const getMinimumDelayMinutes = (config?: Config) => {
  return getEstimatedDelayBetweenChunksMillis(config) / 1000 / 60;
};

export const getLimitPricePercentDiffFromMarket = (limitPrice?: string, marketPrice?: string, isLimitPriceInverted?: boolean) => {
  if (!limitPrice || !marketPrice || BN(limitPrice).isZero() || BN(limitPrice).isZero()) return "0";
  const from = isLimitPriceInverted ? marketPrice : limitPrice;
  const to = isLimitPriceInverted ? limitPrice : marketPrice;
  return BN(from).div(to).minus(1).multipliedBy(100).decimalPlaces(2, BN.ROUND_HALF_UP).toString();
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
  return BN(srcAmount).div(chunks).integerValue(BN.ROUND_FLOOR).toString();
};

export const getIsMarketOrder = (isLimitPanel?: boolean, isMarketOrder?: boolean) => {
  return isLimitPanel ? false : isMarketOrder;
};

export const getAskParams = (args: {
  config: Config;
  dstTokenMinAmount: string;
  srcChunkAmount: string;
  deadline: number;
  fillDelay: TimeDuration;
  srcAmount: string;
  srcTokenAddress: string;
  dstTokenAddress: string;
}) => {
  const fillDelayMillis = getTimeDurationMillis(args.fillDelay);
  const fillDelaySeconds = (fillDelayMillis - getEstimatedDelayBetweenChunksMillis(args.config)) / 1000;

  return [
    args.config.exchangeAddress,
    args.srcTokenAddress,
    args.dstTokenAddress,
    BN(args.srcAmount).toFixed(0),
    BN(args.srcChunkAmount).toFixed(0),
    BN(args.dstTokenMinAmount).toFixed(0),
    BN(args.deadline).div(1000).toFixed(0),
    BN(args.config.bidDelaySeconds).toFixed(0),
    BN(fillDelaySeconds).toFixed(0),
    [],
  ];
};
