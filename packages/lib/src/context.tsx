import React, { createContext, useContext } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TwapProps, TwapContextType } from "./types";
import { TwapErrorWrapper } from "./ErrorHandling";
import { useInitTwap, useTwapListeners } from "./hooks/hooks";

export const TwapContext = createContext({} as TwapContextType);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const Listeners = () => {
  const { isLimitPanel, updateState, isTwapMarketByDefault, srcToken, dstToken, onSrcAmountChange, state } = useTwapContext();
  useTwapListeners({ isLimitPanel, updateState, isTwapMarketByDefault, srcToken, dstToken, onSrcAmountChange, state });

  return null;
};

const Content = (props: TwapProps) => {
  const { state, updateState, resetState, translations, twapSDK, walletClient, publicClient, isWrongChain } = useInitTwap(props);
  return (
    <TwapContext.Provider
      value={{
        ...props,
        account: props.account as `0x${string}` | undefined,
        translations,
        isWrongChain,
        updateState,
        reset: resetState,
        state,
        walletClient,
        publicClient,
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
