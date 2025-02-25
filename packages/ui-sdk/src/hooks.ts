import { amountUi, getNetwork, isNativeAddress, TimeDuration, TwapAbi, TwapSDK } from "@orbs-network/twap-sdk";
import BN from "bignumber.js";
import { Action, ActionType, State, Token } from "./types";
import { useCallback, useMemo } from "react";
import { removeCommas, toAmountUi, toWeiAmount } from "./utils";

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

export const useDerivedState = (
  sdk: TwapSDK,
  state: State,
  isLimitPanel?: boolean,
  srcToken?: Token,
  destToken?: Token,
  marketPrice?: string,
  oneSrcTokenUsd?: number,
  typedSrcAmount?: string,
  srcAmount?: string,
) => {
  const limitPrice = useMemo(() => {
    if (state.typedPrice === undefined || state.isMarketOrder || !marketPrice) return marketPrice;
    const result = state.isInvertedLimitPrice ? BN(1).div(state.typedPrice).toString() : state.typedPrice;
    return toWeiAmount(destToken?.decimals, result);
  }, [state.typedPrice, state.isMarketOrder, marketPrice, state.isInvertedLimitPrice, destToken?.decimals]);

  return useMemo(() => {
    const isMarketOrder = state.isMarketOrder && !isLimitPanel;
    const maxChunks = sdk.getMaxChunks(typedSrcAmount || "", oneSrcTokenUsd || 0);
    const chunks = sdk.getChunks(maxChunks, Boolean(isLimitPanel), state.typedChunks);
    const fillDelay = sdk.getFillDelay(Boolean(isLimitPanel), state.typedFillDelay);
    const orderDuration = sdk.getOrderDuration(chunks, fillDelay, state.typedDuration);
    const srcTokenChunkAmount = sdk.getSrcTokenChunkAmount(srcAmount || "", chunks);
    const destTokenMinAmount = sdk.getDestTokenMinAmount(srcTokenChunkAmount, limitPrice || "", Boolean(state.isMarketOrder), srcToken?.decimals || 0);
    const destTokenAmount = sdk.getDestTokenAmount(srcAmount || "", limitPrice || "", srcToken?.decimals || 0);

    return {
      limitPrice,
      priceDiffFromMarket: getPriceDiffFromMarket(limitPrice, marketPrice, state.isInvertedLimitPrice),
      orderDeadline: sdk.getOrderDeadline(state.currentTime, orderDuration),
      isInvertedLimitPrice: state.isInvertedLimitPrice,
      destTokenAmount,
      srcTokenChunkAmount,
      maxChunks,
      chunks,
      fillDelay,
      orderDuration,
      destTokenMinAmount,
      isMarketOrder,
      limitSelectedPercent: state.limitPricePercent,
      typedLimitPrice: state.typedPrice,
      estimatedDelayBetweenChunksMillis: sdk.estimatedDelayBetweenChunksMillis,
      ui: {
        destTokenAmount: amountUi(destToken?.decimals, destTokenAmount),
        srcTokenChunkAmount: amountUi(srcToken?.decimals, srcTokenChunkAmount),
        destTokenMinAmountOut: amountUi(destToken?.decimals, destTokenMinAmount),
      },
    };
  }, [sdk, state, isLimitPanel, srcToken, destToken, marketPrice, oneSrcTokenUsd, limitPrice, srcAmount, typedSrcAmount]);
};

export type DerivedState = ReturnType<typeof useDerivedState>;

type UpdateState = (value: Partial<State>) => void;

