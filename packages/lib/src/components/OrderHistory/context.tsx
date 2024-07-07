import _ from "lodash";
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { useTwapContext } from "../../context/context";
import { useOrdersHistory, useParseOrderUi } from "../../hooks";
import { ParsedOrder, Translations } from "../../types";
import { OrdersMenuTab } from "./types";
import { Status } from "@orbs-network/twap";

interface OrderHistoryContextType {
  order?: ReturnType<typeof useParseOrderUi>;
  tabs: OrdersMenuTab[];
  selectOrder: (o: ParsedOrder | undefined) => void;
  orders: ParsedOrder[];
  setTab: (tab?: Status) => void;
  closePreview: () => void;
  selectedTab?: OrdersMenuTab;
  isLoading: boolean;
  onOrderCanceled: () => void;
}

export const OrderHistoryContext = createContext({} as OrderHistoryContextType);

export const OrderHistoryContextProvider = ({ children }: { children: ReactNode }) => {
  const { data } = useOrdersHistory();
  const [tab, setTab] = useState<Status | undefined>(undefined);
  const [selectedOrder, setSelectedOrder] = useState<ParsedOrder | undefined>(undefined);
  const order = useParseOrderUi(selectedOrder);
  const waitingForOrdersUpdate = useTwapContext().state.waitingForOrdersUpdate;
  const isLoading = !data || waitingForOrdersUpdate;

  const onOrderCanceled = useCallback(() => {
    setSelectedOrder((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        ui: {
          ...prev.ui,
          status: Status.Canceled,
        },
      };
    });
  }, [setSelectedOrder]);

  const selectOrder = useCallback(
    (o: ParsedOrder | undefined) => {
      setSelectedOrder(o);
    },
    [setSelectedOrder]
  );

  const closePreview = useCallback(() => {
    setSelectedOrder(undefined);
  }, [setSelectedOrder]);

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
      return _.sortBy(Object.values(data).flat(), (it) => it.order.time).reverse();
    }
    return data[tab as keyof typeof data] || [];
  }, [data, tab]);
  const selectedTab = useMemo(() => _.find(tabs, (it) => it.key === tab), [tabs, tab]);

  return (
    <OrderHistoryContext.Provider value={{ tabs, selectOrder, order, orders, setTab, closePreview, selectedTab, isLoading, onOrderCanceled }}>
      {children}
    </OrderHistoryContext.Provider>
  );
};

export const useOrderHistoryContext = () => {
  return useContext(OrderHistoryContext);
};
