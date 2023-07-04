import { Box } from "@mui/material";
import { Status } from "@orbs-network/twap";
import _ from "lodash";
import { Translations, useTwapContext } from "..";
import { useOrdersHistoryQuery } from "../hooks";
import { useOrdersStore } from "../store";
import { StyledOrdersLists, StyledOrdersTab, StyledOrdersTabs } from "../styles";
import OrdersList from "../orders/OrdersList";

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export const OrdersSelectTabs = ({
  className = "",
  getLabel = (label, amount) => `${amount} ${label}`,
}: {
  className?: string;
  getLabel?: (label: string, amount: number) => string;
}) => {
  const translations = useTwapContext().translations;
  const { orders } = useOrdersHistoryQuery();
  const { tab, setTab } = useOrdersStore();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <StyledOrdersTabs variant="scrollable" className={`twap-orders-header-tabs ${className}`} value={tab} onChange={handleChange}>
      {_.keys(Status).map((key, index) => {
        const label = getLabel(translations[key as keyof Translations], orders[key as Status]?.length || 0);

        return <StyledOrdersTab className="twap-orders-header-tabs-tab" key={key} label={label} {...a11yProps(index)} />;
      })}
    </StyledOrdersTabs>
  );
};

export const SelectedOrders = ({ className = "" }: { className?: string }) => {
  const { orders, isLoading } = useOrdersHistoryQuery();
  const { tab } = useOrdersStore();

  return (
    <StyledOrdersLists className={`twap-orders-lists ${className}`}>
      {_.keys(Status).map((key: any, index: number) => {
        const selected = tab === index;
        return (
          <Box key={key} style={{ display: selected ? "block" : "none" }}>
            <OrdersList isLoading={isLoading} status={key as any as Status} orders={orders[key as any as Status]} />
          </Box>
        );
      })}
    </StyledOrdersLists>
  );
};
