import { createContext, useContext } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Config, Token } from "../types";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

interface Shared {
  tokens?: Token[];
  config?: Config;
  account?: string;
}
interface Props extends Shared {
  children: React.ReactNode;
}

interface ContextType extends Shared {}

export const Context = createContext({} as ContextType);

export const OrdersProvider = ({ children, tokens, config, account }: Props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Context.Provider value={{ tokens, config, account }}>{children}</Context.Provider>
    </QueryClientProvider>
  );
};

export const useOrdersContext = () => {
  return useContext(Context);
};
