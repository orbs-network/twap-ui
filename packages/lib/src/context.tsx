import React, { createContext, useContext, useEffect, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { constructSDK } from "@orbs-network/twap-sdk";
import { TwapProps, TwapContextType, Translations } from "./types";
import { DEFAULT_LIMIT_PANEL_DURATION } from "./consts";
import { TwapErrorWrapper } from "./ErrorHandling";
import defaultTranslations from "./i18n/en.json";
import * as chains from "viem/chains";
import { useTwapStore } from "./useTwapStore";

export const TwapContext = createContext({} as TwapContextType);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const Listeners = () => {
  const updateStore = useTwapStore((s) => s.updateState);
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);

  const { isLimitPanel, isTwapMarketByDefault, srcToken, dstToken, onSrcAmountChange, orderDisclaimerAcceptedByDefault } = useTwapContext();

  useEffect(() => {
    updateStore({ disclaimerAccepted: orderDisclaimerAcceptedByDefault });
  }, [orderDisclaimerAcceptedByDefault]);

  useEffect(() => {
    updateStore({ typedPrice: undefined, selectedPricePercent: undefined });
  }, [srcToken?.address, dstToken?.address]);

  useEffect(() => {
    if (onSrcAmountChange) {
      onSrcAmountChange(typedSrcAmount || "");
    }
  }, [typedSrcAmount]);

  useEffect(() => {
    if (isLimitPanel) {
      updateStore({ typedDuration: DEFAULT_LIMIT_PANEL_DURATION, isMarketOrder: false });
    } else {
      updateStore({ typedDuration: undefined, isMarketOrder: isTwapMarketByDefault ? true : false });
    }
  }, [isLimitPanel, updateStore, isTwapMarketByDefault]);

  useEffect(() => {
    setInterval(() => {
      updateStore({ currentTime: Date.now() });
    }, 60_000);
  }, [updateStore]);

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
