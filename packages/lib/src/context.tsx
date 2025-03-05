import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createWalletClient, custom } from "viem";
import { constructSDK } from "@orbs-network/twap-sdk";
import { State, TwapProps, TwapContextType, Translations } from "./types";
import { DEFAULT_LIMIT_PANEL_DURATION } from "./consts";
import { TwapErrorWrapper } from "./ErrorHandling";
import defaultTranlations from "./i18n/en.json";

export const TwapContext = createContext({} as TwapContextType);
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
  currentTime: Date.now(),
} as State;

const contextReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.UPDATED_STATE:
      return { ...state, ...action.value };
    case ActionType.RESET:
      return {
        ...initialState,
        currentTime: Date.now(),
      };
    default:
      return state;
  }
};

const Listeners = () => {
  const { isLimitPanel, updateState } = useTwapContext();

  useEffect(() => {
    if (isLimitPanel) {
      updateState({ typedDuration: DEFAULT_LIMIT_PANEL_DURATION, isMarketOrder: false });
    } else {
      updateState({ typedDuration: undefined });
    }
  }, [isLimitPanel, updateState]);

  useEffect(() => {
    setInterval(() => {
      updateState({ currentTime: Date.now() });
    }, 60_000);
  }, [updateState]);

  return null;
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

const useInitiateWalletClient = (props: TwapProps) => {
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [account, setAccount] = useState<string | undefined>(undefined);
  const walletClient = useMemo(() => {
    const transport = props.provider ? custom(props.provider) : undefined;
    if (!transport) {
      return;
    }

    return createWalletClient({ account: undefined, chain: undefined, transport });
  }, [props.provider]);

  useEffect(() => {
    setChainId(undefined);
    setAccount(undefined);
    walletClient?.getChainId().then((chain) => {
      setChainId(chain);
    });
    walletClient?.getAddresses().then((addresses) => {
      setAccount(addresses[0]);
    });
  }, [walletClient]);

  return {
    walletClient,
    chainId,
    account,
  };
};

const Content = (props: TwapProps) => {
  const { state, updateState, resetState } = useStore();
  const translations = useTranslations(props.translations);
  const twapSDK = useMemo(() => constructSDK({ config: props.config }), [props.config]);
  const { chainId, walletClient, account } = useInitiateWalletClient(props);

  return (
    <TwapContext.Provider
      value={{
        ...props,
        translations,
        isWrongChain: !account || !chainId ? false : props.config.chainId !== chainId,
        updateState,
        reset: resetState,
        state,
        config: props.config,
        walletClient,
        twapSDK,
        marketPrice: props.marketReferencePrice.value,
        marketPriceLoading: props.marketReferencePrice.isLoading,
        account,
        chainId,
      }}
    >
      <Listeners />
      <TwapErrorWrapper>{props.children}</TwapErrorWrapper>
    </TwapContext.Provider>
  );
};

export const TwapProvider = (props: TwapProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Content {...props} />
    </QueryClientProvider>
  );
};

export const useTwapContext = () => {
  if (!TwapContext) {
    throw new Error("useTwapContext must be used within a WidgetProvider");
  }
  return useContext(TwapContext);
};
