import { Fade, Tab, Tabs } from "@mui/material";
import { Box, styled } from "@mui/system";
import React from "react";
import OrdersList from "./OrdersList";
import _ from "lodash";
import { Translations } from "../types";
import { RxStopwatch } from "react-icons/rx";
import { Status } from "@orbs-network/twap";
import { useOrdersHistoryQuery } from "../hooks";
import { useOrdersContext } from "../context";
import { Components, Styles } from "..";

function Orders() {
  const [selectedTab, setSelectedTab] = React.useState(0);
  const { orders, isLoading } = useOrdersHistoryQuery();
  const translations = useOrdersContext().translations;

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <StyledContainer className="twap-orders twap-orders-wrapper">
      <StyledHeader className="twap-orders-header">
        <StyledHeaderTop>
          <Styles.StyledRowFlex justifyContent="flex-start" gap={5} style={{ width: "auto" }}>
            <Components.Base.Icon icon={<RxStopwatch style={{ width: 19, height: 19 }} />} />
            <Components.Base.Label tooltipText={translations.ordersTooltip} fontSize={16}>
              {translations.orders}
            </Components.Base.Label>
          </Styles.StyledRowFlex>
          <StyledOdnpButton />
        </StyledHeaderTop>
        <StyledTabs className="twap-orders-header-tabs" value={selectedTab} onChange={handleChange}>
          {_.keys(Status).map((key, index) => {
            const status = key as Status;

            return (
              <StyledTab
                className="twap-orders-header-tabs-tab"
                key={key}
                label={`${orders[status] ? orders[status]?.length : "0"} ${translations[key as keyof Translations]}`}
                {...a11yProps(index)}
              />
            );
          })}
        </StyledTabs>
      </StyledHeader>
      <StyledLists className="twap-orders-lists">
        {_.keys(Status).map((key: any, index: number) => {
          const selected = selectedTab === index;
          return (
            <Fade in={selected} key={key}>
              <StyledOrderList style={{ display: selected ? "block" : "none" }}>
                <OrdersList isLoading={isLoading} status={key as any as Status} orders={orders[key as any as Status]} />
              </StyledOrderList>
            </Fade>
          );
        })}
      </StyledLists>
    </StyledContainer>
  );
}

const StyledOrderList = styled(Box)({});

const StyledLists = styled(Box)({
  overflow: "auto",
  height: "100%",
});

const StyledHeader = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 13,
  padding: "0 26px",
  paddingTop: 20,
});

const StyledOdnpButton = styled(Components.OdnpButton)({
  marginRight: 5,
});

const StyledTab = styled(Tab)({
  fontSize: 13,
  width: "calc(100% / 4)",
  padding: "0px",
  textTransform: "unset",
  fontFamily: "inherit",
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
const StyledContainer = styled(Box)({
  width: "100%",
  maxWidth: 454,
  margin: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 15,

  "& *": {
    fontFamily: "inherit",
    color: "inherit",
  },
});
const StyledHeaderTop = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
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
