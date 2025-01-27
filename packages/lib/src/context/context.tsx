import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { State, WidgetContextType, Translations, WidgetProps } from "../types";
import defaultTranlations from "../i18n/en.json";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TwapErrorWrapper } from "../ErrorHandling";
import Web3 from "web3";
import { query } from "../hooks/query";
import { LimitPriceMessageContent } from "../components";
import { setWeb3Instance } from "@defi.org/web3-candies";
import { TwapProvider, useListeners, useTwapContext } from "@orbs-network/twap-ui-sdk";

export const WidgetContext = createContext({} as WidgetContextType);
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

const Listeners = (props: WidgetProps) => {
  query.useAllowance();
  useListeners(props.srcToken, props.dstToken, props.marketPrice, props.srcUsd);

  return <>{props.children}</>;
};

const useIsWrongChain = (props: WidgetProps, chainId?: number) => {
  return useMemo(() => {
    if (!props.account || !chainId) {
      return false;
    }

    return props.config.chainId !== chainId;
  }, [chainId, props.account, props.config.chainId]);
};

export const useTranslations = (translations?: Partial<Translations>): Translations => {
  return useMemo(() => {
    if (!translations) return defaultTranlations;
    return {
      ...defaultTranlations,
      ...translations,
    } as Translations;
  }, [translations]);
};

export const WidgetProvider = (props: WidgetProps) => {
  const isWrongChain = useIsWrongChain(props, props.chainId);
  const web3 = useMemo(() => (!props.provider ? undefined : new Web3(props.provider)), [props.provider]);
  const [state, dispatch] = useReducer(contextReducer, initialState);
  const updateState = useCallback((value: Partial<State>) => dispatch({ type: ActionType.UPDATED_STATE, value }), [dispatch]);
  const translations = useTranslations(props.translations);
  useEffect(() => {
    setWeb3Instance(web3);
  }, [web3]);
  return (
    <QueryClientProvider client={queryClient}>
      <WidgetContext.Provider
        value={{
          ...props,
          translations,
          isWrongChain,
          web3,
          updateState,
          state,
          uiPreferences: props.uiPreferences || {},
        }}
      >
        <TwapErrorWrapper>
          <TwapProvider chainId={props.chainId} config={props.config} isLimitPanel={props.isLimitPanel}>
            <Listeners {...props}>{props.children}</Listeners>
          </TwapProvider>
        </TwapErrorWrapper>
        <LimitPriceMessageContent />
      </WidgetContext.Provider>
    </QueryClientProvider>
  );
};

export const useWidgetContext = () => {
  return useContext(WidgetContext);
};
