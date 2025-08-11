import BN from "bignumber.js";
import { EXCLUSIVITY_OVERRIDE_BPS, EXECUTOR_ADDRESS, maxUint256, MIN_FILL_DELAY_MINUTES, REACTOR_ADDRESS, REPERMIT_ADDRESS } from "./consts";
import { Address, Config, getAskParamsProps, GetPermitDataProps, Module, RePermitTypedData, TimeDuration, TimeUnit } from "./types";
import { findTimeUnit, getNetwork, getTimeDurationMillis, isNativeAddress, safeBNString } from "./utils";
export const DEFAULT_FILL_DELAY = { unit: TimeUnit.Minutes, value: MIN_FILL_DELAY_MINUTES } as TimeDuration;

export const getDestTokenAmount = (srcAmount?: string, limitPrice?: string, srcTokenDecimals?: number) => {
  if (!srcAmount || !limitPrice || !srcTokenDecimals) return undefined;

  const result = BN(srcAmount).times(limitPrice);
  const decimalAdjustment = BN(10).pow(srcTokenDecimals);
  return result.div(decimalAdjustment).toFixed(0);
};

export const getDestTokenMinAmountPerChunk = (srcChunkAmount?: string, limitPrice?: string, isMarketOrder?: boolean, srcTokenDecimals?: number) => {
  if (isMarketOrder || !srcTokenDecimals || !srcChunkAmount || !limitPrice) return BN(0).toString();
  const result = BN(srcChunkAmount).times(BN(limitPrice));
  const decimalAdjustment = BN(10).pow(srcTokenDecimals);
  const adjustedResult = result.div(decimalAdjustment);
  return BN.max(1, adjustedResult).integerValue(BN.ROUND_FLOOR).toFixed(0);
};

export const getTriggerPricePerChunk = (srcChunkAmount?: string, triggerPrice?: string, srcTokenDecimals?: number) => {
  if (!srcTokenDecimals || !srcChunkAmount || !triggerPrice) return;
  const result = BN(srcChunkAmount).times(BN(triggerPrice));
  const decimalAdjustment = BN(10).pow(srcTokenDecimals);
  const adjustedResult = result.div(decimalAdjustment);
  return BN.max(1, adjustedResult).integerValue(BN.ROUND_FLOOR).toFixed(0);
};

export const getDuration = (module: Module, chunks: number, fillDelay: TimeDuration, customDuration?: TimeDuration): TimeDuration => {
  const minDuration = getTimeDurationMillis(fillDelay) * 2 * chunks;
  const unit = findTimeUnit(minDuration);

  if (customDuration) {
    return customDuration;
  }

  if (module === Module.LIMIT) {
    return { unit: TimeUnit.Days, value: 7 } as TimeDuration;
  }

  if (module === Module.STOP_LOSS || module === Module.TAKE_PROFIT) {
    return { unit: TimeUnit.Days, value: 30 } as TimeDuration;
  }

  return { unit, value: Number(BN(minDuration / unit).toFixed(2)) };
};

export const getChunks = (maxPossibleChunks: number, module: Module, typedChunks?: number) => {
  if (module === Module.STOP_LOSS || module === Module.LIMIT) return 1;
  if (typedChunks !== undefined) return typedChunks;
  return maxPossibleChunks;
};

export const getMaxPossibleChunks = (config: Config, typedSrcAmount?: string, oneSrcTokenUsd?: string, minChunkSizeUsd?: number) => {
  if (!typedSrcAmount || !oneSrcTokenUsd || !minChunkSizeUsd) return 1;
  const amount = BN(oneSrcTokenUsd).times(typedSrcAmount);

  const res = BN.max(1, amount.div(minChunkSizeUsd)).integerValue(BN.ROUND_FLOOR).toNumber();

  return res > 1 ? res : 1;
};

