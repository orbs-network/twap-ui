import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Box, Fade, styled } from "@mui/material";
import { hooks, OrdersContainer, OrdersPortal, SelectedOrders, store, OrdersHeader } from "@orbs-network/twap-ui";
import { IoMdArrowDropdown } from "@react-icons/all-files/io/IoMdArrowDropdown";
import { StyledOrders, StyledOrdersMenuButton } from "./styles";
import { Styles } from "@orbs-network/twap-ui";
import { Components } from "@orbs-network/twap-ui";

export default function PancakeOrders() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { tab, setTab } = store.useOrdersStore();
  const open = Boolean(anchorEl);
  const tabs = hooks.useOrdersTabs();

  return (
    <OrdersPortal>
      <StyledOrders>
        <Header>
          <Tabs />
        </Header>
        <StyledBody>
          {/* <Components.Base.Odnp /> */}
          <SelectedOrders />
        </StyledBody>
      </StyledOrders>
    </OrdersPortal>
  );
}

const StyledBody = styled(Styles.StyledColumnFlex)({
  padding: 20,
  alignItems: "center",
  gap: 20,
});

const Header = styled(Styles.StyledRowFlex)({
  background: "#372f47",
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  height: 48,
});

const Tabs = () => {
  const { tab, setTab } = store.useOrdersStore();

  const tabs = hooks.useOrdersTabs();
  const selectedTab = React.useMemo(() => {
    return Object.keys(tabs)[tab as any];
  }, [tabs, tab]);

  const onSelect = (index: number) => {
    setTab(index);
  };

  return (
    <StyledTabs>
      {Object.keys(tabs).map((key, index) => {
        const amount = tabs[key as keyof typeof tabs];
        const label = ` ${key} (${amount})`;
        console.log(key, selectedTab);

        return (
          <StyledTab selected={key === selectedTab ? 1 : 0} key={key} onClick={() => onSelect(index)}>
            {label}
          </StyledTab>
        );
      })}
    </StyledTabs>
  );
};

const StyledTab = styled(Box)<{ selected: number }>(({ selected }) => ({
  cursor: "pointer",
  background: selected ? "#27262c" : "transparent",
  height: "100%",
  padding: " 0px 24px",
  display: "flex",
  alignItems: "center",
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  flex: 1,
  justifyContent: "center",
}));

const StyledTabs = styled(Box)({
  display: "flex",
  alignItems: "center",
  width: "100%",
  justifyContent: "space-between",
  height: "100%",
  flex: 1,
});

const StyledMenuButtonContainer = styled("div")({});
