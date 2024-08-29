import { useMemo } from "react";
import { MIN_TRADE_INTERVAL, MAX_TRADE_INTERVAL } from "../consts";
import { Config, Duration, Token } from "../types";
import BN from "bignumber.js";

export const getPartialFillWarning = (chunks = 1, durationMillis: number, fillDelayUiMillis: number) => {
  return chunks * fillDelayUiMillis > durationMillis;
};

export const getMinFillDelayWarning = (fillDelayMillis: number) => {
  return fillDelayMillis < MIN_TRADE_INTERVAL;
};

export const getMaxFillDelayWarning = (fillDelayMillis: number) => {
  return fillDelayMillis > MAX_TRADE_INTERVAL;
};

export const getMinTradeDurationWarning = (durationMillis: number) => {
  return durationMillis < MIN_TRADE_INTERVAL;
};

export const getMaxTradeDurationWarning = (durationMillis: number) => {
  return durationMillis > MAX_TRADE_INTERVAL;
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

export const getWarnings = ({
  chunks,
  fillDelayMillis,
  durationMillis,
  srcChunkAmountUsd,
  config,
  priceDeltaPercentage,
  isLimitPanel,
  isLimitPriceInverted,
}: {
  chunks: number;
  durationMillis: number;
  fillDelayMillis: number;
  srcChunkAmountUsd: string;
  config: Config;
  priceDeltaPercentage: string;
  isLimitPanel?: boolean;
  isLimitPriceInverted?: boolean;
}) => {
  return {
    partialFill: getPartialFillWarning(chunks, durationMillis, fillDelayMillis),
    minFillDelay: getMinFillDelayWarning(fillDelayMillis),
    maxFillDelay: getMaxFillDelayWarning(fillDelayMillis),
    minTradeDuration: getMinTradeDurationWarning(durationMillis),
    maxTradeDuration: getMaxTradeDurationWarning(durationMillis),
    tradeSize: getTradeSizeWarning(config, srcChunkAmountUsd, chunks),
    lowLimitPrice: getLowLimitPriceWarning(isLimitPanel, priceDeltaPercentage, isLimitPriceInverted),
  };
};
