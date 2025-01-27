import BN from "bignumber.js";
import { useMemo } from "react";
import * as SDK from "@orbs-network/twap-sdk";
import { safeValue, toAmountUi, toWeiAmount } from "../utils";
import { State, Token } from "../types";
import { network } from "@defi.org/web3-candies";

export const getPriceDiffFromMarket = (limitPrice?: string, marketPrice?: string, isLimitPriceInverted?: boolean) => {
  if (!limitPrice || !marketPrice || BN(limitPrice).isZero() || BN(limitPrice).isZero()) return "0";
  const from = isLimitPriceInverted ? marketPrice : limitPrice;
  const to = isLimitPriceInverted ? limitPrice : marketPrice;
  return BN(from).div(to).minus(1).multipliedBy(100).decimalPlaces(2, BN.ROUND_HALF_UP).toFixed();
};

export const useDerivedSwapValues = (sdk: SDK.TwapSDK, state: State, isLimitPanel?: boolean) => {
  const price = useMemo(() => {
    if (state.typedPrice === undefined || state.isMarketOrder || !state.marketPrice) return state.marketPrice;
    const result = state.isInvertedLimitPrice ? BN(1).div(state.typedPrice).toString() : state.typedPrice;
    return safeValue(toWeiAmount(state.destToken?.decimals, result));
  }, [state.typedPrice, state.isMarketOrder, state.marketPrice, state.isInvertedLimitPrice, state.destToken?.decimals]);

  return useMemo(() => {
    const srcAmount = safeValue(toWeiAmount(state.srcToken?.decimals, state.typedSrcAmount));
    const isMarketOrder = state.isMarketOrder && !isLimitPanel;
    const data = sdk.derivedSwapValues({
      oneSrcTokenUsd: state.oneSrcTokenUsd,
      srcAmount,
      srcDecimals: state.srcToken?.decimals,
      destDecimals: state.destToken?.decimals,
      customChunks: state.typedChunks,
      isLimitPanel,
      customFillDelay: state.typedFillDelay,
      customDuration: state.typedDuration,
      price,
      isMarketOrder,
    });
    const deadline = sdk.orderDeadline(state.currentTime, data.duration);
    const wToken = network(sdk.config.chainId)?.wToken;
    const createOrderArgs = sdk.prepareOrderArgs({
      destTokenMinAmount: data.destTokenMinAmount,
      srcChunkAmount: data.srcChunkAmount,
      deadline: deadline,
      fillDelay: data.fillDelay,
      srcAmount,
      srcTokenAddress: SDK.isNativeAddress(state.srcToken?.address) ? wToken?.address || "" : state.srcToken?.address || "",
      destTokenAddress: state.destToken?.address || "",
    });

    const priceDiffFromMarket = getPriceDiffFromMarket(price, state.marketPrice, state.isInvertedLimitPrice);
    return {
      ...data,
      price,
      priceUI: toAmountUi(state.destToken?.decimals, price),
      srcAmount,
      priceDiffFromMarket,
      srcChunksAmountUI: toAmountUi(state.srcToken?.decimals, data.srcChunkAmount),
      destTokenMinAmountOutUI: toAmountUi(state.destToken?.decimals, data.destTokenMinAmount),
      destTokenAmountUI: toAmountUi(state.destToken?.decimals, data.destTokenAmount),
      deadline: sdk.orderDeadline(state.currentTime, data.duration),
      createOrderArgs,
      isMarketOrder,
    };
  }, [state, sdk, isLimitPanel, state.oneSrcTokenUsd, state.currentTime, price]);
};

export type DerivedSwapValues = ReturnType<typeof useDerivedSwapValues>;
