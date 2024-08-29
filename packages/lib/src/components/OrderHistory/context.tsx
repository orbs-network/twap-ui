import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTwapContext } from "../../context/context";
import { Translations } from "../../types";
import { OrdersMenuTab } from "./types";
import { mapCollection, size } from "../../utils";
import { Order, Status, groupOrdersByStatus } from "@orbs-network/twap-sdk";
import { useOrdersHistory } from "../../hooks";
import { eqIgnoreCase } from "@defi.org/web3-candies";

interface OrderHistoryContextType {
  tabs: OrdersMenuTab[];
  selectOrder: (id: number | undefined) => void;
  orders: Order[];
  setTab: (tab: Status) => void;
  closePreview: () => void;
  selectedTab?: OrdersMenuTab;
  isLoading: boolean;
  selectedOrderId?: number;
}

const useAddTokensToOrderCallback = () => {
  const { tokens } = useTwapContext();
  return useCallback(
    (order: Order) => {
      const srcToken = tokens.find((t) => eqIgnoreCase(order.srcTokenAddress, t.address));
      const dstToken = tokens.find((t) => eqIgnoreCase(order.dstTokenAddress, t.address));
      return {
        ...order,
        srcToken,
        dstToken,
      };
    },
    [tokens],
  );
};

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
  const { tokens } = useTwapContext();
  const addTokensToOrder = useAddTokensToOrderCallback();

  return useMemo(() => {
    if (!tokens || !data) return;
    return data.map(addTokensToOrder).filter((order) => order.srcToken && order.dstToken);
  }, [data, tokens, addTokensToOrder]);
};

const useSelectedOrders = (status: Status) => {
  const orders = useOrders();
  if (!orders) {
    return [];
  }
  const grouped = groupOrdersByStatus(orders);
  return grouped?.[status] || [];
};

export const OrderHistoryContextProvider = ({ children, isOpen }: { children: ReactNode; isOpen: boolean }) => {
  const [tab, setTab] = useState<Status>(Status.All);
  const [selectedOrderId, setSelectedOrderId] = useState<number | undefined>(undefined);
  const orders = useSelectedOrders(tab);
  const isLoading = !orders;

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setSelectedOrderId(undefined);
        setTab(Status.All);
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

  const translations = useTwapContext().translations;
  const tabs = useMemo(() => {
    return mapCollection(Status, (it) => {
      return {
        name: translations[it as keyof Translations],
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

  return (
    <OrderHistoryContext.Provider value={{ selectedOrderId, tabs, selectOrder, orders, setTab, closePreview, selectedTab, isLoading }}>{children}</OrderHistoryContext.Provider>
  );
};

export const useOrderHistoryContext = () => {
  return useContext(OrderHistoryContext);
};
