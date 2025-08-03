import React, { createContext, useContext, useEffect, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { amountBN, constructSDK } from "@orbs-network/twap-sdk";
import { TwapProps, TwapContextType, Translations, Components, Module } from "./types";
import {
  DEFAULT_DURATION,
  DEFAULT_STOP_LOSS_LIMIT_PERCENTAGE,
  DEFAULT_STOP_LOSS_TRIGGER_PERCENTAGE,
  DEFAULT_TAKE_PROFIT_PERCENTAGE,
  DEFAULT_TAKE_PROFIT_TRIGGER_PERCENTAGE,
} from "./consts";
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

const useDefaults = (props: TwapProps) => {
  const updateStore = useTwapStore((s) => s.updateState);
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const { module, stateDefaults, srcToken, dstToken, onInputAmountChange } = props;

  useEffect(() => {
    updateStore({ disclaimerAccepted: stateDefaults?.disclaimerAccepted });
  }, [stateDefaults, updateStore]);

  useEffect(() => {
    if (onInputAmountChange) {
      onInputAmountChange(typedSrcAmount || "", amountBN(srcToken?.decimals, typedSrcAmount));
    }
  }, [typedSrcAmount, srcToken?.decimals, onInputAmountChange]);

  // reset limit price and trigger price when src or dst token changes
  useEffect(() => {
    if (srcToken && dstToken) {
      updateStore({ typedLimitPrice: undefined, typedTriggerPrice: undefined });
    }
  }, [srcToken?.address, dstToken?.address, updateStore]);

  useEffect(() => {
    if (module === Module.LIMIT) {
      updateStore({ typedDuration: DEFAULT_DURATION, isMarketOrder: false });
    }
    if (module === Module.STOP_LOSS) {
      updateStore({
        typedDuration: DEFAULT_DURATION,
        isMarketOrder: false,
        triggerPricePercent: DEFAULT_STOP_LOSS_TRIGGER_PERCENTAGE,
        limitPricePercent: DEFAULT_STOP_LOSS_LIMIT_PERCENTAGE,
      });
    }
    if (module === Module.TAKE_PROFIT) {
      updateStore({
        typedDuration: DEFAULT_DURATION,
        isMarketOrder: false,
        triggerPricePercent: DEFAULT_TAKE_PROFIT_TRIGGER_PERCENTAGE,
        limitPricePercent: DEFAULT_TAKE_PROFIT_PERCENTAGE,
      });
    }
    if (module === Module.TWAP) {
      updateStore({ typedDuration: undefined, isMarketOrder: Boolean(stateDefaults?.isMarketOrder) });
    }
  }, [module, updateStore, stateDefaults]);

  useEffect(() => {
    setInterval(() => {
      updateStore({ currentTime: Date.now() });
    }, 60_000);
  }, [updateStore]);
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
  useDefaults(props);
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
        components: props.components || ({} as Components),
        numberFormat: props.numberFormat,
      }}
    >
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
