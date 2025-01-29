import { Config, TimeDuration, TwapWarning, TwapError, Warnings, Errors } from "./types";
import BN from "bignumber.js";
import { MAX_DURATION_DAYS, MAX_DURATION_MILLIS, MAX_FILL_DELAY_MILLIS, MIN_DURATION_MILLIS, MIN_FILL_DELAY_MILLIS } from "./consts";
import { getTimeDurationMillis, millisToDays, millisToMinutes } from "./utils";

export const getPartialFillWarning = (chunks = 1, duration: TimeDuration, fillDelay: TimeDuration): TwapWarning => {
  const durationMillis = getTimeDurationMillis(duration);
  const fillDelayUiMillis = getTimeDurationMillis(fillDelay);
  const warning = chunks * fillDelayUiMillis > durationMillis;
  if (!warning) return;

  return {
    type: Warnings.PARTIAL_FILL,
    text: `Partial fill warning, the trade will not be fully executed within the selected duration.`,
  };
};

export const getSrcAmountWarning = (srcAmount?: string): TwapError => {
  const warning = BN(srcAmount || 0).isZero();

  if (!warning) return;

  return {
    type: Errors.SRC_AMOUNT,
    text: `Enter a valid amount`,
  };
};

export const getFillDelayWarning = (fillDelay: TimeDuration, isLimitPanel?: boolean): TwapError => {
  return getMinFillDelayWarning(fillDelay, isLimitPanel) || getMaxFillDelayWarning(fillDelay);
};

export const getMinFillDelayWarning = (fillDelay: TimeDuration, isLimitPanel?: boolean): TwapError => {
  const warning = getTimeDurationMillis(fillDelay) < MIN_FILL_DELAY_MILLIS;
  if (!warning || isLimitPanel) return;
  return {
    type: Errors.MIN_FILL_DELAY,
    text: `Min. trade interval is ${millisToMinutes(MIN_FILL_DELAY_MILLIS)} minutes`,
  };
};

export const getMaxFillDelayWarning = (fillDelay: TimeDuration): TwapError => {
  const warning = getTimeDurationMillis(fillDelay) > MAX_FILL_DELAY_MILLIS;

  if (!warning) return;

  return {
    type: Errors.MAX_FILL_DELAY,
    text: `Max. trade interval is ${millisToDays(MAX_FILL_DELAY_MILLIS)} days`,
  };
};

export const getDurationWarning = (duration: TimeDuration, isLimitPanel?: boolean): TwapError => {
  return getMinTradeDurationWarning(duration, isLimitPanel) || getMaxTradeDurationWarning(duration);
};

export const getMinTradeDurationWarning = (duration: TimeDuration, isLimitPanel?: boolean): TwapError => {
  const warning = getTimeDurationMillis(duration) < MIN_DURATION_MILLIS;
  if (!warning || isLimitPanel) return;

  return {
    type: Errors.MIN_TRADE_DURATION,
    text: `Min. expiry is ${millisToMinutes(MIN_DURATION_MILLIS)} minutes`,
  };
};

export const getMaxTradeDurationWarning = (duration: TimeDuration): TwapError => {
  const warning = getTimeDurationMillis(duration) > MAX_DURATION_MILLIS;
  if (!warning) return;

  return {
    type: Errors.MAX_TRADE_DURATION,
    text: `Max. expiry is ${MAX_DURATION_DAYS} days`,
  };
};

export const getLimitPriceWarning = (price?: string): TwapError => {
  const warning = price !== undefined && BN(price || 0).isZero();
  if (!warning) return;

  return {
    type: Errors.LIMIT_PRICE,
    text: `Enter a valid limit price`,
  };
};

export const getChunksWarning = (chunks = 0, maxPossibleChunks: number, isLimitPanel: boolean): TwapError => {
  if (isLimitPanel) return;

  if (BN(chunks).isZero()) {
    return {
      type: Errors.MIN_CHUNKS,
      text: `Enter a valid number of trades amount`,
    };
  }
  if (BN(chunks).isGreaterThan(maxPossibleChunks)) {
    return {
      type: Errors.MAX_CHUNKS,
      text: `Max. number of trades is ${maxPossibleChunks}`,
    };
  }
};

export const getTradeSizeWarning = (minChunkSizeUsd: number, srcChunkAmountUsd?: string | number, chunks = 1): TwapError => {
  if (BN(srcChunkAmountUsd || 0).isZero()) return;
  const minTradeSizeUsd = BN(minChunkSizeUsd);

  const warning = BN(chunks).isZero() || BN(srcChunkAmountUsd || 0).isLessThan(minTradeSizeUsd);
  if (!warning) return;

  return {
    type: Errors.TRADE_SIZE,
    text: `Minimum trade size is ${minTradeSizeUsd.toString()} USD`,
  };
};
