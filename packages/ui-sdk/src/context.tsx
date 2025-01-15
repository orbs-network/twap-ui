import { Dispatch, useContext, useEffect } from "react";
import { createContext, useReducer, useCallback, useMemo } from "react";
import SDK from "@orbs-network/twap-sdk";
import BN from "bignumber.js";
import { toAmountUi } from "./utils";
import { State, Token, TwapProviderProps } from "./types";

const initialState: State = {
  currentTime: Date.now(),
  fillDelay: SDK.DEFAULT_FILL_DELAY,
};

interface ContextType {
  state: State;
  actionHandlers: ReturnType<typeof useStateActionsHandlers>;
  sdk?: SDK.TwapSDK;
  isLimitPanel?: boolean;
  parsedSrcToken?: Token;
  parsedDstToken?: Token;
  config: SDK.Config;
  derivedValues: ReturnType<typeof useDerivedSwapValues>;
}
enum ActionType {
  UPDATED_STATE = "UPDATED_STATE",
}

type Action = { type: ActionType.UPDATED_STATE; value: Partial<State> };

const Context = createContext({} as ContextType);

const contextReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.UPDATED_STATE:
      return { ...state, ...action.value };
    default:
      return state;
  }
};

const useStateActionsHandlers = (dispatch: Dispatch<Action>) => {
  const updateState = useCallback((value: Partial<State>) => dispatch({ type: ActionType.UPDATED_STATE, value }), [dispatch]);

  return {
    setSrcAmount: useCallback((srcAmount: string) => updateState({ srcAmount }), [updateState]),
    setChunks: useCallback((chunks: number) => updateState({ chunks }), [updateState]),
    setFillDelay: useCallback((fillDelay: SDK.TimeDuration) => updateState({ fillDelay }), [updateState]),
    setDuration: useCallback((duration: SDK.TimeDuration) => updateState({ duration }), [updateState]),
    setLimitPrice: useCallback((limitPrice?: string) => updateState({ limitPrice }), [updateState]),
    setIsInvertedLimitPrice: useCallback((isInvertedLimitPrice: boolean) => updateState({ isInvertedLimitPrice }), [updateState]),
    setIsMarketOrder: useCallback((isMarketOrder: boolean) => updateState({ isMarketOrder }), [updateState]),
    setMarketPrice: useCallback((marketPrice: string) => updateState({ marketPrice }), [updateState]),
    setSrcToken: useCallback((rawSrcToken: any) => updateState({ rawSrcToken }), [updateState]),
    setDstToken: useCallback((rawDstToken: any) => updateState({ rawDstToken }), [updateState]),
    setOneSrcTokenUsd: useCallback((oneSrcTokenUsd: number) => updateState({ oneSrcTokenUsd }), [updateState]),
    setCurrentTime: useCallback((currentTime: number) => updateState({ currentTime }), [updateState]),
    setLimitPricePercent: useCallback((limitPricePercent?: string) => updateState({ limitPricePercent }), [updateState]),
  };
};

export const useOnLimitPricePercent = () => {
  const { state, parsedDstToken, actionHandlers } = useTwapContext();
  const { marketPrice, isInvertedLimitPrice } = state;

  return useCallback(
    (percent?: string) => {
      actionHandlers.setLimitPricePercent(percent);
      if (BN(percent || 0).isZero()) {
        actionHandlers.setLimitPrice(undefined);
        return;
      }
      const p = BN(percent || 0)
        .div(100)
        .plus(1)
        .toString();
      let price = toAmountUi(parsedDstToken?.decimals, marketPrice);

      if (isInvertedLimitPrice) {
        price = BN(1)
          .div(price || "0")
          .toString();
      }

      const value = BN(price || "0")
        .times(p)
        .toString();

      actionHandlers.setLimitPrice(BN(value).decimalPlaces(6).toString());
    },
    [marketPrice, parsedDstToken, isInvertedLimitPrice, state, actionHandlers]
  );
};

export const useDerivedSwapValues = (sdk: SDK.TwapSDK, state: State, parsedSrcToken?: Token, parsedDstToken?: Token, isLimitPanel?: boolean) => {
  return useMemo(() => {
    return sdk.derivedSwapValues({
      oneSrcTokenUsd: state.oneSrcTokenUsd,
      srcAmount: state.srcAmount,
      srcDecimals: parsedSrcToken?.decimals,
      destDecimals: parsedDstToken?.decimals,
      customChunks: state.chunks,
      isLimitPanel,
      customFillDelay: state.fillDelay,
      customDuration: state.duration,
      price: state.limitPrice,
      isMarketOrder: state.isMarketOrder,
    });
  }, [state, parsedSrcToken, parsedDstToken, sdk, isLimitPanel, state.oneSrcTokenUsd]);
};

export const TwapProvider = ({ children, config, isLimitPanel = false, parseToken }: TwapProviderProps) => {
  const [state, dispatch] = useReducer(contextReducer, initialState);
  const actionHandlers = useStateActionsHandlers(dispatch);

  const sdk = useMemo(() => new SDK.TwapSDK({ config }), [config]);

  const parsedSrcToken = useMemo(() => parseToken(state.rawSrcToken), [state.rawSrcToken, parseToken]);
  const parsedDstToken = useMemo(() => parseToken(state.rawDstToken), [state.rawDstToken, parseToken]);
  const derivedValues = useDerivedSwapValues(sdk, state, parsedSrcToken, parsedDstToken, isLimitPanel);
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
      actionHandlers.setDuration({ unit: SDK.TimeUnit.Minutes, value: 5 });
    }
  }, [isLimitPanel, actionHandlers]);

  useEffect(() => {
    setInterval(() => {
      actionHandlers.setCurrentTime(Date.now());
    }, 60_000);
  }, [actionHandlers]);

  return null;
};

const useTwapContext = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useTwapContext must be used within a TwapProvider");
  }
  return context;
};
