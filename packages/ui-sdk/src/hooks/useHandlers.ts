import { useCallback } from "react";
import { Action, ActionType, State } from "../types";
import { TimeDuration } from "@orbs-network/twap-sdk";

type UpdateState = (value: Partial<State>) => void;

export const useActionHandlers = (dispatch: React.Dispatch<Action>, updateState: UpdateState, isLimitPanel: boolean) => {
  const resetTwap = useCallback(() => dispatch({ type: ActionType.RESET, payload: isLimitPanel }), [dispatch, isLimitPanel]);

  return {
    setIsMarketPrice: useCallback((isMarketOrder: boolean) => updateState({ isMarketOrder }), [updateState]),
    setFillDelay: useCallback((typedFillDelay: TimeDuration) => updateState({ typedFillDelay }), [updateState]),
    setChunks: useCallback((typedChunks: number) => updateState({ typedChunks }), [updateState]),
    setDuration: useCallback((typedDuration: TimeDuration) => updateState({ typedDuration }), [updateState]),
    onResetDuration: useCallback(() => updateState({ typedDuration: undefined }), [updateState]),
    resetTwap,
  };
};