export const useActionHandlers = (dispatch: React.Dispatch<Action>, updateState: UpdateState, isLimitPanel: boolean, state: State, marketPrice?: string, dstToken?: Token) => {
  const resetTwap = useCallback(() => dispatch({ type: ActionType.RESET, payload: isLimitPanel }), [dispatch, isLimitPanel]);

  const onLimitPricePercent = useCallback(
    (percent?: string) => {
      updateState({ limitPricePercent: percent });
      if (BN(percent || 0).isZero()) {
        updateState({ typedPrice: undefined });
        return;
      }
      const p = BN(percent || 0)
        .div(100)
        .plus(1)
        .toString();
      let price = toAmountUi(dstToken?.decimals, marketPrice);

      if (state.isInvertedLimitPrice) {
        price = BN(1)
          .div(price || "0")
          .toString();
      }

      const value = BN(price || "0")
        .times(p)
        .toString();
      updateState({ typedPrice: BN(value).decimalPlaces(6).toString() });
    },
    [updateState, dstToken, marketPrice, state.isInvertedLimitPrice, state.typedPrice],
  );

  const onLimitPriceReset = useCallback(() => onLimitPricePercent("0"), [onLimitPricePercent]);
  const onLimitPriceChange = useCallback((typedPrice: string) => updateState({ typedPrice: removeCommas(typedPrice), limitPricePercent: undefined }), [updateState]);
  const onInvertLimitPrice = useCallback(() => {
    updateState({
      isInvertedLimitPrice: !state.isInvertedLimitPrice,
      typedPrice: undefined,
      limitPricePercent: undefined,
    });
  }, [updateState, state.isInvertedLimitPrice, state.typedPrice, state.limitPricePercent]);

  return {
    setIsMarketPrice: useCallback((isMarketOrder: boolean) => updateState({ isMarketOrder }), [updateState]),
    setFillDelay: useCallback((typedFillDelay: TimeDuration) => updateState({ typedFillDelay }), [updateState]),
    setChunks: useCallback((typedChunks: number) => updateState({ typedChunks }), [updateState]),
    setDuration: useCallback((typedDuration: TimeDuration) => updateState({ typedDuration }), [updateState]),
    onResetDuration: useCallback(() => updateState({ typedDuration: undefined }), [updateState]),
    onLimitPricePercent,
    onLimitPriceReset,
    onLimitPriceChange,
    onInvertLimitPrice,
    resetTwap,
  };
};

export const useWarnings = (sdk: TwapSDK, derivedState: DerivedState) => {
  return useMemo(() => {
    return {
      partialFill: sdk.getPartialFillWarning(derivedState.chunks, derivedState.orderDuration, derivedState.fillDelay),
    };
  }, [sdk, derivedState]);
};

export const useErrors = (sdk: TwapSDK, derivedState: DerivedState, state: State, isLimitPanel?: boolean, oneSrcTokenUsd?: number, typedSrcAmount?: string) => {
  return useMemo(() => {
    return {
      fillDelay: sdk.getFillDelayError(derivedState.fillDelay, Boolean(isLimitPanel)),
      orderDuration: sdk.getDurationError(derivedState.orderDuration, Boolean(isLimitPanel)),
      tradeSize: sdk.getTradeSizeError(typedSrcAmount || "", oneSrcTokenUsd || 0),
      chunks: sdk.getChunksError(derivedState.chunks, derivedState.maxChunks, Boolean(isLimitPanel)),
      limitPrice: sdk.getLimitPriceError(state.typedPrice),
    };
  }, [sdk, derivedState, isLimitPanel, oneSrcTokenUsd, typedSrcAmount, state.typedPrice]);
};

export function useSubmitOrderArgs(derivedState: DerivedState, sdk: TwapSDK, srcToken?: Token, destToken?: Token, srcAmount?: string) {
  const srcTokenAddress = useMemo(() => {
    const wToken = getNetwork(sdk.config.chainId)?.wToken;
    return isNativeAddress(srcToken?.address) ? wToken?.address || "" : srcToken?.address || "";
  }, [srcToken, sdk.config.chainId]);

  return useMemo(() => {
    const params = sdk.getAskArgs({
      destTokenMinAmount: derivedState.destTokenMinAmount,
      srcChunkAmount: derivedState.srcTokenChunkAmount,
      deadline: derivedState.orderDeadline,
      fillDelay: derivedState.fillDelay,
      srcAmount: srcAmount || "",
      srcTokenAddress,
      destTokenAddress: destToken?.address || "",
    });

    return {
      method: "ask",
      params,
      contract: sdk.config.twapAddress,
      abi: TwapAbi,
    };
  }, [sdk, srcTokenAddress, derivedState, destToken, srcAmount]);
}
