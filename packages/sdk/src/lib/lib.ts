import { convertDecimals, erc20, isNativeAddress, parsebn } from "@defi.org/web3-candies";
import BN from "bignumber.js";
import moment from "moment";
import { MIN_TRADE_INTERVAL_FORMATTED } from "../consts";
import { Config, Duration, TimeResolution, Token } from "../types";
import { amountBN, getNetwork } from "../utils";

export const DEFAULT_FILL_DELAY = { resolution: TimeResolution.Minutes, amount: MIN_TRADE_INTERVAL_FORMATTED } as Duration;

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

export const getMinDuration = (chunks = 1, fillDelayMillis = 0) => {
  const _millis = fillDelayMillis * 2 * chunks;
  const resolution = [TimeResolution.Days, TimeResolution.Hours, TimeResolution.Minutes].find((r) => r <= _millis) || TimeResolution.Minutes;
  const duration = { resolution, amount: Number(BN(_millis / resolution).toFixed(2)) };

  return {
    duration: duration,
    millis: duration.amount * duration.resolution,
  };
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

export const getFillDelay = (isLimitPanel?: boolean, typedFillDelay?: Duration) => {
  if (isLimitPanel || !typedFillDelay) {
    return {
      duration: DEFAULT_FILL_DELAY,
      millis: DEFAULT_FILL_DELAY.amount * DEFAULT_FILL_DELAY.resolution,
    };
  }
  return {
    duration: typedFillDelay,
    millis: typedFillDelay.amount * typedFillDelay.resolution,
  };
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

export const getDuration = (minDuration: Duration, typedDuration?: Duration) => {
  const duration = typedDuration || minDuration;

  return {
    duration,
    millis: duration?.amount * duration?.resolution,
  };
};

export const getDeadline = (durationMillis: number) => {
  return moment().add(durationMillis).add(1, "minute").valueOf();
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

export const getSwapData = (args: {
  srcAmount: string;
  srcAmountUi?: string;
  chunks?: number;
  config: Config;
  oneSrcTokenUsd?: string | number;
  isLimitPanel?: boolean;
  fillDelay?: Duration;
  duration?: Duration;
  limitPrice?: string;
  srcToken?: Token;
  dstToken?: Token;
  isMaketOrder?: boolean;
  marketPrice?: string;
  isLimitPriceInverted?: boolean;
}) => {
  const maxPossibleChunks = getMaxPossibleChunks(args.config, args.srcAmountUi, args.oneSrcTokenUsd);
  const chunks = getChunks(1, args.chunks, args.isLimitPanel);
  const srcChunkAmount = getSrcChunkAmount(args.srcAmount, chunks);
  const srcChunkAmountUsd = getSrcChunkAmountUsd(srcChunkAmount, args.oneSrcTokenUsd);
  const fillDelay = getFillDelay(args.isLimitPanel, args.fillDelay);
  const minDuration = getMinDuration(chunks, fillDelay.millis);
  const duration = getDuration(minDuration.duration, args.duration);
  const deadline = getDeadline(duration.millis);
  const dstAmount = getDstTokenAmount(args.srcAmountUi, args.limitPrice);
  const dstTokenMinAmount = getDstTokenMinAmount(args.srcToken, args.dstToken, srcChunkAmount, args.limitPrice, args.isMaketOrder);
  const priceDeltaPercentage = getLimitPricePercentDiffFromMarket(args.limitPrice, args.marketPrice, args.isLimitPriceInverted);
  return {
    maxPossibleChunks,
    chunks,
    srcChunkAmount,
    srcChunkAmountUsd,
    fillDelay,
    minDuration,
    duration,
    deadline,
    dstAmount,
    dstTokenMinAmount,
    priceDeltaPercentage,
  };
};

export const getHasAllowance = async (args: { srcToken: Token; config: Config; account: string; srcAmount: string }) => {
  const wToken = getNetwork(args.config.chainId)?.wToken;

  if (!wToken) {
    throw new Error("wToken not found");
  }
  const token = isNativeAddress(args.srcToken.address) ? wToken : args.srcToken;
  const contract = erc20(token.symbol, token.address, token.decimals);
  const allowance = BN(await contract.methods.allowance(args.account, args.config.twapAddress).call());
  return allowance.gte(args.srcAmount);
};

export const getIsMarketOrder = (isLimitPanel?: boolean, isMarketOrder?: boolean) => {
  return isLimitPanel ? false : isMarketOrder;
};
