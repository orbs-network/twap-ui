import { createContext, useContext, useEffect } from "react";
import { OrderLibProps, TwapLibProps } from "./types";
import { useDstBalance, useDstUsd, useInitLib, useLimitPrice, useSetTokensFromDapp, useSrcBalance, useSrcUsd } from "./hooks";
import defaultTranlations from "./i18n/en.json";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { analytics } from "./analytics";
import { useTwapStore } from "./store";
const TwapContext = createContext<TwapLibProps>({} as TwapLibProps);
export const OrdersContext = createContext<OrderLibProps>({} as OrderLibProps);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const useLimitOrderPriceUpdate = () => {
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  const setLimitOrderPriceUi = useTwapStore((store) => store.setLimitOrderPriceUi);
  const srcUsd = useTwapStore((store) => store.srcUsd);
  const dstUsd = useTwapStore((store) => store.dstUsd);

  const { custom } = useLimitPrice();

  useEffect(() => {
    if (isLimitOrder && !custom && !srcUsd.isZero() && !dstUsd.isZero()) {
      setLimitOrderPriceUi();
    }
  }, [custom, srcUsd, dstUsd, setLimitOrderPriceUi, isLimitOrder]);
};

const WrappedTwap = (props: TwapLibProps) => {
  const setTokensFromDappCallback = useSetTokensFromDapp();
  useLimitOrderPriceUpdate();

  useEffect(() => {
    setTokensFromDappCallback();
  }, [setTokensFromDappCallback]);

  const initLib = useInitLib();
  useSrcUsd();
  useDstUsd();
  useSrcBalance();
  useDstBalance();
  useEffect(() => {
    analytics.onTwapPageView();
  }, []);

  // init web3 every time the provider changes
  useEffect(() => {
    initLib({ config: props.config, provider: props.provider, account: props.account, connectedChainId: props.connectedChainId, storeOverride: props.storeOverride || {} });
  }, [props.provider, props.config, props.account, props.connectedChainId]);

  return <>{props.children}</>;
};

export const TwapAdapter = (props: TwapLibProps) => {
  const translations = { ...defaultTranlations, ...props.translations };

  return (
    <QueryClientProvider client={queryClient}>
      <TwapContext.Provider value={{ ...props, translations }}>
        <WrappedTwap {...props} />
      </TwapContext.Provider>
    </QueryClientProvider>
  );
};

const OrdersAdapterQueryClient = (props: OrderLibProps) => {
  const translations = { ...defaultTranlations, ...props.translations };

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
