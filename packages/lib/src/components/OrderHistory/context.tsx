import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTwapContext } from "../../context/context";
import { useOrdersHistory } from "../../hooks";
import { HistoryOrder, OrdersData, OrderUI, Status, Translations } from "../../types";
import { OrdersMenuTab } from "./types";
import { mapCollection, size, sortBy } from "../../utils";

interface OrderHistoryContextType {
  tabs: OrdersMenuTab[];
  selectOrder: (id: number | undefined) => void;
  orders: HistoryOrder[];
  setTab: (tab?: Status) => void;
  closePreview: () => void;
  selectedTab?: OrdersMenuTab;
  isLoading: boolean;
  selectedOrderId?: number;
}
export const OrderHistoryContext = createContext({} as OrderHistoryContextType);

export const OrderHistoryContextProvider = ({ children, isOpen }: { children: ReactNode; isOpen: boolean }) => {
  const { data } = useOrdersHistory();
  const [tab, setTab] = useState<Status | undefined>(undefined);
  const [selectedOrderId, setSelectedOrderId] = useState<number | undefined>(undefined);
  const isLoading = !data;

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setSelectedOrderId(undefined);
        setTab(undefined);
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

  const { translations } = useTwapContext();
  const tabs = useMemo(() => {
    const res = mapCollection(Status, (it) => {
      return {
        name: translations[it as keyof Translations],
        amount: size(data?.[it as keyof typeof data]),
        key: it,
      };
    });

    res.unshift({
      name: "All",
      amount: !data ? 0 : size(Object.values(data).flat()),
      key: undefined as any,
    });
    return res;
  }, [data, translations]);

  const orders = useMemo(() => {
    if (!data) return [];
    if (!tab) {
      return sortBy(Object.values(data).flat(), (it) => it.createdAt).reverse();
    }
    return data[tab as keyof typeof data] || [];
  }, [data, tab]);
  const selectedTab = useMemo(() => tabs.find((it) => it.key === tab), [tabs, tab]);

  return (
    <OrderHistoryContext.Provider value={{ selectedOrderId, tabs, selectOrder, orders, setTab, closePreview, selectedTab, isLoading }}>{children}</OrderHistoryContext.Provider>
  );
};

export const useOrderHistoryContext = () => {
  return useContext(OrderHistoryContext);
};
