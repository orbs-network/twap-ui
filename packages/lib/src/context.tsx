import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createWalletClient, custom, createPublicClient, http } from "viem";
import { mainnet, polygon, bsc, arbitrum, sonic, sei, avalanche, fantom, base, linea, zksync, scroll, zircuit } from "viem/chains";
import { constructSDK, networks } from "@orbs-network/twap-sdk";
import { State, TwapProps, TwapContextType, Translations } from "./types";
import { DEFAULT_LIMIT_PANEL_DURATION } from "./consts";
import { TwapErrorWrapper } from "./ErrorHandling";
import defaultTranlations from "./i18n/en.json";

const viemChains = {
  [networks.eth.id]: mainnet,
  [networks.bsc.id]: bsc,
  [networks.poly.id]: polygon,
  [networks.arb.id]: arbitrum,
  [networks.avax.id]: avalanche,
  [networks.ftm.id]: fantom,
  [networks.base.id]: base,
  [networks.linea.id]: linea,
  [networks.zircuit.id]: zircuit,
  [networks.zksync.id]: zksync,
  [networks.scroll.id]: scroll,
  [networks.sonic.id]: sonic,
  [networks.sei.id]: sei,
};

export function getViemChain(chainId?: number) {
  if (!chainId) return null; // Returns null if no chainId
  return viemChains[chainId as keyof typeof viemChains] || null; // Returns the chain or null if not found
}
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

const useIsWrongChain = (props: TwapProps, chainId?: number) => {
  return useMemo(() => {
    if (!props.account || !chainId) return false;
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

const useClients = (props: TwapProps) => {
  console.log(props.walletClientTransport);
  return useMemo(() => {
    try {
      const viemChain = getViemChain(props.chainId);

      if (!viemChain) return undefined;
      const custom1 = props.web3Provider ? custom(props.web3Provider) : undefined;
      const custom2 = props.walletClientTransport ? custom(props.walletClientTransport) : undefined;
      const transport = custom1 || custom2;

      return {
        walletClient: transport ? createWalletClient({ account: props.account as `0x${string}`, chain: viemChain, transport }) : undefined,
        publicClient: createPublicClient({ chain: viemChain, transport: transport || http() }),
      };
    } catch (error) {
      console.log({ error });
      return;
    }
  }, [props.chainId, props.web3Provider, props.account, props.walletClientTransport]);
};

const Content = (props: TwapProps) => {
  const isWrongChain = useIsWrongChain(props, props.chainId);
  const { state, updateState, resetState } = useStore();
  const translations = useTranslations(props.translations);
  const clients = useClients(props);
  const twapSDK = useMemo(() => constructSDK({ config: props.config }), [props.config]);

  return (
    <TwapContext.Provider
      value={{
        ...props,
        translations,
        isWrongChain,
        updateState,
        reset: resetState,
        state,
        uiPreferences: props.uiPreferences || {},
        config: props.config,
        walletClient: clients?.walletClient,
        publicClient: clients?.publicClient,
        twapSDK,
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
