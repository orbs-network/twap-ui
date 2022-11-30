import { Tab, Tabs } from "@mui/material";
import { Box, styled } from "@mui/system";
import React from "react";
import OrdersList from "./OrdersList";
import _ from "lodash";
import Label from "../components/Label";
import { Translations } from "../types";
import OdnpButton from "../components/OdnpButton";
import Icon from "../components/Icon";
import { AiOutlineHistory } from "react-icons/ai";
import { Status } from "@orbs-network/twap";
import { useOrders } from "../hooks";
import { useOrdersContext } from "../context";

function Orders() {
  const [selectedTab, setSelectedTab] = React.useState(0);
  const { orders, loading } = useOrders();
  const translations = useOrdersContext().translations;

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <StyledContainer className="twap-orders">
      <StyledHeader className="twap-orders-header">
        <StyledHeaderTop>
          <Label iconStart={<Icon icon={<AiOutlineHistory className="twap-tooltip-icon" style={{ width: 20, height: 20 }} />} />} tooltipText={translations.ordersTooltip}>
            {translations.orders}
          </Label>
          <StyledOdnpButton />
        </StyledHeaderTop>
        <StyledTabs value={selectedTab} onChange={handleChange}>
          {_.keys(Status).map((key, index) => {
            return <StyledTab key={index} label={`${orders[key] ? orders[key]?.length : "0"} ${translations[key as keyof Translations]}`} {...a11yProps(index)} />;
          })}
        </StyledTabs>
      </StyledHeader>
      <StyledLists className="twap-orders-lists">
        {_.keys(Status).map((key: any, index: number) => {
          if (selectedTab !== index) {
            return null;
          }
          return <OrdersList isLoading={loading} status={key as any as Status} orders={orders[key as any as Status]} key={key} />;
        })}
      </StyledLists>
    </StyledContainer>
  );
}

const StyledLists = styled(Box)({
  overflow: "auto",
  height: "100%",
});

const StyledHeader = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 13,
});

const StyledOdnpButton = styled(OdnpButton)({
  marginRight: 5,
});

const StyledTab = styled(Tab)({
  fontSize: 14,
  width: "calc(100% / 4)",
  padding: "0px",
  textTransform: "unset",
  "@media(max-width: 600px)": {
    fontSize: 10,
    minWidth: "unset",
  },
});

const StyledTabs = styled(Tabs)({
  border: "1px solid #202432",
  width: "100%",
  borderRadius: 6,
  padding: 3,
  "& .MuiTabs-indicator": {
    height: "100%",
    borderRadius: 4,
    zIndex: 1,
  },
  "& .MuiTouchRipple-root": {
    display: "none",
  },
  "& .MuiButtonBase-root": {
    zIndex: 9,
    color: "white",
  },
  "& .Mui-selected": {
    color: "white",
  },
});
const StyledContainer = styled(Box)({ width: "100%", display: "flex", flexDirection: "column", gap: 15 });
const StyledHeaderTop = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: 5,
  paddingTop: 10,
  width: "100%",
  "& .twap-label": {
    fontSize: 18,
  },
});

export default Orders;

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
