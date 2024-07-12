import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { State, TimeResolution, TWAPContextProps, TwapLibProps } from "../types";
import defaultTranlations from "../i18n/en.json";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { analytics } from "../analytics";
import { Status, TWAPLib } from "@orbs-network/twap";
import { TwapErrorWrapper } from "../ErrorHandling";
import Web3 from "web3";
import { query } from "../hooks/query";
import { LimitPriceMessageContent } from "../components";
import { defaultCustomFillDelay, MIN_TRADE_INTERVAL_FORMATTED, QUERY_PARAMS } from "../consts";
import { getQueryParam, getTokenFromTokensListV2, limitPriceFromQueryParams } from "../utils";
import moment from "moment";
import { useAmountBN } from "../hooks";
import _ from "lodash";
import { isNativeAddress } from "@defi.org/web3-candies";
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
  const { srcToken, dstToken } = useTwapContext().state;
  query.useFeeOnTransfer(srcToken?.address);
  query.useFeeOnTransfer(dstToken?.address);
  query.useAllowance();

  return <TwapErrorWrapper>{props.children}</TwapErrorWrapper>;
};

const useIsWrongChain = (props: TwapLibProps) => {
  const [isWrongChain, setIsWrongChain] = useState(false);
  const validateChain = useCallback(async () => {
    if (!props.provider) {
      setIsWrongChain(false);
      return;
    }
    const chain = props.connectedChainId || (await new Web3(props.provider).eth.getChainId());
    if (!chain) {
      setIsWrongChain(false);
      return;
    }

    setIsWrongChain(props.config.chainId !== chain);
  }, [props.connectedChainId, props.provider, props.config.chainId]);

  useEffect(() => {
    validateChain();
  }, [validateChain]);

  return isWrongChain;
};

const useLib = (props: TwapLibProps) => {
  const isWrongChain = useIsWrongChain(props);

  const lib = useMemo(() => {
    if (isWrongChain || !props.account || !props.provider || !props.config) return;

    return new TWAPLib(props.config, props.account!, props.provider);
  }, [isWrongChain, props.config, props.account, props.provider]);

  useEffect(() => {
    analytics.onLibInit(lib);
  }, [lib]);

  return lib;
};

export const getInitialState = ({ storeOverride = {}, isQueryParamsEnabled }: { storeOverride?: Partial<State>; isQueryParamsEnabled?: boolean }): State => {
  const tradeIntervalQueryParam = getQueryParam(QUERY_PARAMS.TRADE_INTERVAL);
  const srcAmountUi = getQueryParam(QUERY_PARAMS.INPUT_AMOUNT);
  const chunks = getQueryParam(QUERY_PARAMS.TRADES_AMOUNT);
  return {
    srcToken: undefined,
    dstToken: undefined,
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

const useDappDefaultTokens = (props: TwapLibProps, updateState: (value: Partial<State>) => void) => {
  useEffect(() => {
    if (props.srcToken) updateState({ srcToken: getTokenFromTokensListV2(props.parsedTokens, [props.srcToken]) });
    if (props.dstToken) updateState({ dstToken: getTokenFromTokensListV2(props.parsedTokens, [props.dstToken]) });
  }, [props.srcToken, props.dstToken, props.parsedTokens, updateState]);
};

const useDeadlineUpdater = (state: State, updateState: (value: Partial<State>) => void) => {
  const interval = useRef<any>();

  useEffect(() => {
    if (state.showConfirmation && !state.swapState) {
      updateState({ confirmationClickTimestamp: moment() });
      interval.current = setInterval(() => {
        updateState({ confirmationClickTimestamp: moment() });
      }, 10_000);
    }
    return () => clearInterval(interval.current);
  }, [state.showConfirmation, state.swapState, updateState]);
};

const useMarket = (props: TwapLibProps, state: State) => {
  const amount = useAmountBN(state.srcToken?.decimals, "1");
  const srcToken = isNativeAddress(state.srcToken?.address || "") ? props.config.wToken : state.srcToken;
  const dstToken = isNativeAddress(state.dstToken?.address || "") ? props.config.wToken : state.dstToken;

  return props.useMarketPrice?.({ srcToken, dstToken, amount });
};

export const TwapAdapter = (props: TwapLibProps) => {
  const translations = useMemo(() => ({ ...defaultTranlations, ...props.translations }), [props.translations]);
  const isWrongChain = useIsWrongChain(props);
  const lib = useLib(props);
  const { updateState, state } = useStore(props);
  useDeadlineUpdater(state, updateState);
  useDappDefaultTokens(props, updateState);
  const marketPrice = useMarket(props, state);

  const uiPreferences = props.uiPreferences || {};

  return (
    <QueryClientProvider client={queryClient}>
      <TwapContext.Provider value={{ dappProps: props, translations, lib, isWrongChain, state, updateState, marketPrice, uiPreferences }}>
        <WrappedTwap {...props} />
        <LimitPriceMessageContent />
      </TwapContext.Provider>
    </QueryClientProvider>
  );
};

export const useTwapContext = () => {
  return useContext(TwapContext);
};
