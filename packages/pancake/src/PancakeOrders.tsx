import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Fade, styled } from "@mui/material";
import { hooks, OrdersContainer, OrdersPortal, SelectedOrders, store, OrdersHeader } from "@orbs-network/twap-ui";
import { IoMdArrowDropdown } from "@react-icons/all-files/io/IoMdArrowDropdown";
import { StyledOrders, StyledOrdersMenuButton } from "./styles";

export default function PancakeOrders() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { tab, setTab } = store.useOrdersStore();
  const open = Boolean(anchorEl);
  const tabs = hooks.useOrdersTabs();
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const onSelect = (index: number) => {
    handleClose();
    setTab(index);
  };

  const selectedTab = React.useMemo(() => {
    const key = Object.keys(tabs)[tab as keyof typeof tabs];
    return ` ${key} (${tabs[key as keyof typeof tabs]})`;
  }, [tabs, tab]);

  return (
    <OrdersPortal>
      <StyledOrders>
        <OrdersHeader />
        <StyledMenuButtonContainer>
          <StyledOrdersMenuButton onClick={handleClick}>
            {selectedTab}
            <IoMdArrowDropdown />
          </StyledOrdersMenuButton>
        </StyledMenuButtonContainer>

        <Menu className="twap-orders-menu" anchorEl={anchorEl} open={open} onClose={handleClose} TransitionComponent={Fade}>
          {Object.keys(tabs).map((key, index) => {
            if (index === tab) return null;
            const amount = tabs[key as keyof typeof tabs];
            const label = ` ${key} (${amount})`;
            return (
              <MenuItem key={key} onClick={() => onSelect(index)}>
                {label}
              </MenuItem>
            );
          })}
        </Menu>
        <SelectedOrders />
      </StyledOrders>
    </OrdersPortal>
  );
}

const StyledMenuButtonContainer = styled("div")({});
