import _ from "lodash";
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { useTwapContext } from "../../context/context";
import { useOrdersHistory } from "../../hooks";
import { HistoryOrder, OrderUI, Translations } from "../../types";
import { OrdersMenuTab } from "./types";
import { Status } from "@orbs-network/twap";
import { useParseOrderUi } from "../../hooks/orders";

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

export const OrderHistoryContextProvider = ({ children }: { children: ReactNode }) => {
  const { data } = useOrdersHistory();
  const [tab, setTab] = useState<Status | undefined>(undefined);
  const [selectedOrderId, setSelectedOrderId] = useState<number | undefined>(undefined);
  const waitingForOrdersUpdate = !!useTwapContext().state.waitForOrderId;
  const isLoading = !data || waitingForOrdersUpdate;

  const selectOrder = useCallback(
    (id: number | undefined) => {
      setSelectedOrderId(id);
    },
    [setSelectedOrderId]
  );

  const closePreview = useCallback(() => {
    setSelectedOrderId(undefined);
  }, [setSelectedOrderId]);

  const { translations } = useTwapContext();
  const tabs = useMemo(() => {
    const res = _.map(Status, (it) => {
      return {
        name: translations[it as keyof Translations],
        amount: _.size(data?.[it as keyof typeof data]),
        key: it,
      };
    });

    res.unshift({
      name: "All",
      amount: _.size(_.flatMap(data)),
      key: undefined as any,
    });
    return res;
  }, [data, translations]);

  const orders = useMemo(() => {
    if (!data) return [];
    if (!tab) {
      return _.sortBy(Object.values(data).flat(), (it) => it.createdAt).reverse();
    }
    return data[tab as keyof typeof data] || [];
  }, [data, tab]);
  const selectedTab = useMemo(() => _.find(tabs, (it) => it.key === tab), [tabs, tab]);

  return (
    <OrderHistoryContext.Provider value={{ selectedOrderId, tabs, selectOrder, orders, setTab, closePreview, selectedTab, isLoading }}>{children}</OrderHistoryContext.Provider>
  );
};

export const useOrderHistoryContext = () => {
  return useContext(OrderHistoryContext);
};
