import { Box, styled, Typography } from "@mui/material";
import { Status } from "@orbs-network/twap";
import { Components, hooks, OrderUI, Styles } from "@orbs-network/twap-ui";
import _ from "lodash";
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

interface ContextProps {
  selectedOrderId?: number;
  setSelectedOrderId: (id: number) => void;
  selectedTab: Status;
  setSelectedTab: (status: Status) => void;
}

const Context = createContext({} as ContextProps);

const useOrdersContext = () => useContext(Context);

const ContextWrapper = ({ children }: { children: ReactNode }) => {
  const [selectedOrderId, setSelectedOrderId] = useState<number | undefined>(undefined);
  const [selectedTab, setSelectedTab] = useState<Status>(Status.Open);
  const { data, isSuccess } = hooks.useOrdersHistoryQuery();

  useEffect(() => {
    if (selectedOrderId === undefined && isSuccess) {
      setSelectedOrderId(_.flatMap(data)[0]?.order.id);
    }
  }, [selectedOrderId, isSuccess]);

  return <Context.Provider value={{ selectedOrderId, setSelectedOrderId, selectedTab, setSelectedTab }}>{children}</Context.Provider>;
};

export function PangolinOrders() {
  return (
    <ContextWrapper>
      <StyledOrders>
        <Header />
        <StyledOrdersFlex>
          <Order />
          <List />
        </StyledOrdersFlex>
      </StyledOrders>
    </ContextWrapper>
  );
}

const StyledOrdersFlex = styled(Styles.StyledRowFlex)({
  gap: 20,
});

const Header = () => {
  return (
    <StyledHeader>
      <StyledHeaderTitle>Limit Orders</StyledHeaderTitle>
      <Tabs />
    </StyledHeader>
  );
};

const Order = () => {
  const { selectedOrderId } = useOrdersContext();
  const { dataUpdatedAt, data } = hooks.useOrdersHistoryQuery();

  const selectedOrder: OrderUI | undefined = useMemo(() => _.flatMap(data).find((order: OrderUI) => order.order.id === selectedOrderId), [dataUpdatedAt, selectedOrderId]);

  if (!selectedOrder) return null;
  return (
    <StyledOrder>
      <StyledOrderHeader>
        <StyledLogos>
          <StyledSrcLogo logo={selectedOrder.ui.srcToken.logoUrl} />
          <StyledDstLogo logo={selectedOrder.ui.dstToken.logoUrl} />
        </StyledLogos>
        <StyledOrderSymbols>
          <StyledOrderSymbolsTop>
            {selectedOrder.ui.srcToken.symbol}/{selectedOrder.ui.dstToken.symbol}
          </StyledOrderSymbolsTop>
          <StyledOrderSymbolsBottom>Buy {selectedOrder.ui.dstToken.symbol}</StyledOrderSymbolsBottom>
        </StyledOrderSymbols>
      </StyledOrderHeader>
    </StyledOrder>
  );
};

const StyledOrderSymbols = styled(Styles.StyledColumnFlex)({
  width: "auto",
  flex: 1,
  gap: 4,
});

const StyledOrderSymbolsTop = styled(Typography)({
  fontSize: 16,
  fontWeight: 500,
});
const StyledOrderSymbolsBottom = styled(Typography)({
  fontSize: 12,
  color: "#E5E5E5",
});
const StyledLogos = styled(Box)({
  position: "relative",
  paddingRight: 50,
});

const StyledLogo = styled(Components.Base.TokenLogo)({
  width: 48,
  height: 48,
});
const StyledSrcLogo = styled(StyledLogo)({});

const StyledDstLogo = styled(StyledLogo)({
  position: "absolute",
  left: 44,
  top: 0,
});

const StyledOrderHeader = styled(Styles.StyledRowFlex)({
  justifyContent: "flex-start",
});

const StyledOrder = styled(Styles.StyledColumnFlex)({
  flex: 1,
  width: "auto",
});

