import { Tab, Tabs } from "@mui/material";
import { Box, styled } from "@mui/system";
import React from "react";
import OrdersList from "./OrdersList";
import _ from "lodash";
import Label from "../base-components/Label";
import { OrderStatus, Translations } from "../types";
import { useOrders } from "../store/orders";
import OdnpButton from "../base-components/OdnpButton";
import { useTwapTranslations } from "..";

function Orders() {
  const [selectedTab, setSelectedTab] = React.useState(0);
  const { data: orders = {}, isLoading: ordersLoading } = useOrders();
  const translations = useTwapTranslations();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <StyledContainer className="twap-orders">
      <StyledHeader className="twap-orders-header">
        <StyledHeaderTop>
          <Label tooltipText="Some text">{translations.orders}</Label>
          <StyledOdnpButton />
        </StyledHeaderTop>
        <StyledTabs value={selectedTab} onChange={handleChange}>
          {_.keys(OrderStatus).map((key, index) => {
            return <StyledTab key={index} label={`${orders[key] ? orders[key]?.length : "0"} ${translations[key as keyof Translations]}`} {...a11yProps(index)} />;
          })}
        </StyledTabs>
      </StyledHeader>
      <StyledLists className="twap-orders-lists">
        {_.keys(OrderStatus).map((key: any, index: number) => {
          if (selectedTab !== index) {
            return null;
          }
          return <OrdersList isLoading={ordersLoading} type={key as any as OrderStatus} orders={orders[key as any as OrderStatus]} key={key} />;
        })}
      </StyledLists>
    </StyledContainer>
  );
}

const StyledLists = styled(Box)({
  maxHeight: 400,
  overflow: "auto",
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
  fontSize: 13,
  width: "calc(100% / 4)",
  padding: "0px",
  textTransform: "unset",
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
const StyledContainer = styled(Box)({ width: "100%", paddingTop: 5, display: "flex", flexDirection: "column", gap: 15 });
const StyledHeaderTop = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  paddingLeft: 5,
  width: "100%",
  marginBottom: 10,
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
