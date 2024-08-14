import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { State, TimeResolution, TWAPContextProps, TwapLibProps } from "../types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { analytics } from "../analytics";
import Web3 from "web3";
import { defaultCustomFillDelay, MIN_TRADE_INTERVAL_FORMATTED, QUERY_PARAMS } from "../consts";
import moment from "moment";
import { setWeb3Instance } from "@defi.org/web3-candies";
import { stateActions } from "./actions";
analytics.onModuleImported();

export const TwapContext = createContext({} as TWAPContextProps);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const Listener = (props: TwapLibProps) => {
  const interval = useRef<any>();
  const { state, updateState } = useTwapContext();
  const setCustomDuration = stateActions.useSetCustomDuration();

  useEffect(() => {
    if (props.isLimitPanel) {
      setCustomDuration({ resolution: TimeResolution.Days, amount: 7 });
    } else {
      setCustomDuration(undefined);
    }
  }, [props.isLimitPanel]);

  useEffect(() => {
    if (state.showConfirmation && !state.swapState) {
      updateState({ confirmationClickTimestamp: moment() });
      interval.current = setInterval(() => {
        updateState({ confirmationClickTimestamp: moment() });
      }, 10_000);
    }
    return () => clearInterval(interval.current);
  }, [state.showConfirmation, state.swapState, updateState]);

  useEffect(() => {
    analytics.onLibInit(props.config, props.provider, props.account);
  }, [props.config, props.provider, props.account]);

  return null;
};

export const getInitialState = ({ state = {} }: { state?: Partial<State> }): State => {
  return {
    srcAmountUi: "",
    confirmationClickTimestamp: moment(),
    showConfirmation: false,
    disclaimerAccepted: true,
    customChunks: undefined,
    customFillDelay: { resolution: TimeResolution.Minutes, amount: MIN_TRADE_INTERVAL_FORMATTED },
    isMarketOrder: false,
    selectedOrdersTab: 0,
    ...state,
  };
};

enum ActionType {
  UPDATED_STATE = "UPDATED_STATE",
}

type Action = { type: ActionType.UPDATED_STATE; value: Partial<State> };

const contextReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.UPDATED_STATE:
      return { ...state, ...action.value };
    default:
      return state;
  }
};

const useStore = (props: TwapLibProps) => {
  const [state, dispatch] = useReducer(contextReducer, getInitialState({ state: props.state }));
  const updateState = useCallback((value: Partial<State>) => dispatch({ type: ActionType.UPDATED_STATE, value }), [dispatch]);
  return {
    updateState,
    state,
  };
};

export const Content = (props: TwapLibProps) => {
  const { config } = props;
  const { updateState, state } = useStore(props);
  const uiPreferences = props.uiPreferences || {};
  const web3 = useMemo(() => (!props.provider ? undefined : new Web3(props.provider)), [props.provider]);

  useEffect(() => {
    setWeb3Instance(web3);
  }, [web3]);

  return (
    <TwapContext.Provider
      value={{
        translations,
        isWrongChain,
        state,
        updateState,
        marketPrice: props.marketPrice,
        uiPreferences,
        srcToken: props.srcToken,
        dstToken: props.dstToken,
        srcUsd: props.srcUsd || 0,
        dstUsd: props.dstUsd || 0,
        Components: props.Components,
        web3,
        config,
        account: props.account,
        onDstTokenSelected: props.onDstTokenSelected,
        onSrcTokenSelected: props.onSrcTokenSelected,
        onSwitchTokens: props.onSwitchTokens || (() => {}),
        isLimitPanel: !!props.isLimitPanel,
        tokens: props.parsedTokens,
        maxFeePerGas: props.maxFeePerGas,
        priorityFeePerGas: props.priorityFeePerGas,
        askDataParams: props.askDataParams,
        onTxSubmitted: props.onTxSubmitted,
        minNativeTokenBalance: props.minNativeTokenBalance,
        enableQueryParams: props.enableQueryParams,
        isExactAppoval: props.isExactAppoval,
      }}
    >
      {props.children}
      <Listener {...props} />
    </TwapContext.Provider>
  );
};

export const TwapAdapter = (props: TwapLibProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Content {...props} />
    </QueryClientProvider>
  );
};

export const useTwapContext = () => {
  return useContext(TwapContext);
};
