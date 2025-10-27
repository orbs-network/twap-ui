import React, { createContext, useContext, useEffect, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { analytics, getConfig, Module } from "@orbs-network/twap-sdk";
import { TwapProps, TwapContextType } from "../types";
import { initiateWallet } from "../lib";
import { ErrorBoundary } from "react-error-boundary";
import { useTwapStore } from "../useTwapStore";
import BN from "bignumber.js";

const TwapFallbackUI = () => {
  return (
    <div className="twap-error-fallback">
      <p style={{ fontSize: 20, fontWeight: 600, textAlign: "center", width: "100%", marginTop: 40 }}>Something went wrong</p>
    </div>
  );
};

function ErrorWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={TwapFallbackUI}>
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

const Listeners = (props: TwapProps) => {
  const updateStore = useTwapStore((s) => s.updateState);
  // update current time every minute, so the deadline will be updated when confirmation window is open
  useEffect(() => {
    setInterval(() => {
      updateStore({ currentTime: Date.now() });
    }, 60_000);
  }, [updateStore]);

  useEffect(() => {
    updateStore({
      isMarketOrder: props.module !== Module.LIMIT ? false : props.overrides?.state?.isMarketOrder,
      typedChunks: props.overrides?.state?.chunks,
      typedFillDelay: props.overrides?.state?.fillDelay,
      typedDuration: props.overrides?.state?.duration,
      typedLimitPrice: props.overrides?.state?.limitPrice,
      typedTriggerPrice: props.overrides?.state?.triggerPrice,
    });
  }, [props.overrides?.state]);

  useEffect(() => {
    if (props.module === Module.LIMIT) {
      updateStore({ isMarketOrder: false });
    }
  }, [props.module]);

  return null;
};

const useParsedMarketPrice = ({ marketReferencePrice }: TwapProps) => {
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);

  return useMemo(() => {
    if (BN(marketReferencePrice.value || 0).isZero()) return marketReferencePrice;
    if (BN(typedSrcAmount || 0).isZero()) return marketReferencePrice;
    const value = BN(marketReferencePrice.value || 0)
      .dividedBy(typedSrcAmount || 0)
      .toFixed();

    return {
      ...marketReferencePrice,
      value,
    };
  }, [marketReferencePrice, typedSrcAmount]);
};

const Content = (props: TwapProps) => {
  const acceptedMarketPrice = useTwapStore((s) => s.state.acceptedMarketPrice);
  const { walletClient, publicClient } = useMemo(() => initiateWallet(props.chainId, props.provider), [props.chainId, props.provider]);
  const config = useMemo(() => getConfig(props.chainId, props.partner), [props.chainId, props.partner]);
  const marketReferencePrice = useParsedMarketPrice(props);

  useEffect(() => {
    if (config && props.chainId) {
      analytics.init(config, props.chainId);
    }
  }, [config, props.chainId]);

  return (
    <TwapContext.Provider
      value={{
        ...props,
        account: props.account as `0x${string}` | undefined,
        walletClient,
        publicClient,
        marketPrice: acceptedMarketPrice || marketReferencePrice.value,
        marketPriceLoading: !acceptedMarketPrice && marketReferencePrice.isLoading,
        noLiquidity: !acceptedMarketPrice && marketReferencePrice.noLiquidity,
        config,
      }}
    >
      <Listeners {...props} />
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
