import * as React from "react";
import { useMediaQuery } from "@mui/material";
import { hooks, OrdersPortal, SelectedOrders, store } from "@orbs-network/twap-ui";
import { StyledOrders, StyledOrdersHeader, StyledOrdersTab, StyledOrdersTabs, StyledBody } from "./styles";

const useMobile = () => {
  return useMediaQuery("(max-width:700px)");
};

export default function TradingPostOrders() {
  return (
    <OrdersPortal>
      <StyledOrders>
        <OrdersHeaderLayout />
        <StyledBody>
          <SelectedOrders dex="tradingpost"/>
        </StyledBody>
      </StyledOrders>
    </OrdersPortal>
  );
}

const OrdersHeaderLayout = () => {
  const mobile = useMobile();

  const { tab, setTab } = store.useOrdersStore();

  const tabs = hooks.useOrdersTabs();
  const selectedTab = React.useMemo(() => {
    return Object.keys(tabs)[tab as any];
  }, [tabs, tab]);

  const onSelect = (index: number) => {
    setTab(index);
  };

  return (
    <>
      <StyledOrdersHeader>
        <StyledOrdersTabs>
          {Object.keys(tabs)
            .map((key, index) => {
              return (
                <StyledOrdersTab selected={key === selectedTab ? 1 : 0} key={key} onClick={() => onSelect(index)}>
                  {key}
                </StyledOrdersTab>
              );
            })}
        </StyledOrdersTabs>
      </StyledOrdersHeader>
    </>
  );
};
