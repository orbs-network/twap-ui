import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { State, TimeResolution, TWAPContextProps, TwapLibProps } from "../types";
import defaultTranlations from "../i18n/en.json";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { analytics } from "../analytics";
import { TwapErrorWrapper } from "../ErrorHandling";
import Web3 from "web3";
import { query } from "../hooks/query";
import { LimitPriceMessageContent } from "../components";
import { defaultCustomFillDelay, MIN_TRADE_INTERVAL_FORMATTED, QUERY_PARAMS } from "../consts";
import { getQueryParam, limitPriceFromQueryParams } from "../utils";
import moment from "moment";
import { setWeb3Instance } from "@defi.org/web3-candies";
analytics.onModuleImported();

export const TwapContext = createContext({} as TWAPContextProps);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const WrappedTwap = (props: TwapLibProps) => {
  const { srcToken, dstToken } = useTwapContext();
  query.useFeeOnTransfer(srcToken?.address);
  query.useFeeOnTransfer(dstToken?.address);
  query.useAllowance();

  return <TwapErrorWrapper>{props.children}</TwapErrorWrapper>;
};

const Listener = (props: TwapLibProps) => {
  const interval = useRef<any>();
  const { state, updateState, account } = useTwapContext();

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

export const getInitialState = ({ storeOverride = {}, isQueryParamsEnabled }: { storeOverride?: Partial<State>; isQueryParamsEnabled?: boolean }): State => {
  const tradeIntervalQueryParam = getQueryParam(QUERY_PARAMS.TRADE_INTERVAL);
  const srcAmountUi = getQueryParam(QUERY_PARAMS.INPUT_AMOUNT);
  const chunks = getQueryParam(QUERY_PARAMS.TRADES_AMOUNT);
  return {
    srcAmountUi: !isQueryParamsEnabled ? "" : srcAmountUi || "",

    confirmationClickTimestamp: moment(),
    showConfirmation: false,
    disclaimerAccepted: true,

    customChunks: !isQueryParamsEnabled ? undefined : chunks ? Number(chunks) : undefined,
    customFillDelay: !isQueryParamsEnabled
      ? defaultCustomFillDelay
      : { resolution: TimeResolution.Minutes, amount: tradeIntervalQueryParam ? Number(tradeIntervalQueryParam) : MIN_TRADE_INTERVAL_FORMATTED },

    isMarketOrder: false,
    isCustomLimitPrice: !!limitPriceFromQueryParams(),
    customLimitPrice: limitPriceFromQueryParams(),
    selectedOrdersTab: 0,
    ...storeOverride,
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
  const [state, dispatch] = useReducer(contextReducer, getInitialState({ storeOverride: props.storeOverride, isQueryParamsEnabled: props.enableQueryParams }));
  const updateState = useCallback((value: Partial<State>) => dispatch({ type: ActionType.UPDATED_STATE, value }), [dispatch]);
  return {
    updateState,
    state,
  };
};

const useIsWrongChain = (props: TwapLibProps, chainId?: number) => {
  return useMemo(() => {
    if (props.isWrongChain) {
      return true;
    }
    if (!chainId) {
      return false;
    }

    return chainId !== props.config?.chainId;
  }, [chainId, props.config?.chainId, props.isWrongChain]);
};

export const Content = (props: TwapLibProps) => {
  const { config } = props;
  const translations = useMemo(() => ({ ...defaultTranlations, ...props.translations }), [props.translations]);
  const isWrongChain = useIsWrongChain(props, props.chainId);
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
      }}
    >
      <WrappedTwap {...props} />
      <LimitPriceMessageContent />
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
