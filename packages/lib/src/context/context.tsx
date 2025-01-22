import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { State, TWAPContextProps, TwapLibProps } from "../types";
import defaultTranlations from "../i18n/en.json";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TwapErrorWrapper } from "../ErrorHandling";
import Web3 from "web3";
import { query } from "../hooks/query";
import { LimitPriceMessageContent } from "../components";
import { setWeb3Instance } from "@defi.org/web3-candies";
import { TwapProvider as TwapProviderUI, useTwapContext as useTwapContextUI } from "@orbs-network/twap-ui-sdk";

export const TwapContext = createContext({} as TWAPContextProps);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

enum ActionType {
  UPDATED_STATE = "UPDATED_STATE",
}
type Action = { type: ActionType.UPDATED_STATE; value: Partial<State> };

const initialState = {
  disclaimerAccepted: true,
} as State;

const contextReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.UPDATED_STATE:
      return { ...state, ...action.value };
    default:
      return state;
  }
};

const WrappedTwap = (props: TwapLibProps) => {
  return (
    <TwapErrorWrapper>
      <TwapProviderUI parseToken={props.parseToken} isLimitPanel={props.isLimitPanel} config={props.config}>
        <Panel {...props}>{props.children}</Panel>
      </TwapProviderUI>
    </TwapErrorWrapper>
  );
};

const Panel = (props: TwapLibProps) => {
  const { actionHandlers } = useTwapContextUI();
  query.useAllowance();

  useEffect(() => {
    actionHandlers.setMarketPrice(props.marketPrice || "");
  }, [props.marketPrice]);

  useEffect(() => {
    actionHandlers.setSrcToken(props.srcToken);
  }, [props.srcToken]);

  useEffect(() => {
    actionHandlers.setDstToken(props.dstToken);
  }, [props.dstToken]);

  useEffect(() => {
    actionHandlers.setOneSrcTokenUsd(props.srcUsd ? Number(props.srcUsd) : 0);
  }, [props.srcUsd]);

  return <>{props.children}</>;
};

const useIsWrongChain = (props: TwapLibProps, chainId?: number) => {
  return useMemo(() => {
    if (!props.account) {
      return false;
    }
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
  const uiPreferences = props.uiPreferences || {};
  const web3 = useMemo(() => (!props.provider ? undefined : new Web3(props.provider)), [props.provider]);
  const [state, dispatch] = useReducer(contextReducer, initialState);

  const updateState = useCallback((value: Partial<State>) => dispatch({ type: ActionType.UPDATED_STATE, value }), [dispatch]);

  useEffect(() => {
    setWeb3Instance(web3);
  }, [web3]);

  return (
    <TwapContext.Provider
      value={{
        translations,
        isWrongChain,
        marketPrice: props.marketPrice,
        uiPreferences,
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
        tokens: props.parsedTokens || [],
        maxFeePerGas: props.maxFeePerGas,
        priorityFeePerGas: props.priorityFeePerGas,
        askDataParams: props.askDataParams,
        onTxSubmitted: props.onTxSubmitted,
        minNativeTokenBalance: props.minNativeTokenBalance,
        enableQueryParams: props.enableQueryParams,
        isExactAppoval: props.isExactAppoval,
        fee: props.fee,
        nativeUsd: props.nativeUsd,
        useDappToken: props.useDappToken,
        useParsedToken: props.useParsedToken,
        updateState,
        state,
      }}
    >
      <WrappedTwap {...props} />
      <LimitPriceMessageContent />
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
