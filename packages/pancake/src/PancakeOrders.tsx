import * as React from "react";
import { styled } from "@mui/material";
import { Components, hooks, OrdersPortal, AllOrders, Order, store, useTwapContext } from "@orbs-network/twap-ui";
import {
  StyledCanceledOrdersController,
  StyledOrders,
  StyledOrdersHeader,
  StyledOrdersHeaderBottom,
  StyledOrdersHeaderTop,
  StyledOrdersList,
  StyledOrdersTab,
  StyledOrdersTabs,
} from "./styles";
import { Styles, OrderLoader } from "@orbs-network/twap-ui";
import { Status } from "@orbs-network/twap";
import _ from "lodash";

type ContextType = {
  showOpenOrders: boolean;
  setShowOpenOrders: (showOpenOrders: boolean) => void;
  hideCancelledOrders: boolean;
  setHideCancelledOrders: (hideCancelledOrders: boolean) => void;
  orders?: Order[];
  ordersLoading?: boolean;
};

const context = React.createContext({} as ContextType);

const Provider = ({ children }: { children: React.ReactNode }) => {
  const [showOpenOrders, setShowOpenOrders] = React.useState(true);
  const [hideCancelledOrders, setHideCancelledOrders] = React.useState(false);
  const { data, isLoading: ordersLoading } = hooks.useOrdersHistoryQuery();

  const orders = React.useMemo(() => {
    if (showOpenOrders) {
      return data?.filter((order) => order.status === Status.Open);
    }
    let result = data?.filter((order) => order.status !== Status.Open) || [];
    if (hideCancelledOrders) {
      result = result.filter((order) => order.status !== Status.Canceled);
    }
    return result;
  }, [data, hideCancelledOrders, showOpenOrders]);

  return <context.Provider value={{ showOpenOrders, setShowOpenOrders, hideCancelledOrders, setHideCancelledOrders, orders, ordersLoading }}>{children}</context.Provider>;
};
const useOrdersContext = () => React.useContext(context);

export default function PancakeOrders() {
  return (
    <Provider>
      <OrdersPortal>
        <StyledOrders>
          <Header />
          <Orders />
        </StyledOrders>
      </OrdersPortal>
    </Provider>
  );
}

const Header = () => {
  return (
    <StyledOrdersHeader>
      <StyledOrdersHeaderTop>
        <Tabs />
        <CancelledOrdersController />
      </StyledOrdersHeaderTop>
      <HeaderBottom />
    </StyledOrdersHeader>
  );
};

const HeaderBottom = () => {
  const { orders, ordersLoading, showOpenOrders } = useOrdersContext();

  if (!ordersLoading && !orders?.length) {
    return (
      <StyledOrdersHeaderBottom>
        <Styles.StyledText>{showOpenOrders ? "No open orders" : "No history found"}</Styles.StyledText>
      </StyledOrdersHeaderBottom>
    );
  }

  return null;
};

const Orders = () => {
  const { orders, ordersLoading } = useOrdersContext();

  if (ordersLoading) {
    return <OrderLoader />;
  }

  if (!orders?.length) return null;

  return (
    <StyledOrdersList>
      <AllOrders orders={orders} />
    </StyledOrdersList>
  );
};

const CancelledOrdersController = () => {
  const { hideCancelledOrders, setHideCancelledOrders, showOpenOrders, orders } = useOrdersContext();

  const hide = React.useMemo(() => {
    if (showOpenOrders) {
      return true;
    }
    if (!orders?.length && !hideCancelledOrders) {
      return true;
    }
  }, [orders, hideCancelledOrders, showOpenOrders]);

  if (hide) return null;
  return (
    <StyledCanceledOrdersController>
      <Styles.StyledText>Hide canceled orders</Styles.StyledText>
      <Components.Base.Switch onChange={setHideCancelledOrders} value={hideCancelledOrders} />
    </StyledCanceledOrdersController>
  );
};

const Tabs = () => {
  const { showOpenOrders, setShowOpenOrders } = useOrdersContext();
  const openOrders = hooks.useGroupedOrders().Open?.length || 0;

  return (
    <StyledOrdersTabs>
      <StyledOrdersTab selected={showOpenOrders ? 1 : 0} onClick={() => setShowOpenOrders(true)}>
        Open Orders {`(${openOrders})`}
      </StyledOrdersTab>
      <StyledOrdersTab selected={!showOpenOrders ? 1 : 0} onClick={() => setShowOpenOrders(false)}>
        Order History
      </StyledOrdersTab>
    </StyledOrdersTabs>
  );
};
