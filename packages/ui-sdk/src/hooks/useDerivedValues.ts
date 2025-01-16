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

export const useDerivedSwapValues = (sdk: SDK.TwapSDK, state: State, parsedSrcToken?: Token, parsedDstToken?: Token, isLimitPanel?: boolean) => {
  const price = useMemo(() => {
    if (state.typedPrice === undefined || state.isMarketOrder || !state.marketPrice) return state.marketPrice;
    const result = state.isInvertedLimitPrice ? BN(1).div(state.typedPrice).toString() : state.typedPrice;
    return safeValue(toWeiAmount(parsedDstToken?.decimals, result));
  }, [state.typedPrice, state.isMarketOrder, state.marketPrice, state.isInvertedLimitPrice, parsedDstToken?.decimals]);

  return useMemo(() => {
    const srcAmount = safeValue(toWeiAmount(parsedSrcToken?.decimals, state.typedSrcAmount));
    const isMarketOrder = state.isMarketOrder && !isLimitPanel;
    const data = sdk.derivedSwapValues({
      oneSrcTokenUsd: state.oneSrcTokenUsd,
      srcAmount,
      srcDecimals: parsedSrcToken?.decimals,
      destDecimals: parsedDstToken?.decimals,
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
      srcTokenAddress: SDK.isNativeAddress(parsedSrcToken?.address) ? wToken?.address || "" : parsedSrcToken?.address || "",
      destTokenAddress: parsedDstToken?.address || "",
    });

    const priceDiffFromMarket = getPriceDiffFromMarket(price, state.marketPrice, state.isInvertedLimitPrice);
    return {
      ...data,
      price,
      priceUI: toAmountUi(parsedDstToken?.decimals, price),
      srcAmount,
      priceDiffFromMarket,
      srcChunksAmountUI: toAmountUi(parsedSrcToken?.decimals, data.srcChunkAmount),
      destTokenMinAmountOutUI: toAmountUi(parsedDstToken?.decimals, data.destTokenMinAmount),
      destTokenAmountUI: toAmountUi(parsedDstToken?.decimals, data.destTokenAmount),
      deadline: sdk.orderDeadline(state.currentTime, data.duration),
      createOrderArgs,
      isMarketOrder,
    };
  }, [state, parsedSrcToken, parsedDstToken, sdk, isLimitPanel, state.oneSrcTokenUsd, state.currentTime, price]);
};
