import { Tab, Tabs, Typography } from "@mui/material";
import { Box, styled } from "@mui/system";
import React from "react";
import { createTxData, OrderStatus } from "./data";
import OrdersList from "./OrdersList";
import _ from "lodash";
import Label from "../base-components/Label";
import { useOrders } from "../store/store";
const data = createTxData();

function Orders() {
  const [selectedTab, setSelectedTab] = React.useState(0);
  const { data: orders = {} } = useOrders();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <StyledContainer className="twap-orders">
      <StyledHeader className="twap-orders-header">
        <StyledTitle>
          <Label tooltipText="Some text">Orders</Label>
        </StyledTitle>
        <StyledTabs value={selectedTab} onChange={handleChange}>
          {_.keys(allOrders).map((key, index) => {
            return <Tab key={key} label={key} {...a11yProps(index)} />;
          })}
        </StyledTabs>
      </StyledHeader>
      <StyledLists className="twap-orders-lists">
        {_.keys(orders).map((key: any, index: number) => {
          if (selectedTab !== index) {
            return null;
          }
          return <OrdersList orders={orders[key as any as OrderStatus]} type={key as OrderStatus} key={index} />;
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

const StyledTabs = styled(Tabs)({
  border: "1px solid #202432",
  width: "fit-content",
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
const StyledContainer = styled(Box)({ width: "100%", paddingTop: 20, display: "flex", flexDirection: "column", gap: 15 });
const StyledTitle = styled(Box)({
  paddingLeft: 5,
  width: "fit-content",
  marginRight: "auto",
  "& p": {
    fontSize: 20,
  },
});

export default Orders;

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const allOrders = {
  [OrderStatus.OPEN]: data,
  [OrderStatus.CANCELED]: [],
  [OrderStatus.FILLED]: data,
  [OrderStatus.EXPIRED]: data,
};
