import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { groupOrdersByStatus, Order, OrderStatus } from "@orbs-network/twap-sdk";
import { useOrdersHistory } from "../../../hooks";
import { mapCollection, size } from "../../../utils";
import { useWidgetContext } from "../../widget-context";

export type OrdersMenuTab = {
  name: string;
  amount: number;
  key: any;
};

interface OrderHistoryContextType {
  tabs: OrdersMenuTab[];
  selectOrder: (id: number | undefined) => void;
  orders: Order[];
  setTab: (tab: OrderStatus) => void;
  closePreview: () => void;
  selectedTab?: OrdersMenuTab;
  isLoading: boolean;
  selectedOrderId?: number;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const useSelectedOrder = () => {
  const orders = useOrders();

  const { selectedOrderId } = useOrderHistoryContext();

  return useMemo(() => {
    if (!orders || !selectedOrderId) return;
    return orders.find((it) => it.id === selectedOrderId);
  }, [orders, selectedOrderId]);
};
export const OrderHistoryContext = createContext({} as OrderHistoryContextType);

const useOrders = () => {
  const { data } = useOrdersHistory();

  return useMemo(() => {
    return data;
  }, [data]);
};

const useSelectedOrders = (status: OrderStatus) => {
  const orders = useOrders();
  if (!orders) {
    return [];
  }
  const grouped = groupOrdersByStatus(orders);
  return grouped?.[status] || [];
};

export const OrderHistoryContextProvider = ({ children }: { children: ReactNode }) => {
  const [tab, setTab] = useState<OrderStatus>(OrderStatus.All);
  const {isLoading} = useOrdersHistory();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | undefined>(undefined);
  const orders = useSelectedOrders(tab);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setSelectedOrderId(undefined);
        setTab(OrderStatus.All);
      }, 300);
    }
  }, [isOpen]);

  const selectOrder = useCallback(
    (id: number | undefined) => {
      setSelectedOrderId(id);
    },
    [setSelectedOrderId],
  );

  const closePreview = useCallback(() => {
    setSelectedOrderId(undefined);
  }, [setSelectedOrderId]);

  const translations = useWidgetContext().translations;
  const tabs = useMemo(() => {
    return mapCollection(OrderStatus, (it) => {
      return {
        name: it,
        amount: size(orders?.[it as any]),
        key: it,
      };
    });
  }, [orders, translations]);

  const selectedTab = useMemo(
    () =>
      tabs.find((it) => {
        return it.key === tab;
      }),
    [tabs, tab],
  );

  const onClose = useCallback(() => setIsOpen(false), []);
  const onOpen = useCallback(() => setIsOpen(true), []);

  return (
    <OrderHistoryContext.Provider value={{ selectedOrderId, tabs, selectOrder, orders, setTab, closePreview, selectedTab, isLoading, isOpen, onClose, onOpen }}>
      {children}
    </OrderHistoryContext.Provider>
  );
};

export const useOrderHistoryContext = () => {
  return useContext(OrderHistoryContext);
};
