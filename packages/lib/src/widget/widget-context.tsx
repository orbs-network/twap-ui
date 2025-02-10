import React, { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import { State, WidgetContextType, Translations, WidgetProps } from "../types";
import defaultTranlations from "../i18n/en.json";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TwapErrorWrapper } from "../ErrorHandling";
import { networks } from "@defi.org/web3-candies";
import { useTwap } from "@orbs-network/twap-ui-sdk";
import { Orders } from "./components/orders/Orders";
import { SubmitOrderModal } from "./components/submit-order-modal/SubmitOrderModal";
import { PoweredbyOrbsWithPortal } from "./components/powered-by-orbs";
import { LimitPriceWarningPortal } from "../components";
import { useHasAllowance } from "../hooks/useAllowance";
import { createWalletClient, custom, createPublicClient, http } from "viem";
import { mainnet, polygon, bsc, arbitrum, sonic, sei, avalanche, fantom, base, linea, zksync, scroll } from "viem/chains";

const viemChains = {
  [networks.eth.id]: mainnet,
  [networks.bsc.id]: bsc,
  [networks.poly.id]: polygon,
  [networks.arb.id]: arbitrum,
  [networks.avax.id]: avalanche,
  [networks.ftm.id]: fantom,
  [networks.base.id]: base,
  [networks.linea.id]: linea,
  [networks.zksync.id]: zksync,
  [networks.scroll.id]: scroll,
  [networks.sonic.id]: sonic,
  [networks.sei.id]: sei,
};

export function getViemChain(chainId?: number) {
  if (!chainId) return null; // Returns null if no chainId
  return viemChains[chainId as keyof typeof viemChains] || null; // Returns the chain or null if not found
}
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
      return {
        ...initialState,
        newOrderLoading: state.newOrderLoading,
      };
    default:
      return state;
  }
};

const Listeners = () => {
  useHasAllowance();

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

const useClients = (props: WidgetProps) => {
  return useMemo(() => {
    const viemChain = getViemChain(props.chainId);
    if (!viemChain) return;
    const walletProvider = props.walletProvider?.currentProvider;
    const transport = props.walletClientTransport || walletProvider ? custom(walletProvider) : undefined;

    return {
      walletClient: transport ? createWalletClient({ account: props.account, chain: viemChain, transport }) : undefined,
      publicClient: createPublicClient({ chain: viemChain, transport: transport || http() }),
    };
  }, [props.chainId, props.walletProvider, props.account, props.walletClientTransport]);
};

export const WidgetProvider = (props: WidgetProps) => {
  const isWrongChain = useIsWrongChain(props, props.chainId);

  const config = useMemo(() => {
    if (!props.minChunkSizeUsd) {
      return props.config;
    }
    return {
      ...props.config,
      minChunkSizeUsd: props.minChunkSizeUsd,
    };
  }, [props.config, props.minChunkSizeUsd]);

  const { state, updateState, resetState } = useStore();
  const twap = useTwap({
    config,
    isLimitPanel: props.isLimitPanel,
    srcToken: props.srcToken,
    destToken: props.dstToken,
    marketPriceOneToken: props.marketPrice,
    oneSrcTokenUsd: props.srcUsd1Token,
    typedSrcAmount: state.srcAmount,
  });
  const translations = useTranslations(props.translations);
  const clients = useClients(props);

  return (
    <QueryClientProvider client={queryClient}>
      <WidgetContext.Provider
        value={{
          ...props,
          translations,
          isWrongChain,
          updateState,
          resetState,
          state,
          uiPreferences: props.uiPreferences || {},
          twap,
          config,
          walletClient: clients?.walletClient,
          publicClient: clients?.publicClient,
        }}
      >
        <Listeners />
        <TwapErrorWrapper>
          <Orders />
          <SubmitOrderModal />
          <PoweredbyOrbsWithPortal />
          <LimitPriceWarningPortal />
          <div className="twap-widget">{props.children}</div>
        </TwapErrorWrapper>
      </WidgetContext.Provider>
    </QueryClientProvider>
  );
};

export const useWidgetContext = () => {
  return useContext(WidgetContext);
};
