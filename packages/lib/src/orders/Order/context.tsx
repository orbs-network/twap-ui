import { TokenData } from "@orbs-network/twap";
import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { useGetToken } from "../../hooks";
import { Order } from "../../order";

interface OrderContextProps {
  order: Order;
  srcToken?: TokenData;
  dstToken?: TokenData;
  expanded?: boolean;
  onExpand: () => void;
  setExpand: (expand: boolean) => void;
  onCancelSuccess?: (value: number) => void;
}

const OrderContext = createContext({} as OrderContextProps);

export const ListOrderProvider = ({ children, order, onCancelSuccess }: { children: ReactNode; order: Order, onCancelSuccess?: (value: number) => void }) => {
  const [expanded, setExpand] = useState(false);
  const srcToken = useGetToken(order?.srcTokenAddress);
  const dstToken = useGetToken(order?.dstTokenAddress);

  const onExpand = useCallback(() => {
    setExpand((prev) => !prev);
  }, []);
  

  return <OrderContext.Provider value={{ expanded, order, srcToken, dstToken, onExpand, setExpand, onCancelSuccess }}>{children}</OrderContext.Provider>;
};

export const useListOrderContext = () => {
  return useContext(OrderContext);
};
