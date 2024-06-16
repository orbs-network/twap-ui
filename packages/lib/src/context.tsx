import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { TwapContextUIPreferences, TwapLibProps } from "./types";
import { useParseTokens, usePriceUSD, useSetTokensFromDapp, useUpdateStoreOveride } from "./hooks";
import defaultTranlations from "./i18n/en.json";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { TokenData, TWAPLib } from "@orbs-network/twap";
import { TwapErrorWrapper } from "./ErrorHandling";
import { Wizard } from "./components";
import { useLimitPriceStore, useTwapStore } from "./store";
import BN from "bignumber.js";
import { getQueryParam } from "./utils";
import { QUERY_PARAMS } from "./consts";
import Web3 from "web3";
import { Analytics } from "./analytics";
Analytics.onModuleLoaded();

export interface TWAPContextProps extends TwapLibProps {
  tokenList: TokenData[];
  uiPreferences: TwapContextUIPreferences;
  web3?: Web3;
  lib?: TWAPLib;
  isWrongChain?: boolean;
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
  const setTokensFromDappCallback = useSetTokensFromDapp();
  const updateStoreOveride = useUpdateStoreOveride();
  const limitStore = useLimitPriceStore();
  const enableQueryParams = props.enableQueryParams;
  useEffect(() => {
    if (enableQueryParams) {
      limitStore.setPriceFromQueryParams(getQueryParam(QUERY_PARAMS.LIMIT_PRICE));
    }
  }, [enableQueryParams, limitStore.setPriceFromQueryParams]);

  useSrcUsd();
  useDstUsd();
  useEffect(() => {
    updateStoreOveride(props.storeOverride);
  }, [updateStoreOveride, props.storeOverride]);
  useEffect(() => {
    setTokensFromDappCallback();
  }, [setTokensFromDappCallback]);

  return null;
};

const WrappedTwap = (props: TwapLibProps) => {
  useEffect(() => {
    Analytics.onTwapLoaded();
  }, []);

  return (
    <TwapErrorWrapper>
      <Listener {...props} />
      <Wizard />
      {props.children}
    </TwapErrorWrapper>
  );
};

const useChainId = (web3?: Web3, connectedChainId?: number) => {
  const [chainId, setChainId] = useState<number | undefined>(undefined);

  const getChainId = useCallback(async () => {
    const result = connectedChainId || (await web3?.eth.getChainId());
    setChainId(result);
  }, [connectedChainId, web3]);

  useEffect(() => {
    getChainId();
  }, [getChainId]);

  return chainId;
};

export const TwapAdapter = (props: TwapLibProps) => {
  const translations = useMemo(() => ({ ...defaultTranlations, ...props.translations }), [props.translations]);
  const tokenList = useParseTokens(props.dappTokens, props.parseToken);
  const web3 = useMemo(() => {
    return props.provider ? new Web3(props.provider) : undefined;
  }, [props.provider]);
  const chainId = useChainId(web3, props.connectedChainId);
  const isWrongChain = props.config.chainId !== chainId;

  const lib = useMemo(() => {
    if (!props.account || !props.provider || isWrongChain) {
      return undefined;
    }
    return new TWAPLib(props.config, props.account, props.provider);
  }, [props.config, props.account, props.provider, isWrongChain]);

  return (
    <QueryClientProvider client={queryClient}>
      <TwapContext.Provider value={{ ...props, translations, tokenList, uiPreferences: props.uiPreferences || {}, web3, lib, isWrongChain }}>
        <WrappedTwap {...props} />
      </TwapContext.Provider>
    </QueryClientProvider>
  );
};

export const useTwapContext = () => {
  return useContext(TwapContext);
};

export const useSrcUsd = () => {
  const { srcToken, updateState } = useTwapStore((store) => ({
    srcToken: store.srcToken,
    updateState: store.updateState,
  }));

  const onSuccess = useCallback((srcUsd: BN, srcUsdLoading: boolean) => {
    updateState({ srcUsd, srcUsdLoading });
  }, []);

  return usePriceUSD(srcToken?.address, onSuccess);
};

export const useDstUsd = () => {
  const { dstToken, updateState } = useTwapStore((store) => ({
    dstToken: store.dstToken,
    updateState: store.updateState,
  }));

  const onSuccess = useCallback((dstUsd: BN, dstUsdLoading: boolean) => {
    updateState({ dstUsd, dstUsdLoading });
  }, []);

  return usePriceUSD(dstToken?.address, onSuccess);
};
