import { Menu, styled, useMediaQuery } from "@mui/material";
import { Status } from "@orbs-network/twap";
import _ from "lodash";
import * as React from "react";
import MenuItem from "@mui/material/MenuItem";
import { ParsedOrder, Translations, useTwapContext } from "..";
import { useOrdersTabs } from "../hooks";
import { useOrdersStore } from "../store";
import { StyledOrdersLists, StyledOrdersTab, StyledOrdersTabs, StyledRowFlex } from "../styles";
import OrdersList from "../orders/OrdersList";
import { Button } from "./base";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { query } from "../query";

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export const OrdersSelectTabs = ({ className = "" }: { className?: string }) => {
  const {
    uiPreferences: { getOrdersTabsLabel },
  } = useTwapContext();
  const { tab, setTab } = useOrdersStore();
  const isMobile = useMediaQuery("(max-width:600px)");
  const tabs = useOrdersTabs();
  const getName = useGetOrderNameCallback();
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  if (isMobile) {
    return <MobileMenu />;
  }

  return (
    <StyledOrdersTabs className={`twap-orders-header-tabs ${className}`} value={tab} onChange={handleChange}>
      {_.keys(tabs).map((key, index) => {
        const label = getName(key);
        return <StyledOrdersTab className="twap-orders-header-tabs-tab" key={key} label={label} {...a11yProps(index)} />;
      })}
    </StyledOrdersTabs>
  );
};

const useGetOrderNameCallback = () => {
  const {
    translations,
    uiPreferences: { getOrdersTabsLabel },
  } = useTwapContext();
  const tabs = useOrdersTabs();

  return React.useCallback(
    (key: string) => {
      const name = translations[key as keyof Translations] || key;
      const amount = tabs[key as keyof typeof tabs];
      return getOrdersTabsLabel ? getOrdersTabsLabel(name, amount) : `${amount} ${name}`;
    },
    [tabs, translations, getOrdersTabsLabel]
  );
};

export const SelectedOrders = ({ className = "" }: { className?: string }) => {
  const { orders, isLoading } = query.useOrdersHistory();
  const { tab } = useOrdersStore();
  const tabs = useOrdersTabs();
  return (
    <StyledOrdersLists className={`twap-orders-lists ${className}`}>
      {_.keys(tabs).map((key: any) => {
        const tabValue = _.keys(tabs)[tab];

        const selected = tabValue === key;

        if (!selected) return null;
        if (tabValue === "All") {
          return <OrdersList key={key} isLoading={isLoading} orders={_.flatMap(orders)} />;
        }

        return <OrdersList key={key} isLoading={isLoading} status={key as any as Status} orders={orders[key as any as Status] as ParsedOrder[]} />;
      })}
    </StyledOrdersLists>
  );
};

function MobileMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const tabs = useOrdersTabs();
  const { tab } = useOrdersStore();
  const getName = useGetOrderNameCallback();

  const selected = _.keys(tabs)[tab];
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <StyledMobileButton className="twap-orders-mobile-button" onClick={handleClick}>
        <StyledRowFlex>
          {selected}
          <IoIosArrowDown />
        </StyledRowFlex>
      </StyledMobileButton>
      <Menu
        className="twap-orders-mobile-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {_.keys(tabs).map((key, index) => {
          return (
            <MenuItem
              key={key}
              onClick={() => {
                setAnchorEl(null);
                useOrdersStore.getState().setTab(index);
              }}
            >
              {getName(key)}
            </MenuItem>
          );
        })}
      </Menu>
    </div>
  );
}

const StyledMobileButton = styled(Button)({
  minWidth: 100,
});
