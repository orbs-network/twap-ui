import { useContext, useEffect, useState } from "react";
import { createContext, useReducer, useCallback, useMemo } from "react";
import * as SDK from "@orbs-network/twap-sdk";
import BN from "bignumber.js";
import { Action, ActionType, State, Token, TwapProviderProps } from "./types";
import { useDerivedSwapValues } from "./hooks/useDerivedValues";
import { useActionsHandlers } from "./hooks/useActionHandlers";
import { usePanels } from "./hooks/usePanels";

const initialState: State = {
  currentTime: Date.now(),
  typedFillDelay: SDK.DEFAULT_FILL_DELAY,
};

interface ContextType {
  state: State;
  actionHandlers: ReturnType<typeof useActionsHandlers>;
  sdk: SDK.TwapSDK;
  isLimitPanel?: boolean;
  config: SDK.Config;
  derivedValues: ReturnType<typeof useDerivedSwapValues>;
  walletAddress?: string;
}

const Context = createContext({} as ContextType);

const contextReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.UPDATED_STATE:
      return { ...state, ...action.value };
    default:
      return state;
  }
};

export const TwapProvider = ({ children, config, isLimitPanel = false, walletAddress, chainId }: TwapProviderProps) => {
  const [state, dispatch] = useReducer(contextReducer, initialState);
  const sdk = useMemo(() => new SDK.TwapSDK({ config }), [config]);
  const derivedValues = useDerivedSwapValues(sdk, state, isLimitPanel);
  const actionHandlers = useActionsHandlers(state, dispatch);
  const panels = usePanels(state, derivedValues, actionHandlers.updateState);

  return (
    <Context.Provider
      value={{
        sdk,
        actionHandlers,
        state,
        isLimitPanel,
        config,
        derivedValues,
        walletAddress,
      }}
    >
      <ContextListeners />
      {children}
    </Context.Provider>
  );
};

const ContextListeners = () => {
  const { actionHandlers, isLimitPanel } = useTwapContext();
  useEffect(() => {
    if (isLimitPanel) {
      actionHandlers.setIsMarketOrder(false);
      actionHandlers.setDuration({ unit: SDK.TimeUnit.Weeks, value: 1 });
    } else {
      actionHandlers.setIsMarketOrder(true);
      actionHandlers.setDuration(undefined);
    }
  }, [isLimitPanel]);

  useEffect(() => {
    setInterval(() => {
      actionHandlers.setCurrentTime(Date.now());
    }, 60_000);
  }, [actionHandlers]);

  return null;
};

export const useTwapContext = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useTwapContext must be used within a TwapProvider");
  }
  return context;
};
