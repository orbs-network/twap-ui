import React, { createContext, useContext, useEffect, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { constructSDK } from "@orbs-network/twap-sdk";
import { TwapProps, TwapContextType, Translations } from "./types";
import { DEFAULT_LIMIT_PANEL_DURATION } from "./consts";
import { TwapErrorWrapper } from "./ErrorHandling";
import defaultTranslations from "./i18n/en.json";
import { useTwapStore } from "./useTwapStore";
import { initiateWallet } from "./lib";

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

const Content = (props: TwapProps) => {
  const translations = useTranslations(props.translations);
  const twapSDK = useMemo(() => constructSDK({ config: props.config }), [props.config]);
  const { walletClient, publicClient } = useMemo(() => initiateWallet(props.chainId, props.provider), [props.chainId, props.provider]);

  return (
    <TwapContext.Provider
      value={{
        ...props,
        account: props.account as `0x${string}` | undefined,
        translations,
        isWrongChain: !props.account || !props.chainId ? false : props.config.chainId !== props.chainId,
        walletClient,
        publicClient,
        twapSDK,
        marketPrice: props.marketReferencePrice.value,
        marketPriceLoading: props.marketReferencePrice.isLoading,
        noLiquidity: props.marketReferencePrice.noLiquidity,
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
