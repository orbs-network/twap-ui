import { Tab, Tabs, Typography } from "@mui/material";
import { Box, styled } from "@mui/system";
import React from "react";
import { OrderStatus } from "./data";
import OrdersList from "./OrdersList";
import _ from "lodash";
// TODO change name to orders

function Orders() {
  const [selectedTab, setSelectedTab] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <StyledContainer>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={selectedTab} onChange={handleChange} aria-label="basic tabs example">
          {_.keys(allOrders).map((key, index) => {
            return <Tab label={key} {...a11yProps(index)} />;
          })}
        </Tabs>
      </Box>

      {_.keys(allOrders).map((key: any, index: number) => {
        const orders = allOrders[key as any as OrderStatus];
        if (selectedTab !== index) {
          return null;
        }
        if (index == 2) {
          return null;
        }
        return <OrdersList key={index} />;
      })}
    </StyledContainer>
  );
}

const StyledContainer = styled(Box)({ width: "100%" });

export default Orders;

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const allOrders = {
  [OrderStatus.OPEN]: [1, 2, 3],
  [OrderStatus.CANCELED]: [4, 5, 6],
  [OrderStatus.EXECUTED]: [7, 8, 9],
  [OrderStatus.EXPIRED]: [10, 11, 12],
};
