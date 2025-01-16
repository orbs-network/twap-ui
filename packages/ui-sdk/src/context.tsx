import { useContext, useEffect, useState } from "react";
import { createContext, useReducer, useCallback, useMemo } from "react";
import * as SDK from "@orbs-network/twap-sdk";
import BN from "bignumber.js";
import { Action, ActionType, State, Token, TwapProviderProps } from "./types";
import { useDerivedSwapValues } from "./hooks/useDerivedValues";
import { useActionsHandlers } from "./hooks/useActionHandlers";

const initialState: State = {
  currentTime: Date.now(),
  typedFillDelay: SDK.DEFAULT_FILL_DELAY,
};

interface ContextType {
  state: State;
  actionHandlers: ReturnType<typeof useActionsHandlers>;
  sdk: SDK.TwapSDK;
  isLimitPanel?: boolean;
  parsedSrcToken?: Token;
  parsedDstToken?: Token;
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

export const TwapProvider = ({ children, config, isLimitPanel = false, parseToken, walletAddress }: TwapProviderProps) => {
  const [state, dispatch] = useReducer(contextReducer, initialState);
  const sdk = useMemo(() => new SDK.TwapSDK({ config }), [config]);
  const parsedSrcToken = useMemo(() => parseToken?.(state.rawSrcToken), [state.rawSrcToken, parseToken]);
  const parsedDstToken = useMemo(() => parseToken?.(state.rawDstToken), [state.rawDstToken, parseToken]);
  const derivedValues = useDerivedSwapValues(sdk, state, parsedSrcToken, parsedDstToken, isLimitPanel);
  const actionHandlers = useActionsHandlers(state, dispatch, parsedDstToken);
  
  return (
    <Context.Provider
      value={{
        sdk,
        actionHandlers,
        state,
        isLimitPanel,
        parsedSrcToken,
        parsedDstToken,
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

export const useSwapPriceDisplay = () => {
  const [inverted, setInvert] = useState(Boolean);
  const {
    derivedValues: { destTokenAmountUI },
    state: { typedSrcAmount },
    parsedSrcToken,
    parsedDstToken,
  } = useTwapContext();
  const price = useMemo(() => {
    if (!destTokenAmountUI || !typedSrcAmount) return "0";
    const value = BN(destTokenAmountUI).dividedBy(typedSrcAmount).toString();
    return inverted ? BN(1).div(value).toString() : value;
  }, [destTokenAmountUI, typedSrcAmount, inverted]);

  const toggleInvert = useCallback(() => {
    setInvert((prev) => !prev);
  }, []);

  return {
    toggleInvert,
    price,
    leftToken: inverted ? parsedDstToken : parsedSrcToken,
    rightToken: inverted ? parsedSrcToken : parsedDstToken,
  };
};

export const useLimitPriceInput = () => {
  const {
    actionHandlers,
    derivedValues: { priceUI },
    state,
  } = useTwapContext();
  const { isInvertedLimitPrice, typedPrice } = state;

  const value = useMemo(() => {
    if (typedPrice !== undefined) return typedPrice;

    if (isInvertedLimitPrice && priceUI) {
      return BN(1).div(priceUI).decimalPlaces(6).toString();
    }

    return BN(priceUI).decimalPlaces(6).toString();
  }, [typedPrice, priceUI, isInvertedLimitPrice]);

  return {
    value: value || "",
    onChange: actionHandlers.setLimitPrice,
    isLoading: Boolean(state.rawSrcToken && state.rawDstToken &&  !state.marketPrice)
  };
};
