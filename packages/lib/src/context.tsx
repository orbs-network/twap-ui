import React, { createContext, useContext, useEffect, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { analytics } from "@orbs-network/twap-sdk";
import { TwapProps, TwapContextType, Translations } from "./types";
import defaultTranslations from "./i18n/en.json";
import { initiateWallet } from "./lib";
import { useListener } from "./hooks/use-default-values";
import { useAllowanceListener } from "./hooks/use-allowance";
import { ErrorBoundary } from "react-error-boundary";

const TwapFallbackUI = () => {
  return (
    <div className="twap-error-fallback">
      <p style={{ color: "white", fontSize: 16, fontWeight: 600, textAlign: "center", width: "100%", marginTop: 40 }}>Something went wrong</p>
    </div>
  );
};

function ErrorWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error) => {
        // You can also log the error to an error reporting service like AppSignal
        // logErrorToMyService(error, errorInfo);
        console.error(error);
      }}
      FallbackComponent={TwapFallbackUI}
    >
      <>{children}</>
    </ErrorBoundary>
  );
}

export const TwapContext = createContext({} as TwapContextType);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const useTranslations = (translations?: Partial<Translations>): Translations => {
  return useMemo(() => {
    if (!translations) return defaultTranslations;
    return {
      ...defaultTranslations,
      ...translations,
    } as Translations;
  }, [translations]);
};

const Listeners = () => {
  useListener();
  useAllowanceListener();

  return null;
};

const Content = (props: TwapProps) => {
  const translations = useTranslations(props.overrides?.translations);
  const { walletClient, publicClient } = useMemo(() => initiateWallet(props.chainId, props.provider), [props.chainId, props.provider]);

  useEffect(() => {
    analytics.init(props.config);
  }, [props.config.chainId]);

  return (
    <TwapContext.Provider
      value={{
        ...props,
        account: props.account as `0x${string}` | undefined,
        translations,
        isWrongChain: !props.account || !props.chainId ? false : props.config.chainId !== props.chainId,
        walletClient,
        publicClient,
        marketPrice: props.marketReferencePrice.value,
        marketPriceLoading: props.marketReferencePrice.isLoading,
        noLiquidity: props.marketReferencePrice.noLiquidity,
      }}
    >
      <Listeners />
      <ErrorWrapper>{props.children}</ErrorWrapper>
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
