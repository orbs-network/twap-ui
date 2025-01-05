import { useMediaQuery } from "@mui/material";
import { Status } from "@orbs-network/twap";
import _ from "lodash";
import { Styles, Translations, useTwapContext } from "..";
import { useOrdersHistoryQuery } from "../hooks";
import { useOrdersStore } from "../store";
import { StyledOrdersLists, StyledOrdersTab, StyledOrdersTabs } from "../styles";
import OrdersList from "../orders/OrdersList";
import { useMemo } from "react";
import { groupOrdersByStatus, Order } from "../order";

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export const OrdersSelectTabs = ({ className = "" }: { className?: string }) => {
  const {
    translations,
    uiPreferences: { getOrdersTabsLabel },
  } = useTwapContext();
  const { tab, setTab } = useOrdersStore();
  const isMobile = useMediaQuery("(max-width:600px)");
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
  return null;
  // return (
  //   <StyledOrdersTabs variant="scrollable" scrollButtons={isMobile} className={`twap-orders-header-tabs ${className}`} value={tab} onChange={handleChange}>
  //     {_.keys(tabs).map((key, index) => {
  //       const name = translations[key as keyof Translations] || key;
  //       const amount = tabs[key as keyof typeof tabs];
  //       const label = getOrdersTabsLabel ? getOrdersTabsLabel(name, amount) : `${amount} ${name}`;

  //       return <StyledOrdersTab className="twap-orders-header-tabs-tab" key={key} label={label} {...a11yProps(index)} />;
  //     })}
  //   </StyledOrdersTabs>
  // );
};

export const SelectedOrders = ({ className = "" }: { className?: string }) => {
  const { data: orders, isLoading } = useOrdersHistoryQuery();
  const { tab } = useOrdersStore();
  return (
    <StyledOrdersLists className={`twap-orders-lists ${className}`}>
      {/* {_.keys(tabs).map((key: any) => {
        const tabValue = _.keys(tabs)[tab];

        const selected = tabValue === key;

        if (!selected) return null;
        if (tabValue === "All") {
          return <OrdersList key={key} isLoading={isLoading} orders={orders} />;
        }

        return <OrdersList key={key} isLoading={isLoading} status={key as any as Status} orders={orders[key as any as Status] as ParsedOrder[]} />;
      })} */}
    </StyledOrdersLists>
  );
};

export const AllOrders = ({
  className = "",
  orders = [],
  isLoading,
  onCancelSuccess,
}: {
  className?: string;
  orders?: Order[];
  isLoading?: boolean;
  onCancelSuccess?: (orderId: number) => void;
}) => {
  return (
    <StyledOrdersLists className={`twap-orders-lists ${className}`}>
      <OrdersList onCancelSuccess={onCancelSuccess} isLoading={Boolean(isLoading)} orders={orders} />
    </StyledOrdersLists>
  );
};

export const OpenOrders = ({ className = "" }: { className?: string }) => {
  const { data: orders, isLoading } = useOrdersHistoryQuery();

  const list = useMemo(() => (!orders ? [] : groupOrdersByStatus(orders).Open), [orders]);
  return (
    <StyledOrdersLists className={`twap-orders-lists ${className}`}>
      {!list?.length ? <Styles.StyledText>No open orders found</Styles.StyledText> : <OrdersList isLoading={isLoading} status={Status.Open} orders={list} />}
    </StyledOrdersLists>
  );
};
