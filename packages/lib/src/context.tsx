import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { TwapContextUIPreferences, TwapLibProps } from "./types";
import { useInitLib, useMaxPossibleChunks, useMaxPossibleChunksReady, usePriceUSD, useSetChunks, useUpdateStoreOveride } from "./hooks";
import defaultTranlations from "./i18n/en.json";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { analytics } from "./analytics";
import { TokenData } from "@orbs-network/twap";
import { TwapErrorWrapper } from "./ErrorHandling";
import { Wizard } from "./components";
import { useLimitPriceStore, useTwapStore } from "./store";
import BN from "bignumber.js";
import { getQueryParam, setQueryParam } from "./utils";
import { QUERY_PARAMS } from "./consts";
analytics.onLoad();

export interface TWAPContextProps extends TwapLibProps {
  uiPreferences: TwapContextUIPreferences;
}

export const TwapContext = createContext({} as TWAPContextProps);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const Listener = (props: TwapLibProps) => {
  const initLib = useInitLib();
  const updateStoreOveride = useUpdateStoreOveride();
  const limitStore = useLimitPriceStore();
  const enableQueryParams = props.enableQueryParams;
  const { chunks } = useTwapStore();
  const maxPossibleChunks = useMaxPossibleChunks();
  const maxPossibleChunksReady = useMaxPossibleChunksReady();
  const { updateState } = useTwapStore((state) => ({
    updateState: state.updateState,
  }));
  const setChunks = useSetChunks();
  useEffect(() => {
    if (maxPossibleChunksReady && chunks && chunks > maxPossibleChunks) {
      setChunks(maxPossibleChunks);
    }
  }, [chunks, maxPossibleChunks, setChunks, maxPossibleChunksReady]);

  useEffect(() => {
    const limitPrice = getQueryParam(QUERY_PARAMS.LIMIT_PRICE);
    const gainPercent = getQueryParam(QUERY_PARAMS.LIMIT_PRICE_GAIN);
    if (!enableQueryParams) return;

    if (limitPrice) {
      limitStore.onLimitInput(BN(limitPrice || 0).gt(0) ? limitPrice : undefined);
      setQueryParam(QUERY_PARAMS.LIMIT_PRICE_GAIN, undefined);
    } else if (gainPercent) {
      setQueryParam(QUERY_PARAMS.LIMIT_PRICE, undefined);
      limitStore.setGainPercent(BN(gainPercent || 0).gt(0) ? Number(gainPercent) : undefined);
    }
  }, [enableQueryParams, limitStore.onLimitInput, limitStore.setGainPercent]);

  useEffect(() => {
    setInterval(() => {
      updateState({ currentTime: Date.now() });
    }, 60_000);
  }, [updateState]);

  useEffect(() => {
    if (props.connectedChainId) {
      analytics.onConfigChange(props.config);
    }
  }, [props.config.partner, props.connectedChainId]);

  useEffect(() => {
    updateStoreOveride(props.storeOverride);
  }, [updateStoreOveride, props.storeOverride]);

  useEffect(() => {
    // init web3 every time the provider changes

    initLib({ config: props.config, provider: props.provider, account: props.account, connectedChainId: props.connectedChainId });
  }, [props.provider, props.config, props.account, props.connectedChainId]);

  return null;
};

const WrappedTwap = (props: TwapLibProps) => {
  return (
    <TwapErrorWrapper>
      <Listener {...props} />
      <Wizard />
      {props.children}
    </TwapErrorWrapper>
  );
};

export const TwapAdapter = (props: TwapLibProps) => {
  const translations = useMemo(() => ({ ...defaultTranlations, ...props.translations }), [props.translations]);

  return (
    <QueryClientProvider client={queryClient}>
      <TwapContext.Provider value={{ ...props, translations, uiPreferences: props.uiPreferences || {} }}>
        <WrappedTwap {...props} />
      </TwapContext.Provider>
    </QueryClientProvider>
  );
};

export const useTwapContext = () => {
  return useContext(TwapContext);
};
