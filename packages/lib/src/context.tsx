import { createContext, useContext, useEffect, useMemo } from "react";
import { TwapContextUIPreferences, TwapLibProps } from "./types";
import { useInitLib, useLimitPrice, useParseTokens, useSetTokensFromDapp, useUpdateStoreOveride } from "./hooks";
import defaultTranlations from "./i18n/en.json";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { analytics } from "./analytics";
import { TokenData } from "@orbs-network/twap";
import { useTwapStore } from "./store";
import { TwapErrorWrapper } from "./ErrorHandling";
import { Wizard } from "./components";

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

const useLimitPriceUpdater = () => {
  const setLimitOrderPriceUi = useTwapStore((store) => store.setLimitOrderPriceUi);
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  const custom = useLimitPrice().custom;

  const srcUsd = useTwapStore((store) => store.srcUsd);
  const dstUsd = useTwapStore((store) => store.dstUsd);

  useEffect(() => {
    if (isLimitOrder && !custom && !srcUsd.isZero() && !dstUsd.isZero()) {
      setLimitOrderPriceUi();
    }
  }, [custom, srcUsd, dstUsd, setLimitOrderPriceUi, isLimitOrder]);
};

const Listener = (props: TwapLibProps) => {
  const { srcToken, dstToken, srcAmount, updateState } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
    srcAmount: s.getSrcAmount().toString(),

    updateState: s.updateState,
  }));

  const setTokensFromDappCallback = useSetTokensFromDapp();
  const initLib = useInitLib();
  const updateStoreOveride = useUpdateStoreOveride();
  const result = props.useTrade?.(srcToken, dstToken, srcAmount === "0" ? undefined : srcAmount);

  useEffect(() => {
    updateState({ dstAmountLoading: result?.isLoading, dstAmount: result?.outAmount });
  }, [result?.isLoading, result?.outAmount, updateState]);

  useEffect(() => {
    updateStoreOveride(props.storeOverride);
  }, [updateStoreOveride, props.storeOverride]);

  useLimitPriceUpdater();
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
