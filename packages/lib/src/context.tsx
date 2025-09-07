import React, { createContext, useContext, useEffect, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { amountBN, constructSDK } from "@orbs-network/twap-sdk";
import { TwapProps, TwapContextType, Translations, Components } from "./types";
import { DEFAULT_LIMIT_PANEL_DURATION } from "./consts";
import { TwapErrorWrapper } from "./ErrorHandling";
import defaultTranslations from "./i18n/en.json";
import { useTwapStore } from "./useTwapStore";
import { initiateWallet } from "./lib";
import BN from "bignumber.js";

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

  const { isLimitPanel, panel, isTwapMarketByDefault, srcToken, dstToken, onInputAmountChange, orderDisclaimerAcceptedByDefault } = useTwapContext();

  useEffect(() => {
    updateStore({ disclaimerAccepted: orderDisclaimerAcceptedByDefault });
  }, [orderDisclaimerAcceptedByDefault]);

  useEffect(() => {
    updateStore({ typedPrice: undefined, selectedPricePercent: undefined });
  }, [srcToken?.address, dstToken?.address]);

  useEffect(() => {
    if (onInputAmountChange) {
      onInputAmountChange(typedSrcAmount || "", amountBN(srcToken?.decimals, typedSrcAmount));
    }
  }, [typedSrcAmount, srcToken?.decimals, onInputAmountChange]);

  useEffect(() => {
    if (isLimitPanel || panel === "LIMIT" || panel === "STOP_LOSS") {
      updateStore({ typedDuration: DEFAULT_LIMIT_PANEL_DURATION, isMarketOrder: false });
    } else {
      updateStore({ typedDuration: undefined, isMarketOrder: isTwapMarketByDefault ? true : false });
    }
  }, [isLimitPanel, updateStore, isTwapMarketByDefault, panel]);

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

const useParsedMarketPrice = ({ marketReferencePrice }: TwapProps) => {
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);

  return useMemo(() => {
    if (!marketReferencePrice.isExact || BN(typedSrcAmount || 0).isZero()) {
      return marketReferencePrice;
    }
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
  const translations = useTranslations(props.translations);
  const twapSDK = useMemo(() => constructSDK({ config: props.config }), [props.config]);
  const { walletClient, publicClient } = useMemo(() => initiateWallet(props.chainId, props.provider), [props.chainId, props.provider]);
  const marketReferencePrice = useParsedMarketPrice(props);
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
        marketPrice: marketReferencePrice.value,
        marketPriceLoading: marketReferencePrice.isLoading,
        noLiquidity: marketReferencePrice.noLiquidity,
        components: props.components || ({} as Components),
        numberFormat: props.numberFormat,
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
