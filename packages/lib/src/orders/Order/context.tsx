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
}

const OrderContext = createContext({} as OrderContextProps);

export const ListOrderProvider = ({
  children,
  order,
  expanded,
  onExpand: _onExpand,
}: {
  children: ReactNode;
  order: Order;
  expanded?: boolean;
  onExpand: (value: number) => void;
}) => {
  const srcToken = useGetToken(order?.srcTokenAddress);
  const dstToken = useGetToken(order?.dstTokenAddress);

  const onExpand = useCallback(() => {
    _onExpand(order.id);
  }, [order.id, _onExpand]);

  return <OrderContext.Provider value={{ expanded, order, srcToken, dstToken, onExpand }}>{children}</OrderContext.Provider>;
};

export const useListOrderContext = () => {
  return useContext(OrderContext);
};
