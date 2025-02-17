import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Order, OrderStatus } from "@orbs-network/twap-sdk";
import { useWidgetContext } from "../../widget-context";
import { useOrderHistoryManager } from "../../../hooks/useOrderHistoryManager";

export type OrdersMenuTab = {
  name: string;
  amount: number;
  key: any;
};

interface OrderHistoryContextType {
  selectOrder: (id: number | undefined) => void;
  selectedOrders: Order[];
  closePreview: () => void;
  isLoading: boolean;
  selectedOrderId?: number;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  statuses: OrdersMenuTab[];
  setStatus: (status: OrderStatus) => void;
  selectedStatus?: OrdersMenuTab;
}

export const useSelectedOrder = () => {
  const orders = useOrderHistoryManager().orders;

  const { selectedOrderId } = useOrderHistoryContext();

  return useMemo(() => {
    if (!orders || !selectedOrderId) return;
    return orders.find((it) => it.id === selectedOrderId);
  }, [orders, selectedOrderId]);
};
export const OrderHistoryContext = createContext({} as OrderHistoryContextType);

export const OrderHistoryContextProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<OrderStatus>(OrderStatus.All);
  const { ordersLoading, groupedOrdersByStatus, orders } = useOrderHistoryManager();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | undefined>(undefined);
  const selectedOrders = groupedOrdersByStatus[status] || [];

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setSelectedOrderId(undefined);
        setStatus(OrderStatus.All);
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
  const statuses = useMemo(() => {
    return Object.keys(OrderStatus).map((it) => {
      return {
        name: it,
        amount: orders?.filter((order) => order.status === it).length || 0,
        key: it,
      };
    });
  }, [orders, translations, status]);

  const selectedStatus = useMemo(
    () =>
      statuses.find((it) => {
        return it.key === status;
      }),
    [statuses, status],
  );

  const onClose = useCallback(() => setIsOpen(false), []);
  const onOpen = useCallback(() => setIsOpen(true), []);

  return (
    <OrderHistoryContext.Provider
      value={{ selectedOrderId, statuses, selectOrder, selectedOrders, setStatus, closePreview, selectedStatus, isLoading: ordersLoading, isOpen, onClose, onOpen }}
    >
      {children}
    </OrderHistoryContext.Provider>
  );
};

export const useOrderHistoryContext = () => {
  return useContext(OrderHistoryContext);
};
