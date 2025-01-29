import BN from "bignumber.js";
import { useMemo } from "react";
import * as SDK from "@orbs-network/twap-sdk";
import { safeValue, toAmountUi, toWeiAmount } from "../utils";
import { State, Token } from "../types";
import { network } from "@defi.org/web3-candies";

export const getPriceDiffFromMarket = (limitPrice?: string, marketPrice?: string, isLimitPriceInverted?: boolean): string => {
  // Validate inputs
  if (!limitPrice || !marketPrice || BN(limitPrice).isZero() || BN(marketPrice).isZero()) {
    return "0";
  }

  // Determine comparison direction
  const from = isLimitPriceInverted ? marketPrice : limitPrice;
  const to = isLimitPriceInverted ? limitPrice : marketPrice;

  // Calculate percentage difference
  return BN(from).div(to).minus(1).multipliedBy(100).decimalPlaces(2, BN.ROUND_UP).toFixed();
};

export const useDerivedSwapValues = (
  sdk: SDK.TwapSDK,
  state: State,
  isLimitPanel?: boolean,
  srcToken?: Token,
  destToken?: Token,
  marketPrice?: string,
  oneSrcTokenUsd?: string,
  typedSrcAmount?: string,
) => {
  const limitPrice = useMemo(() => {
    if (state.typedPrice === undefined || state.isMarketOrder || !marketPrice) return marketPrice;
    const result = state.isInvertedLimitPrice ? BN(1).div(state.typedPrice).toString() : state.typedPrice;
    return safeValue(toWeiAmount(destToken?.decimals, result));
  }, [state.typedPrice, state.isMarketOrder, marketPrice, state.isInvertedLimitPrice, destToken?.decimals]);

  return useMemo(() => {
    const srcAmount = safeValue(toWeiAmount(srcToken?.decimals, typedSrcAmount));
    const isMarketOrder = state.isMarketOrder && !isLimitPanel;
    const drivedValues = sdk.derivedSwapValues({
      oneSrcTokenUsd,
      srcAmount,
      srcDecimals: srcToken?.decimals,
      destDecimals: destToken?.decimals,
      customChunks: state.typedChunks,
      isLimitPanel,
      customFillDelay: state.typedFillDelay,
      customDuration: state.typedDuration,
      limitPrice,
      isMarketOrder,
    });
    const deadline = sdk.orderDeadline(state.currentTime, drivedValues.duration);
    const wToken = network(sdk.config.chainId)?.wToken;
    const createOrderArgs = sdk.prepareOrderArgs({
      destTokenMinAmount: drivedValues.destTokenMinAmount,
      srcChunkAmount: drivedValues.srcChunkAmount,
      deadline: deadline,
      fillDelay: drivedValues.fillDelay,
      srcAmount,
      srcTokenAddress: SDK.isNativeAddress(srcToken?.address) ? wToken?.address || "" : srcToken?.address || "",
      destTokenAddress: destToken?.address || "",
    });

    const priceDiffFromMarket = getPriceDiffFromMarket(limitPrice, marketPrice, state.isInvertedLimitPrice);

    const { warnings, errors, ...rest } = drivedValues;

    return {
      values: {
        ...rest,
        limitPrice,
        srcAmount,
        priceDiffFromMarket,
        deadline: sdk.orderDeadline(state.currentTime, rest.duration),
        createOrderArgs,
        isMarketOrder,
        estimatedDelayBetweenChunksMillis: sdk.estimatedDelayBetweenChunksMillis,
        limitPriceUI: toAmountUi(destToken?.decimals, limitPrice),
        srcAmountUI: typedSrcAmount,
        srcChunksAmountUI: toAmountUi(srcToken?.decimals, rest.srcChunkAmount),
        destTokenMinAmountOutUI: toAmountUi(destToken?.decimals, rest.destTokenMinAmount),
        destTokenAmountUI: toAmountUi(destToken?.decimals, rest.destTokenAmount),
        durationMilliseconds: rest.duration.unit * rest.duration.value,
        fillDelayMilliseconds: rest.fillDelay.unit * rest.fillDelay.value,
        fillDelayText: SDK.fillDelayText(rest.fillDelay.unit * rest.fillDelay.value),
        isInvertedLimitPrice: state.isInvertedLimitPrice,
        destTokenAmountLoading: BN(typedSrcAmount || 0).gt(0) && BN(marketPrice || 0).isZero(),
      },
      warnings,
      errors,
    };
  }, [
    sdk,
    state,
    isLimitPanel,
    srcToken?.address,
    srcToken?.decimals,
    destToken?.address,
    destToken?.decimals,
    state.typedChunks,
    state.typedFillDelay,
    state.typedDuration,
    typedSrcAmount,
    state.isMarketOrder,
    state.currentTime,
    state.isInvertedLimitPrice,
    marketPrice,
    oneSrcTokenUsd,
    limitPrice,
  ]);
};

export type TwapValues = ReturnType<typeof useDerivedSwapValues>["values"];
export type TwapWarnigs = ReturnType<typeof useDerivedSwapValues>["warnings"];
export type TwapErrors = ReturnType<typeof useDerivedSwapValues>["errors"];
