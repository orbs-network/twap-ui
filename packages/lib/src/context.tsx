import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { TwapContextUIPreferences, TwapLibProps } from "./types";
import { useInitLib, useLimitPriceV2, useParseTokens, useSetTokensFromDapp, useUpdateStoreOveride } from "./hooks";
import defaultTranlations from "./i18n/en.json";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { analytics } from "./analytics";
import { TokenData } from "@orbs-network/twap";
import { TwapErrorWrapper } from "./ErrorHandling";
import { Wizard } from "./components";
import { useLimitPriceStore } from "./store";

analytics.onModuleLoad();

export interface TWAPContextProps extends TwapLibProps {
  tokenList: TokenData[];
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
  const setTokensFromDappCallback = useSetTokensFromDapp();
  const initLib = useInitLib();
  const updateStoreOveride = useUpdateStoreOveride();
  const { onDefaultInverted, limitPrice } = useLimitPriceV2();
  const invertedOnce = useRef(false);
  useEffect(() => {
    if (props.uiPreferences?.limitPriceInvertedByDefault && !invertedOnce.current && limitPrice) {
      onDefaultInverted();
      invertedOnce.current = true;
    }
  }, [props.uiPreferences?.limitPriceInvertedByDefault, onDefaultInverted, limitPrice]);

  useEffect(() => {
    updateStoreOveride(props.storeOverride);
  }, [updateStoreOveride, props.storeOverride]);
  useEffect(() => {
    setTokensFromDappCallback();
  }, [setTokensFromDappCallback]);

  useEffect(() => {
    // init web3 every time the provider changes

    initLib({ config: props.config, provider: props.provider, account: props.account, connectedChainId: props.connectedChainId });
  }, [props.provider, props.config, props.account, props.connectedChainId]);

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

export const TwapAdapter = (props: TwapLibProps) => {
  const translations = useMemo(() => ({ ...defaultTranlations, ...props.translations }), [props.translations]);
  const tokenList = useParseTokens(props.dappTokens, props.parseToken);

  return (
    <QueryClientProvider client={queryClient}>
      <TwapContext.Provider value={{ ...props, translations, tokenList, uiPreferences: props.uiPreferences || {} }}>
        <WrappedTwap {...props} />
      </TwapContext.Provider>
    </QueryClientProvider>
  );
};

export const useTwapContext = () => {
  return useContext(TwapContext);
};
