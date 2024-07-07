import * as React from "react";
import { styled } from "@mui/material";
import { hooks, OrdersPortal, SelectedOrders } from "@orbs-network/twap-ui";
import { StyledOrders, StyledOrdersHeader, StyledOrdersTab, StyledOrdersTabs } from "./styles";
import { Styles } from "@orbs-network/twap-ui";
import { useTwapContext } from "@orbs-network/twap-ui";

export default function PancakeOrders() {
  return (
    <OrdersPortal>
      <StyledOrders>
        <StyledOrdersHeader>
          <Tabs />
        </StyledOrdersHeader>
        <StyledBody>
          <SelectedOrders />
        </StyledBody>
      </StyledOrders>
    </OrdersPortal>
  );
}

const StyledBody = styled(Styles.StyledColumnFlex)({
  padding: "15px 20px 20px 20px",
  alignItems: "center",
  gap: 15,
});

const Tabs = () => {
  const tab = useTwapContext().state.selectedOrdersTab;
  const setTab = hooks.stateActions.useSelectOrdersTab();

  const tabs = hooks.useOrdersTabs();
  const selectedTab = React.useMemo(() => {
    return Object.keys(tabs)[tab as any];
  }, [tabs, tab]);

  const onSelect = (index: number) => {
    setTab(index);
  };

  return (
    <StyledOrdersTabs>
      {Object.keys(tabs).map((key, index) => {
        return (
          <StyledOrdersTab selected={key === selectedTab ? 1 : 0} key={key} onClick={() => onSelect(index)}>
            {key}
          </StyledOrdersTab>
        );
      })}
    </StyledOrdersTabs>
  );
};