const StyledHeaderTitle = styled(Typography)({
  fontSize: 20,
  whiteSpace: "nowrap",
});
const StyledHeader = styled(Styles.StyledRowFlex)({
  gap: 60,
});

const StyledOrders = styled(Styles.StyledColumnFlex)({
  background: "#111111",
  padding: 20,
  width: "100%",
  color: "white",
});

const List = () => {
  const { selectedTab } = useOrdersContext();
  const { data, dataUpdatedAt } = hooks.useOrdersHistoryQuery();

  const list = useMemo(() => data?.[selectedTab] || [], [dataUpdatedAt, selectedTab]);

  if (!_.size(list)) {
    return (
      <StyledEmptyList>
        No <span>{getStatusName(selectedTab)}</span> Order
      </StyledEmptyList>
    );
  }
  return (
    <StyledList>
      {list?.map((o) => {
        return <ListItem key={o.order.id} order={o} />;
      })}
    </StyledList>
  );
};

const StyledEmptyList = styled(Typography)({
  textAlign: "center",
  width: "50%",
  marginTop: 30,
  fontSize: 15,
  "& span": {
    textTransform: "uppercase",
  },
});
const decimalScale = 3;
const ListItem = ({ order }: { order: OrderUI }) => {
  const { setSelectedOrderId, selectedOrderId } = useOrdersContext();
  const { data } = hooks.useOrderPastEvents(order, true);
  const outAmount = hooks.useFormatNumber({ value: data?.dstAmountOut, decimalScale });
  const srcAmount = hooks.useFormatNumber({ value: order.ui.srcAmountUi, decimalScale });
  return (
    <StyledListItem selected={order.order.id === selectedOrderId ? 1 : 0} onClick={() => setSelectedOrderId(order.order.id)}>
      <Styles.StyledRowFlex>
        <Typography>
          By {order.ui.dstToken.symbol} with {order.ui.srcToken.symbol}
        </Typography>
        <Styles.StyledColumnFlex style={{ width: "auto", alignItems: "flex-end", gap: 2 }}>
          <Typography>
            {srcAmount}/{outAmount}
          </Typography>
          <StyledListItemStatus>{getStatusName(order.ui.status)}</StyledListItemStatus>
        </Styles.StyledColumnFlex>
      </Styles.StyledRowFlex>
    </StyledListItem>
  );
};

const tabs = [Status.Open, Status.Completed, Status.Canceled];

const Tabs = () => {
  const { selectedTab, setSelectedTab } = useOrdersContext();

  return (
    <StyledTabs>
      {tabs.map((it) => {
        return (
          <StyledTab onClick={() => setSelectedTab(it)} selected={selectedTab === it ? 1 : 0} key={it}>
            {getStatusName(it)}
          </StyledTab>
        );
      })}
    </StyledTabs>
  );
};

const StyledTab = styled("button")<{ selected: number }>(({ selected }) => ({
  textTransform: "uppercase",
  background: selected ? "#111111" : "transparent",
  border: "none",
  flex: 1,
  height: "100%",
  color: "#E5E5E5",
  borderRadius: 5,
  padding: "0px 4px",
  cursor: "pointer",
  fontSize: 13,
  transition: "background 0.2s",
}));
const StyledTabs = styled(Styles.StyledRowFlex)({
  flex: 1,
  background: "#717171",
  borderRadius: 8,
  height: 31,
  padding: 2,
});

const getStatusName = (status: Status) => {
  switch (status) {
    case Status.Completed:
      return "Excecuted";

    default:
      return status;
  }
};

const StyledListItemStatus = styled(Typography)({
  color: "#FFC800",
});

const StyledListItem = styled(Styles.StyledRowFlex)<{ selected: number }>(({ selected }) => ({
  padding: "0px 10px",
  cursor: "pointer",
  height: 64,
  borderBottom: "1px solid #282828",
  background: selected ? "#1C1C1C" : "transparent",
  p: {
    fontSize: 12,
    fontWeight: 500,
  },
}));

const StyledList = styled(Styles.StyledColumnFlex)({
  flex: 1,
  width: "auto",
  gap: 0,
});