export const getFillDelay = (customFillDelay?: TimeDuration) => {
  if (customFillDelay) {
    return customFillDelay;
  }

  return DEFAULT_FILL_DELAY;
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

export const getAskParams = (config: Config, args: getAskParamsProps) => {
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

export const getPermitData = ({
  chainId,
  srcToken: _srcToken,
  dstToken,
  srcAmount,
  deadlineMilliseconds,
  fillDelayMillis,
  slippage,
  account,
  srcAmountPerChunk,
  dstMinAmountPerChunk,
  triggerAmountPerChunk,
}: GetPermitDataProps): RePermitTypedData => {
  const nonce = (Date.now() * 1000).toString();
  const epoch = safeBNString(fillDelayMillis / 1000);

  const deadline = safeBNString(deadlineMilliseconds / 1000);
  const srcToken = isNativeAddress(_srcToken) ? getNetwork(chainId)?.wToken.address : _srcToken;

  if (!srcToken) {
    throw new Error("srcToken is not defined");
  }

  return {
    domain: {
      name: "RePermit",
      version: "1",
      chainId: chainId,
      verifyingContract: REPERMIT_ADDRESS,
    },
    primaryType: "RePermitWitnessTransferFrom",
    types: {
      RePermitWitnessTransferFrom: [
        {
          name: "permitted",
          type: "TokenPermissions",
        },
        {
          name: "spender",
          type: "address",
        },
        {
          name: "nonce",
          type: "uint256",
        },
        {
          name: "deadline",
          type: "uint256",
        },
        {
          name: "witness",
          type: "Order",
        },
      ],
      Input: [
        {
          name: "token",
          type: "address",
        },
        {
          name: "amount",
          type: "uint256",
        },
        {
          name: "maxAmount",
          type: "uint256",
        },
      ],
      Order: [
        {
          name: "info",
          type: "OrderInfo",
        },
        {
          name: "exclusiveFiller",
          type: "address",
        },
        {
          name: "exclusivityOverrideBps",
          type: "uint256",
        },
        {
          name: "epoch",
          type: "uint256",
        },
        {
          name: "slippage",
          type: "uint256",
        },
        {
          name: "input",
          type: "Input",
        },
        {
          name: "output",
          type: "Output",
        },
      ],
      OrderInfo: [
        {
          name: "reactor",
          type: "address",
        },
        {
          name: "swapper",
          type: "address",
        },
        {
          name: "nonce",
          type: "uint256",
        },
        {
          name: "deadline",
          type: "uint256",
        },
        {
          name: "additionalValidationContract",
          type: "address",
        },
        {
          name: "additionalValidationData",
          type: "bytes",
        },
      ],
      Output: [
        {
          name: "token",
          type: "address",
        },
        {
          name: "amount",
          type: "uint256",
        },
        {
          name: "maxAmount",
          type: "uint256",
        },
        {
          name: "recipient",
          type: "address",
        },
      ],
      TokenPermissions: [
        {
          name: "token",
          type: "address",
        },
        {
          name: "amount",
          type: "uint256",
        },
      ],
    },
    message: {
      permitted: {
        token: srcToken as Address,
        amount: srcAmount,
      },
      spender: REACTOR_ADDRESS,
      nonce: nonce,
      deadline: deadline,
      witness: {
        info: {
          reactor: REACTOR_ADDRESS,
          swapper: account as Address,
          nonce: nonce,
          deadline: deadline,
          additionalValidationContract: EXECUTOR_ADDRESS,
          additionalValidationData: "0x",
        },
        exclusiveFiller: EXECUTOR_ADDRESS,
        exclusivityOverrideBps: EXCLUSIVITY_OVERRIDE_BPS,
        epoch: epoch,
        slippage: slippage.toString(),
        input: {
          token: srcToken as Address,
          amount: srcAmountPerChunk,
          maxAmount: srcAmount,
        },
        output: {
          token: dstToken as Address,
          amount: dstMinAmountPerChunk || "0",
          maxAmount: triggerAmountPerChunk || maxUint256,
          recipient: account as Address,
        },
      },
    },
  };
};
