import { useMediaQuery } from "@mui/material";
import { Status } from "@orbs-network/twap";
import _ from "lodash";
import { ParsedOrder, Translations, useTwapContext } from "..";
import { useOrdersHistoryQuery, useOrdersTabs } from "../hooks";
import { useOrdersStore } from "../store";
import { StyledOrdersLists, StyledOrdersTab, StyledOrdersTabs } from "../styles";
import OrdersList from "../orders/OrdersList";
import { Dex } from "../consts";

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
  const tabs = useOrdersTabs();
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <StyledOrdersTabs variant="scrollable" scrollButtons={isMobile} className={`twap-orders-header-tabs ${className}`} value={tab} onChange={handleChange}>
      {_.keys(tabs).map((key, index) => {
        const name = translations[key as keyof Translations] || key;
        const amount = tabs[key as keyof typeof tabs];
        const label = getOrdersTabsLabel ? getOrdersTabsLabel(name, amount) : `${amount} ${name}`;

        return <StyledOrdersTab className="twap-orders-header-tabs-tab" key={key} label={label} {...a11yProps(index)} />;
      })}
    </StyledOrdersTabs>
  );
};

/**
 * The `SelectedOrders` component renders a list of `OrdersList` components based on the selected tab
 * and the specified decentralized exchange (DEX).
 *
 * This component dynamically selects and renders the appropriate `OrdersList` based on the selected
 * tab and the `dex` prop. If the `dex` is `TradingPost`, a specific `OrdersList` with customized
 * props is rendered.
 *
 * @param {string} [className=""] - Optional additional class names for styling the component.
 * @param {Dex} [dex] - The decentralized exchange (DEX) being used. This prop controls the behavior
 *                      of the component. The available options for `dex` are:
 *                      - `Dex.Uniswap` ("uniswap")
 *                      - `Dex.Sushiswap` ("sushiswap")
 *                      - `Dex.Quickswap` ("quickswap")
 *                      - `Dex.TradingPost` ("tradingpost")
 *
 * @returns {JSX.Element} A list of `OrdersList` components rendered based on the selected tab value
 *                        and the specified `dex`.
 */
export const SelectedOrders = ({ className = "", dex }: { className?: string, dex?: string }) => {
  const { orders, isLoading } = useOrdersHistoryQuery();
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
        if (dex === Dex.TradingPost) {
          return <OrdersList key={key} isLoading={isLoading} status={key as any as Status} orders={orders[key as any as Status] as ParsedOrder[]} dex={Dex.TradingPost}/>;
        }
        return <OrdersList key={key} isLoading={isLoading} status={key as any as Status} orders={orders[key as any as Status] as ParsedOrder[]} />;
      })}
    </StyledOrdersLists>
  );
};
