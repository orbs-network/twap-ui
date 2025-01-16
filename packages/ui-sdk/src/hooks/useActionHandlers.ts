import { useCallback, Dispatch } from "react";
import BN from "bignumber.js";
import * as SDK from "@orbs-network/twap-sdk";
import { Action, ActionType, State, Token } from "../types";
import { toAmountUi } from "../utils";

export const useActionsHandlers = (state: State, dispatch: Dispatch<Action>, parsedDstToken?: Token) => {
  const updateState = useCallback((value: Partial<State>) => dispatch({ type: ActionType.UPDATED_STATE, value }), [dispatch]);

  const onInvertPrice = () => {
    return useCallback(() => {
      updateState({
        isInvertedLimitPrice: !state.isInvertedLimitPrice,
        typedPrice: undefined,
        limitPricePercent: undefined,
      });
    }, [updateState, state.isInvertedLimitPrice, state.typedPrice, state.limitPricePercent]);
  };

  const onPricePercentClick = useCallback(
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
      let price = toAmountUi(parsedDstToken?.decimals, state.marketPrice);

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
    [parsedDstToken, state.isInvertedLimitPrice, state.marketPrice, updateState],
  );

  return {
    setSrcAmount: useCallback((typedSrcAmount: string) => updateState({ typedSrcAmount }), [updateState]),
    setChunks: useCallback((typedChunks: number) => updateState({ typedChunks }), [updateState]),
    setFillDelay: useCallback((typedFillDelay: SDK.TimeDuration) => updateState({ typedFillDelay }), [updateState]),
    setDuration: useCallback((typedDuration?: SDK.TimeDuration) => updateState({ typedDuration }), [updateState]),
    setLimitPrice: useCallback((typedPrice?: string) => updateState({ typedPrice }), [updateState]),
    setIsInvertedLimitPrice: useCallback((isInvertedLimitPrice: boolean) => updateState({ isInvertedLimitPrice }), [updateState]),
    setIsMarketOrder: useCallback((isMarketOrder: boolean) => updateState({ isMarketOrder }), [updateState]),
    setMarketPrice: useCallback((marketPrice: string) => updateState({ marketPrice }), [updateState]),
    setSrcToken: useCallback((rawSrcToken: any) => updateState({ rawSrcToken }), [updateState]),
    setDstToken: useCallback((rawDstToken: any) => updateState({ rawDstToken }), [updateState]),
    setOneSrcTokenUsd: useCallback((oneSrcTokenUsd: number) => updateState({ oneSrcTokenUsd }), [updateState]),
    setCurrentTime: useCallback((currentTime: number) => updateState({ currentTime }), [updateState]),
    setLimitPricePercent: useCallback((limitPricePercent?: string) => updateState({ limitPricePercent }), [updateState]),
    onInvertPrice,
    onPricePercentClick,
  };
};
