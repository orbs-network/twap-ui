import TwapAbi from "@orbs-network/twap/twap.abi.json";
import BN from "bignumber.js";
import { MIN_FILL_DELAY_MINUTES } from "./consts";
import { Config, TimeDuration, TimeUnit, Token } from "./types";
import { convertDecimals, findTimeUnit, getTimeDurationMillis, parsebn } from "./utils";

export const DEFAULT_FILL_DELAY = { unit: TimeUnit.Minutes, value: MIN_FILL_DELAY_MINUTES } as TimeDuration;

export const getDstTokenMinAmount = (srcToken?: Token, dstToken?: Token, srcChunkAmount?: string, limitPrice?: string, isMarketOrder?: boolean) => {
  let amount = BN(1).toString();
  if (srcChunkAmount && !isMarketOrder && srcToken && dstToken && BN(limitPrice || "0").gt(0)) {
    amount = BN.max(1, convertDecimals(BN(srcChunkAmount).times(parsebn(limitPrice || "0")), srcToken.decimals, dstToken.decimals).integerValue(BN.ROUND_FLOOR)).toString();
  }
  return amount;
};

export const getDstTokenAmount = (typedValue?: string, limitPrice?: string) => {
  if (!limitPrice || !typedValue) {
    return undefined;
  }
  return BN(limitPrice).multipliedBy(typedValue).decimalPlaces(0).toString();
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

export const getMaxPossibleChunks = (config: Config, srcAmountUi?: string, oneSrcTokenUsd?: string | number) => {
  if (!config || !srcAmountUi || !oneSrcTokenUsd) return 1;

  const res = BN.max(1, BN(srcAmountUi).div(config.minChunkSizeUsd).times(oneSrcTokenUsd)).integerValue(BN.ROUND_FLOOR).toNumber();

  return res > 1 ? res : 1;
};

export const getFillDelay = (isLimitPanel?: boolean, customFillDelay?: TimeDuration) => {
  if (isLimitPanel || !customFillDelay) {
    return DEFAULT_FILL_DELAY;
  }
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

export const getSrcChunkAmountUsd = (srcChunkAmount?: string, oneSrcTokenUsd?: string | number) => {
  if (!srcChunkAmount || !oneSrcTokenUsd) return "0";
  return BN(srcChunkAmount || 0)
    .times(oneSrcTokenUsd)
    .toString();
};

export const getEstimatedDelayBetweenChunksMillis = (config?: Config) => {
  if (!config) return 0;
  return config.bidDelaySeconds * 1000 * 2;
};

export const getSrcChunkAmount = (srcAmount = "", chunks = 1) => {
  if (!srcAmount) {
    return "0";
  }
  return BN(srcAmount).div(chunks).integerValue(BN.ROUND_FLOOR).toString();
};

export const getIsMarketOrder = (isLimitPanel?: boolean, isMarketOrder?: boolean) => {
  return isLimitPanel ? false : isMarketOrder;
};

export const getCreateOrderParams = (args: {
  config: Config;
  dstTokenMinAmount: string;
  srcChunkAmount: string;
  deadlineMillis: number;
  fillDelayMillis: number;
  srcAmount: string;
  srcTokenAddress: string;
  dstTokenAddress: string;
}) => {
  const fillDelaySeconds = (args.fillDelayMillis - getEstimatedDelayBetweenChunksMillis(args.config)) / 1000;

  const values = [
    args.config.exchangeAddress,
    args.srcTokenAddress,
    args.dstTokenAddress,
    BN(args.srcAmount).toFixed(0),
    BN(args.srcChunkAmount).toFixed(0),
    BN(args.dstTokenMinAmount).toFixed(0),
    BN(args.deadlineMillis).div(1000).toFixed(0),
    BN(args.config.bidDelaySeconds).toFixed(0),
    BN(fillDelaySeconds).toFixed(0),
    [],
  ];

  return {
    contractAddress: args.config.twapAddress,
    Abi: TwapAbi,
    values,
  };
};

export const getCancelOrderParams = async (config: Config, orderId: number) => {
  return {
    contractAddress: config.twapAddress,
    Abi: TwapAbi,
    value: orderId,
  };
};
