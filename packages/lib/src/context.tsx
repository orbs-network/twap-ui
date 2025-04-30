import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { constructSDK } from "@orbs-network/twap-sdk";
import { State, TwapProps, TwapContextType, Translations } from "./types";
import { DEFAULT_LIMIT_PANEL_DURATION } from "./consts";
import { TwapErrorWrapper } from "./ErrorHandling";
import defaultTranslations from "./i18n/en.json";
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
        trade: state.trade,
        swapStatus: state.swapStatus,
        isMarketOrder: state.isMarketOrder,
      };
    default:
      return state;
  }
};

const getInitialState = ({ orderDisclaimerAcceptedByDefault = true }: TwapProps) => {
  return {
    ...initialState,
    disclaimerAccepted: orderDisclaimerAcceptedByDefault,
  };
};

const Listeners = () => {
  const { isLimitPanel, updateState, isTwapMarketByDefault, srcToken, dstToken, onSrcAmountChange, state } = useTwapContext();

  useEffect(() => {
    updateState({ typedPrice: undefined, selectedPricePercent: undefined });
  }, [srcToken?.address, dstToken?.address]);

  useEffect(() => {
    if (onSrcAmountChange) {
      onSrcAmountChange(state.typedSrcAmount);
    }
  }, [onSrcAmountChange, state.typedSrcAmount]);

  useEffect(() => {
    if (isLimitPanel) {
      updateState({ typedDuration: DEFAULT_LIMIT_PANEL_DURATION, isMarketOrder: false });
    } else {
      updateState({ typedDuration: undefined, isMarketOrder: isTwapMarketByDefault ? true : false });
    }
  }, [isLimitPanel, updateState, isTwapMarketByDefault]);

  useEffect(() => {
    setInterval(() => {
      updateState({ currentTime: Date.now() });
    }, 60_000);
  }, [updateState]);

  return null;
};

const useTranslations = (translations?: Partial<Translations>): Translations => {
  return useMemo(() => {
    if (!translations) return defaultTranslations;
    return {
      ...defaultTranslations,
      ...translations,
    } as Translations;
  }, [translations]);
};

const useStore = (props: TwapProps) => {
  const [state, dispatch] = useReducer(contextReducer, getInitialState(props));
  const updateState = useCallback((value: Partial<State>) => dispatch({ type: ActionType.UPDATED_STATE, value }), [dispatch]);

  const resetState = useCallback(() => dispatch({ type: ActionType.RESET }), [dispatch]);
  return {
    state,
    updateState,
    resetState,
  };
};

const useInitiateWallet = (props: TwapProps) => {
  const chain = useMemo(() => Object.values(chains).find((it: any) => it.id === props.chainId), [props.chainId]);
  const transport = useMemo(() => (props.provider ? custom(props.provider) : undefined), [props.provider]);
  const walletClient = useMemo(() => {
    return transport ? createWalletClient({ chain, transport }) : undefined;
  }, [transport]);

  const publicClient = useMemo(() => {
    if (!chain) return;
    return createPublicClient({ chain, transport: transport || http() });
  }, [transport, chain]);

  return {
    walletClient,
    publicClient,
  };
};

const Content = (props: TwapProps) => {
  const { state, updateState, resetState } = useStore(props);
  const translations = useTranslations(props.translations);
  const twapSDK = useMemo(() => constructSDK({ config: props.config }), [props.config]);
  const { walletClient, publicClient } = useInitiateWallet(props);

  return (
    <TwapContext.Provider
      value={{
        ...props,
        account: props.account as `0x${string}` | undefined,
        translations,
        isWrongChain: !props.account || !props.chainId ? false : props.config.chainId !== props.chainId,
        updateState,
        reset: resetState,
        state,
        walletClient,
        publicClient: publicClient as any as ReturnType<typeof createPublicClient>,
        twapSDK,
        marketPrice: props.marketReferencePrice.value,
        marketPriceLoading: props.marketReferencePrice.isLoading,
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
