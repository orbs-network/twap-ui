import { useEffect } from "react";
import { useReducer, useCallback, useMemo } from "react";
import * as SDK from "@orbs-network/twap-sdk";
import { Action, ActionType, State, Token } from "./types";

import { DEFAULT_LIMIT_PANEL_DURATION } from "./consts";
import { removeCommas, toWeiAmount } from "./utils";
import { useActionHandlers, useDerivedState, useErrors, useWarnings, useSubmitOrderArgs } from "./hooks";

const initialState: State = {
  currentTime: Date.now(),
  typedFillDelay: SDK.DEFAULT_FILL_DELAY,
};

const useOrders = (sdk: SDK.TwapSDK) => {
  return useMemo(() => {
    return {
      getUserOrders: sdk.getUserOrders.bind(sdk),
      addNewOrder: sdk.addNewOrder.bind(sdk),
      addCancelledOrder: sdk.addCancelledOrder.bind(sdk),
    };
  }, [sdk]);
};

const StateReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.UPDATED_STATE:
      return { ...state, ...action.value };
    case ActionType.RESET:
      return {
        ...initialState,
        typedDuration: action.payload ? DEFAULT_LIMIT_PANEL_DURATION : undefined,
      };
    default:
      return state;
  }
};

type UseTwapProps = {
  config: SDK.Config;
  isLimitPanel?: boolean;
  srcToken?: Token;
  destToken?: Token;
  marketPriceOneToken?: string;
  oneSrcTokenUsd?: number;
  typedSrcAmount?: string;
};

export const useTwap = ({ config, isLimitPanel, srcToken, destToken, marketPriceOneToken: marketPrice, oneSrcTokenUsd, typedSrcAmount: _typedSrcAmount }: UseTwapProps) => {
  const [state, dispatch] = useReducer(StateReducer, initialState);
  const typedSrcAmount = useMemo(() => removeCommas(_typedSrcAmount || "0"), [_typedSrcAmount]);
  const srcAmount = useMemo(() => toWeiAmount(srcToken?.decimals, typedSrcAmount), [srcToken, typedSrcAmount]);
  const updateState = useCallback((value: Partial<State>) => dispatch({ type: ActionType.UPDATED_STATE, value }), [dispatch]);
  const sdk = useMemo(() => new SDK.TwapSDK({ config }), [config]);
  const orders = useOrders(sdk);
  const derivedState = useDerivedState(sdk, state, isLimitPanel, srcToken, destToken, marketPrice, oneSrcTokenUsd, typedSrcAmount, srcAmount);
  const actionHandlers = useActionHandlers(dispatch, updateState, !!isLimitPanel, state, marketPrice, destToken);
  const submitOrderArgs = useSubmitOrderArgs(derivedState, sdk, srcToken, destToken, srcAmount);
  const warnings = useWarnings(sdk, derivedState);
  const errors = useErrors(sdk, derivedState, state, !!isLimitPanel, oneSrcTokenUsd, typedSrcAmount);

  useEffect(() => {
    if (isLimitPanel) {
      updateState({ typedDuration: DEFAULT_LIMIT_PANEL_DURATION });
    } else {
      updateState({ typedDuration: undefined });
    }
  }, [isLimitPanel, updateState]);

  useEffect(() => {
    setInterval(() => {
      updateState({ currentTime: Date.now() });
    }, 60_000);
  }, [updateState]);

  return {
    derivedState,
    actionHandlers,
    analytics: sdk.analytics,
    orders,
    submitOrderArgs,
    warnings,
    errors,
  };
};

export type UseTwap = ReturnType<typeof useTwap>;
