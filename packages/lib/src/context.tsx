import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { TwapContextUIPreferences, TwapLibProps } from "./types";
import { useSetTokensFromDapp, useUpdateStoreOveride } from "./hooks";
import defaultTranlations from "./i18n/en.json";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { analytics } from "./analytics";
import { TokenData, TWAPLib } from "@orbs-network/twap";
import { TwapErrorWrapper } from "./ErrorHandling";
import { Wizard } from "./components";
import Web3 from "web3";
import { useTwapStore } from "./store";
import { query } from "./query";

analytics.onModuleLoad();

export interface TWAPContextProps extends TwapLibProps {
  uiPreferences: TwapContextUIPreferences;
  lib?: TWAPLib;
  isWrongChain: boolean;
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
  const { srcToken, dstToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));
  query.useFeeOnTransfer(srcToken?.address);
  query.useFeeOnTransfer(dstToken?.address);

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
    analytics.onTwapPageView();
  }, []);

  return (
    <TwapErrorWrapper>
      <Listener {...props} />
      <Wizard />
      {props.children}
    </TwapErrorWrapper>
  );
};

const useIsWrongChain = (props: TwapLibProps) => {
  const [isWrongChain, setIsWrongChain] = useState(false);
  const validateChain = useCallback(async () => {
    if (!props.provider) {
      setIsWrongChain(false);
      return;
    }
    const chain = props.connectedChainId || (await new Web3(props.provider).eth.getChainId());
    if (!chain) {
      setIsWrongChain(false);
      return;
    }

    setIsWrongChain(props.config.chainId !== chain);
  }, [props.connectedChainId, props.provider, props.config.chainId]);

  useEffect(() => {
    validateChain();
  }, [validateChain]);

  return isWrongChain;
};

export const TwapAdapter = (props: TwapLibProps) => {
  const translations = useMemo(() => ({ ...defaultTranlations, ...props.translations }), [props.translations]);

  const isWrongChain = useIsWrongChain(props);

  const lib = useMemo(() => {
    if (isWrongChain || !props.account || !props.provider || !props.config) return;

    return new TWAPLib(props.config, props.account!, props.provider);
  }, [isWrongChain, props.config, props.account, props.provider]);

  return (
    <QueryClientProvider client={queryClient}>
      <TwapContext.Provider value={{ ...props, translations, uiPreferences: props.uiPreferences || {}, lib, isWrongChain }}>
        <WrappedTwap {...props} />
      </TwapContext.Provider>
    </QueryClientProvider>
  );
};

export const useTwapContext = () => {
  return useContext(TwapContext);
};
