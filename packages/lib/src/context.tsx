import { createContext, useContext, useEffect } from "react";
import { OrderLibProps, TwapLibProps } from "./types";
import { useInitLib, useSetTokensList } from "./hooks";
import defaultTranlations from "./i18n/en.json";

const TwapContext = createContext<TwapLibProps>({} as TwapLibProps);
const OrdersContext = createContext<OrderLibProps>({} as OrderLibProps);

export const TwapAdapter = (props: TwapLibProps) => {
  const initLib = useInitLib();
  const translations = { ...defaultTranlations, ...props.translations };

  // init web3 every time the provider changes
  useEffect(() => {
    console.log("init");

    initLib(props.config, props.provider, props.account);
  }, [props.provider, props.config, props.account, props.connectedChainId]);

  return <TwapContext.Provider value={{ ...props, translations }}>{props.children}</TwapContext.Provider>;
};

export const OrdersAdapter = (props: OrderLibProps) => {
  const setTokensList = useSetTokensList();

  const translations = { ...defaultTranlations, ...props.translations };

  useEffect(() => {
    setTokensList(props.tokenList);
  }, [props.tokenList]);

  return <OrdersContext.Provider value={{ ...props, translations }}>{props.children}</OrdersContext.Provider>;
};

export const useTwapContext = () => {
  return useContext(TwapContext);
};

export const useOrdersContext = () => {
  return useContext(OrdersContext);
};
