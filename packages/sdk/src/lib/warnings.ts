import { MIN_TRADE_INTERVAL, MAX_TRADE_INTERVAL } from "./consts";
import { Config, Duration } from "./types";
import BN from "bignumber.js";
import { getDurationMillis } from "./lib";

export const getPartialFillWarning = (chunks = 1, durationMillis: number, fillDelayUiMillis: number) => {
  return chunks * fillDelayUiMillis > durationMillis;
};

export const getMinFillDelayWarning = (fillDelay: Duration) => {
  return getDurationMillis(fillDelay) < MIN_TRADE_INTERVAL;
};

export const getMaxFillDelayWarning = (fillDelay: Duration) => {
  return getDurationMillis(fillDelay) > MAX_TRADE_INTERVAL;
};

export const getMinTradeDurationWarning = (duration: Duration) => {
  return getDurationMillis(duration) < MIN_TRADE_INTERVAL;
};

export const getMaxTradeDurationWarning = (duration: Duration) => {
  return getDurationMillis(duration) > MAX_TRADE_INTERVAL;
};

export const getTradeSizeWarning = (config: Config, srcChunkAmountUsd = "", chunks = 1) => {
  if (!srcChunkAmountUsd) return;
  const minTradeSizeUsd = BN(config.minChunkSizeUsd || 0);
  return BN(chunks).isZero() || BN(srcChunkAmountUsd || 0).isLessThan(minTradeSizeUsd);
};

export const getLowLimitPriceWarning = (isLimitPanel?: boolean, priceDeltaPercentage = "", isInvertedLimitPrice = false) => {
  if (!isLimitPanel || !priceDeltaPercentage) return;
  return isInvertedLimitPrice ? BN(priceDeltaPercentage).isGreaterThan(0) : BN(priceDeltaPercentage).isLessThan(0);
};
