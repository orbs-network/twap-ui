import { createContext, useContext, useEffect } from "react";
import { OrderLibProps, TwapLibProps } from "./types";
import { useDstBalance, useDstUsd, useInitLib, useSrcBalance, useSrcUsd } from "./hooks";
import defaultTranlations from "./i18n/en.json";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { analytics } from "./analytics";
import _ from "lodash";
import { useTwapStore } from "./store";
const TwapContext = createContext<TwapLibProps>({} as TwapLibProps);
const OrdersContext = createContext<OrderLibProps>({} as OrderLibProps);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

analytics.onModuleLoad();

const TwapAdapterWithQueryClient = (props: TwapLibProps) => {
  const initLib = useInitLib();
  const translations = { ...defaultTranlations, ...props.translations };
  useSrcUsd();
  useDstUsd();
  useSrcBalance();
  useDstBalance();
  const lib = useTwapStore((store) => store.lib);
  const setTokensList = useTwapStore((store) => store.setTokensList);
  const tokensListLength = _.size(props.tokensList);

  useEffect(() => {
    analytics.onTwapPageView();
  }, []);

  useEffect(() => {
    if (!lib || !props.tokensList || !tokensListLength) return;
    setTokensList(props.tokensList);
  }, [tokensListLength, lib]);

  // init web3 every time the provider changes
  useEffect(() => {
    initLib({ config: props.config, provider: props.provider, account: props.account, connectedChainId: props.connectedChainId, storeOverride: props.storeOverride || {} });
  }, [props.provider, props.config, props.account, props.connectedChainId]);

  return <TwapContext.Provider value={{ ...props, translations }}>{props.children}</TwapContext.Provider>;
};

export const TwapAdapter = (props: TwapLibProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <TwapAdapterWithQueryClient {...props} />
    </QueryClientProvider>
  );
};

const OrdersAdapterQueryClient = (props: OrderLibProps) => {
  const translations = { ...defaultTranlations, ...props.translations };
  const lib = useTwapStore((store) => store.lib);
  const setTokensList = useTwapStore((store) => store.setTokensList);
  const tokensListLength = _.size(props.tokensList);

  useEffect(() => {
    if (!lib || !props.tokensList || !tokensListLength) return;
    setTokensList(props.tokensList);
  }, [tokensListLength, lib]);

  return <OrdersContext.Provider value={{ ...props, translations }}>{props.children}</OrdersContext.Provider>;
};

export const OrdersAdapter = (props: OrderLibProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <OrdersAdapterQueryClient {...props} />
    </QueryClientProvider>
  );
};

export const useTwapContext = () => {
  return useContext(TwapContext);
};

export const useOrdersContext = () => {
  return useContext(OrdersContext);
};
