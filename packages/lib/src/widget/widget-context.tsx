import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { State, WidgetContextType, Translations, WidgetProps } from "../types";
import defaultTranlations from "../i18n/en.json";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TwapErrorWrapper } from "../ErrorHandling";
import Web3 from "web3";
import { setWeb3Instance } from "@defi.org/web3-candies";
import { useTwap } from "@orbs-network/twap-ui-sdk";
import { query } from "../hooks/query";
import { styled } from "@mui/material";
import { Orders } from "./components/orders/Orders";
import { SubmitOrderModal } from "./components/submit-order-modal/SubmitOrderModal";
import { PoweredbyOrbsWithPortal } from "./components/powered-by-orbs";

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
  RESET = "RESET",
}
type Action = { type: ActionType.UPDATED_STATE; value: Partial<State> } | { type: ActionType.RESET };

const initialState = {
  disclaimerAccepted: true,
} as State;

const contextReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.UPDATED_STATE:
      return { ...state, ...action.value };
    case ActionType.RESET:
      return initialState;
    default:
      return state;
  }
};

const Listeners = () => {
  query.useAllowance();

  return null;
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

const useStore = () => {
  const [state, dispatch] = useReducer(contextReducer, initialState);
  const updateState = useCallback((value: Partial<State>) => dispatch({ type: ActionType.UPDATED_STATE, value }), [dispatch]);

  const resetState = useCallback(() => dispatch({ type: ActionType.RESET }), [dispatch]);
  return {
    state,
    updateState,
    resetState,
  };
};

export const WidgetProvider = (props: WidgetProps) => {
  const isWrongChain = useIsWrongChain(props, props.chainId);
  const web3 = useMemo(() => (!props.provider ? undefined : new Web3(props.provider)), [props.provider]);
  const { state, updateState, resetState } = useStore();
  const twap = useTwap({
    config: props.config,
    isLimitPanel: props.isLimitPanel,
    srcToken: props.srcToken,
    destToken: props.dstToken,
    marketPriceOneToken: props.marketPrice,
    oneSrcTokenUsd: props.srcUsd,
    typedSrcAmount: state.srcAmount,
  });
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
          resetState,
          state,
          uiPreferences: props.uiPreferences || {},
          twap,
        }}
      >
        <Listeners />
        <TwapErrorWrapper>
          <Orders />
          <SubmitOrderModal />
          <PoweredbyOrbsWithPortal />
          {props.withStyles ? <Container className="twap-widget">{props.children}</Container> : <div className="twap-widget">{props.children}</div>}
        </TwapErrorWrapper>
      </WidgetContext.Provider>
    </QueryClientProvider>
  );
};

const Container = styled("div")({});

export const useWidgetContext = () => {
  return useContext(WidgetContext);
};
