import { Config, TimeDuration } from "./types";
import BN from "bignumber.js";
import { MAX_DURATION_MILLIS, MAX_FILL_DELAY_MILLIS, MIN_DURATION_MILLIS, MIN_FILL_DELAY_MILLIS } from "./consts";
import { getTimeDurationMillis } from "./utils";

export const getPartialFillWarning = (chunks = 1, duration: TimeDuration, fillDelay: TimeDuration) => {
  const durationMillis = getTimeDurationMillis(duration);
  const fillDelayUiMillis = getTimeDurationMillis(fillDelay);
  return chunks * fillDelayUiMillis > durationMillis;
};

export const getMinFillDelayWarning = (fillDelay: TimeDuration) => {
  return getTimeDurationMillis(fillDelay) < MIN_FILL_DELAY_MILLIS;
};

export const getMaxFillDelayWarning = (fillDelay: TimeDuration) => {
  return getTimeDurationMillis(fillDelay) > MAX_FILL_DELAY_MILLIS;
};

export const getMinTradeDurationWarning = (duration: TimeDuration) => {
  return getTimeDurationMillis(duration) < MIN_DURATION_MILLIS;
};

export const getMaxTradeDurationWarning = (duration: TimeDuration) => {
  return getTimeDurationMillis(duration) > MAX_DURATION_MILLIS;
};

export const getTradeSizeWarning = (minChunkSizeUsd: number, srcChunkAmountUsd?: string | number, chunks = 1) => {
  if (BN(srcChunkAmountUsd || 0).isZero()) return;
  const minTradeSizeUsd = BN(minChunkSizeUsd);

  return BN(chunks).isZero() || BN(srcChunkAmountUsd || 0).isLessThan(minTradeSizeUsd);
};
