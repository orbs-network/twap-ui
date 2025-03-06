import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { constructSDK } from "@orbs-network/twap-sdk";
import { State, TwapProps, TwapContextType, Translations } from "./types";
import { DEFAULT_LIMIT_PANEL_DURATION } from "./consts";
import { TwapErrorWrapper } from "./ErrorHandling";
import defaultTranlations from "./i18n/en.json";
import * as chains from "viem/chains";

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

const useInitiateWallet = (props: TwapProps) => {
  const [account, setAccount] = useState<`0x${string}` | undefined>(undefined);
  const chain = useMemo(() => Object.values(chains).find((it: any) => it.id === props.chainId), [props.chainId]);
  const transport = useMemo(() => (props.provider ? custom(props.provider) : undefined), [props.provider]);
  const walletClient = useMemo(() => {
    return transport ? createWalletClient({ chain, transport }) : undefined;
  }, [transport]);

  useEffect(() => {
    setAccount(undefined);
    walletClient?.getAddresses().then((addresses) => setAccount(addresses[0]));
  }, [walletClient]);

  const publicClient = useMemo(() => {
    if (!chain) return;
    return createPublicClient({ chain, transport: transport || http() });
  }, [transport, chain]);

  return {
    walletClient,
    account,
    publicClient,
  };
};

const Content = (props: TwapProps) => {
  const { state, updateState, resetState } = useStore();
  const translations = useTranslations(props.translations);
  const twapSDK = useMemo(() => constructSDK({ config: props.config }), [props.config]);
  const { walletClient, account, publicClient } = useInitiateWallet(props);
  console.log({ account });

  return (
    <TwapContext.Provider
      value={{
        ...props,
        translations,
        isWrongChain: !account || !props.chainId ? false : props.config.chainId !== props.chainId,
        updateState,
        reset: resetState,
        state,
        config: props.config,
        walletClient,
        publicClient: publicClient as any as ReturnType<typeof createPublicClient>,
        twapSDK,
        marketPrice: props.marketReferencePrice.value,
        marketPriceLoading: props.marketReferencePrice.isLoading,
        account,
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
