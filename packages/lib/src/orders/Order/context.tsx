import { TokenData } from "@orbs-network/twap";
import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { useGetToken } from "../../hooks";
import { Order } from "../../order";

interface OrderContextProps {
  order: Order;
  srcToken?: TokenData;
  dstToken?: TokenData;
  expanded?: boolean;
  onExpand?: () => void;
}

const OrderContext = createContext({} as OrderContextProps);

export const ListOrderProvider = ({ children, order }: { children: ReactNode; order: Order }) => {
  const [expanded, setExpand] = useState(false);
  const srcToken = useGetToken(order?.srcTokenAddress);
  const dstToken = useGetToken(order?.dstTokenAddress);

  const onExpand = useCallback(() => {
    setExpand((prev) => !prev);
  }, []);

  return <OrderContext.Provider value={{ expanded, order, srcToken, dstToken, onExpand }}>{children}</OrderContext.Provider>;
};

export const useListOrderContext = () => {
  return useContext(OrderContext);
};
