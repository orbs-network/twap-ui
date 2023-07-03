import { Fade, Tab, Tabs, Box, styled } from "@mui/material";
import { useState } from "react";
import OrdersList from "./OrdersList";
import _ from "lodash";
import { Translations } from "../types";
import { RxStopwatch } from "react-icons/rx";
import { Status } from "@orbs-network/twap";
import { useOrdersHistoryQuery } from "../hooks";
import { useTwapContext } from "../context";
import { Components, Styles } from "..";

interface Props {
  disableAnimation?: boolean;
  className?: string;
}

function Orders(props: Props) {
  const { className = "" } = props;
  const [selectedTab, setSelectedTab] = useState(0);
  const { orders, isLoading } = useOrdersHistoryQuery();
  const { translations } = useTwapContext();
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <StyledContainer className={`twap-orders twap-orders-wrapper ${className}`}>
      <StyledHeader className="twap-orders-header">
        <StyledHeaderTop>
          <Styles.StyledRowFlex justifyContent="flex-start" gap={5} style={{ width: "auto" }}>
            <Components.Base.Icon className="stopwatch-icon" icon={<RxStopwatch style={{ width: 19, height: 19 }} />} />
            <Components.Base.Label className="twap-orders-title" tooltipText={translations.ordersTooltip} fontSize={16}>
              {translations.orders}
            </Components.Base.Label>
          </Styles.StyledRowFlex>
          <StyledOdnpButton />
        </StyledHeaderTop>
        <StyledTabs variant="scrollable" className="twap-orders-header-tabs" value={selectedTab} onChange={handleChange}>
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
          if (props.disableAnimation) {
            return (
              <StyledOrderList key={key} style={{ display: selected ? "block" : "none" }}>
                <OrdersList isLoading={isLoading} status={key as any as Status} orders={orders[key as any as Status]} />
              </StyledOrderList>
            );
          }
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
    padding: "0px 20px",
    width: "unset",
  },
});

const StyledTabs = styled(Tabs)({
  border: "1px solid #202432",
  width: "100%",
  borderRadius: 6,
  padding: 3,
  "& .MuiTabs-indicator": {
    height: "100%",

    zIndex: 1,
  },
  "& .MuiTouchRipple-root": {},
  "& .MuiButtonBase-root": {
    zIndex: 9,
  },
  "& .Mui-selected": {},
});
const StyledContainer = styled(Box)({
  width: "100%",
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
