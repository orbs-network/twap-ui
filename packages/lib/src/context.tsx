import { createContext, useContext, useEffect } from "react";
import { OrderLibProps, TwapLibProps } from "./types";
import { useDstBalance, useDstUsd, useInitLib, useSrcBalance, useSrcUsd } from "./hooks";
import defaultTranlations from "./i18n/en.json";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const TwapContext = createContext<TwapLibProps>({} as TwapLibProps);
const OrdersContext = createContext<OrderLibProps>({} as OrderLibProps);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const TwapAdapterWithQueryClient = (props: TwapLibProps) => {
  const initLib = useInitLib();
  const translations = { ...defaultTranlations, ...props.translations };
  useSrcUsd();
  useDstUsd();
  useSrcBalance();
  useDstBalance();

  // init web3 every time the provider changes
  useEffect(() => {
    initLib({ config: props.config, provider: props.provider, account: props.account, connectedChainId: props.connectedChainId });
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
