import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useCancelOrder } from "../../../hooks/send-transactions-hooks";
import { SwapStatus } from "@orbs-network/swap-ui";
import { OrderStatus, TwapOrder } from "../../../types";
import { useOrders } from "../../../hooks/order-hooks";

export type OrdersMenuTab = {
  name: string;
  amount: number;
  key: any;
};

interface OrderHistoryContextType {
  selectOrder: (id: number | undefined) => void;
  selectedOrders: TwapOrder[];
  closePreview: () => void;
  isLoading: boolean;
  selectedOrderId?: number;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  setStatus: (status?: OrderStatus) => void;
  status?: OrderStatus;
  cancelOrder: (order: TwapOrder) => Promise<string>;
  cancelOrderTxHash: string | undefined;
  cancelOrderStatus?: SwapStatus;
}

export const useSelectedOrder = () => {
  const { orders } = useOrders();

  const { selectedOrderId } = useOrderHistoryContext();

  return useMemo(() => {
    if (!orders || selectedOrderId === undefined) return;
    return orders.all.find((it) => it.id === selectedOrderId);
  }, [orders, selectedOrderId]);
};
export const OrderHistoryContext = createContext({} as OrderHistoryContextType);

export const OrderHistoryContextProvider = ({ children }: { children: ReactNode }) => {
  const { orders, isLoading } = useOrders();

  const [status, setStatus] = useState<OrderStatus | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | undefined>(undefined);
  const selectedOrders = !orders ? [] : !status ? orders.all : orders[status.toUpperCase() as keyof typeof orders];

  const { mutateAsync: cancelOrder, swapStatus: cancelOrderStatus, txHash: cancelOrderTxHash, resetSwapStatus: resetCancelOrderStatus } = useCancelOrder();

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setSelectedOrderId(undefined);
        setStatus(undefined);
      }, 300);
    }
  }, [isOpen]);

  const closePreview = useCallback(() => {
    setSelectedOrderId(undefined);
  }, [setSelectedOrderId]);

  const onClose = useCallback(() => {
    if (cancelOrderStatus) {
      resetCancelOrderStatus();
    } else {
      setIsOpen(false);
    }
  }, [cancelOrderStatus, resetCancelOrderStatus]);
  const onOpen = useCallback(() => setIsOpen(true), []);

  return (
    <OrderHistoryContext.Provider
      value={{
        selectedOrderId,
        cancelOrder,
        cancelOrderTxHash,
        cancelOrderStatus,
        selectOrder: setSelectedOrderId,
        selectedOrders: selectedOrders || [],
        setStatus,
        closePreview,
        status,
        isLoading,
        isOpen,
        onClose,
        onOpen,
      }}
    >
      {children}
    </OrderHistoryContext.Provider>
  );
};

export const useOrderHistoryContext = () => {
  return useContext(OrderHistoryContext);
};
