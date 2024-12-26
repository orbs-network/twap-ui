import * as React from "react";
import { styled } from "@mui/material";
import { Components, hooks, OrdersPortal, OpenOrders, AllOrders } from "@orbs-network/twap-ui";
import { StyledCanceledOrdersController, StyledOrders, StyledOrdersHeader, StyledOrdersTab, StyledOrdersTabs } from "./styles";
import { Styles } from "@orbs-network/twap-ui";
import { Status } from "@orbs-network/twap";

type ContextType = {
  showAllOrders: boolean;
  setShowAllOrders: (showAllOrders: boolean) => void;
  hideCancelledOrders: boolean;
  setHideCancelledOrders: (hideCancelledOrders: boolean) => void;
};

const context = React.createContext({} as ContextType);

const Provider = ({ children }: { children: React.ReactNode }) => {
  const [showAllOrders, setShowAllOrders] = React.useState(false);
  const [hideCancelledOrders, setHideCancelledOrders] = React.useState(false);

  return <context.Provider value={{ showAllOrders, setShowAllOrders, hideCancelledOrders, setHideCancelledOrders }}>{children}</context.Provider>;
};
const useOrdersContext = () => React.useContext(context);

export default function PancakeOrders() {
  return (
    <Provider>
      <OrdersPortal>
        <StyledOrders>
          <StyledOrdersHeader>
            <Tabs />
            <CancelledOrdersController />
          </StyledOrdersHeader>
          <StyledBody>
            <Orders />
          </StyledBody>
        </StyledOrders>
      </OrdersPortal>
    </Provider>
  );
}

const Orders = () => {
  const { showAllOrders, hideCancelledOrders } = useOrdersContext();
  return showAllOrders ? <AllOrders hideStatus={hideCancelledOrders ? Status.Canceled : undefined} /> : <OpenOrders />;
};

const StyledBody = styled(Styles.StyledColumnFlex)({
  padding: "15px 20px 20px 20px",
  alignItems: "center",
  gap: 15,
});

const CancelledOrdersController = () => {
  const { hideCancelledOrders, setHideCancelledOrders } = useOrdersContext();
  return (
    <StyledCanceledOrdersController>
      <Styles.StyledText>Hide canceled orders</Styles.StyledText>
      <Components.Base.Switch onChange={setHideCancelledOrders} value={hideCancelledOrders} />
    </StyledCanceledOrdersController>
  );
};

const Tabs = () => {
  const { showAllOrders, setShowAllOrders } = useOrdersContext();
  const tabs = hooks.useOrdersTabs();

  return (
    <StyledOrdersTabs>
      <StyledOrdersTab selected={!showAllOrders ? 1 : 0} onClick={() => setShowAllOrders(false)}>
        Open Orders {`(${(tabs as any).Open || 0})`}
      </StyledOrdersTab>
      <StyledOrdersTab selected={showAllOrders ? 1 : 0} onClick={() => setShowAllOrders(true)}>
        Order History
      </StyledOrdersTab>
    </StyledOrdersTabs>
  );
};
