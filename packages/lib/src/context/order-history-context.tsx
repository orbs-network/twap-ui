import { OrderHistoryProps } from "../types";

import { createContext, ReactNode, useContext } from "react";

const Context = createContext({} as OrderHistoryProps);

type Props = OrderHistoryProps & {
  children: ReactNode;
};

export const OrderHistoryProvider = (props: Props) => {
  const { children, ...rest } = props;
  return <Context.Provider value={rest}>{children}</Context.Provider>;
};

export const useOrderHistoryContext = () => {
  return useContext(Context);
};
