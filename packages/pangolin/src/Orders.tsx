import { Box, styled, Typography } from "@mui/material";
import { Status } from "@orbs-network/twap";
import { CancelOrderButton, Components, hooks, OrderUI, store, Styles, useTwapContext } from "@orbs-network/twap-ui";
import _ from "lodash";
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";

interface ContextProps {
  selectedOrderId?: number;
  setSelectedOrderId: (id: number) => void;
  selectedTab: Status;
  setSelectedTab: (status: Status) => void;
  limit?: boolean;
}

const Context = createContext({} as ContextProps);

const useOrdersContext = () => useContext(Context);

const useSelectOrderOnLoad = () => {
  const { flatOrders, dataUpdatedAt } = useOrders();
  const { setSelectedOrderId, selectedOrderId, limit } = useOrdersContext();
  const ref = useRef<boolean | undefined>(false);
  useEffect(() => {
    if (selectedOrderId === undefined || ref.current !== limit) {
      setSelectedOrderId(flatOrders[0]?.order.id);
      ref.current = limit;
    }
  }, [selectedOrderId, dataUpdatedAt, _.size(flatOrders), limit]);
};

const useOrders = () => {
  const { data, dataUpdatedAt } = hooks.useOrdersHistoryQuery();
  const { limit } = useOrdersContext();
  const { selectedTab } = useOrdersContext();

  const allOrders = useMemo(() => {
    return _.groupBy(
      limit ? _.filter(_.flatMap(data), (order: OrderUI) => order.ui.totalChunks === 1) : _.filter(_.flatMap(data), (order: OrderUI) => order.ui.totalChunks > 1),
      (order: OrderUI) => order.ui.status
    );
  }, [dataUpdatedAt, limit]);

  const selectedOrders = useMemo(() => {
    return allOrders?.[selectedTab];
  }, [dataUpdatedAt, selectedTab, limit]);

  const flatOrders = useMemo(() => {
    return _.flatMap(allOrders);
  }, [dataUpdatedAt, limit]);

  return { allOrders, dataUpdatedAt, selectedOrders, flatOrders };
};

const ContextWrapper = ({ children, limit }: { children: ReactNode; limit?: boolean }) => {
  const [selectedOrderId, setSelectedOrderId] = useState<number | undefined>(undefined);
  const [selectedTab, setSelectedTab] = useState<Status>(Status.Open);

  return <Context.Provider value={{ limit, selectedOrderId, setSelectedOrderId, selectedTab, setSelectedTab }}>{children}</Context.Provider>;
};

export const PangolinOrders = ({ limit }: { limit?: boolean }) => {
  return (
    <ContextWrapper limit={limit}>
      <Orders />;
    </ContextWrapper>
  );
};

function Orders() {
  useSelectOrderOnLoad();
  return (
    <StyledOrders>
      <Header />
      <StyledOrdersFlex>
        <Order />
        <List />
      </StyledOrdersFlex>
    </StyledOrders>
  );
}

const StyledOrdersFlex = styled(Styles.StyledRowFlex)({
  gap: 20,
  alignItems: "flex-start",
});

const OrderDetail = ({ label, value, labelTooltip, valueTooltip }: { label: string; labelTooltip?: string; value: ReactNode; valueTooltip?: string }) => {
  return (
    <StyledOrderDetail>
      <Components.Base.Label tooltipText={labelTooltip}>{label}</Components.Base.Label>
      <Components.Base.Tooltip text={valueTooltip}>{value}</Components.Base.Tooltip>
    </StyledOrderDetail>
  );
};

const SrcTokenAmount = () => {
  const selectedOrder = useSelectedOrder();
  const amount = hooks.useFormatNumber({ value: selectedOrder?.ui.srcAmountUi });

  return (
    <OrderDetail
      label="Input Amount"
      value={
        <Styles.StyledRowFlex justifyContent="flex-start">
          <Typography>{amount}</Typography>
          <Components.Base.TokenLogo logo={selectedOrder?.ui.srcToken.logoUrl} />
        </Styles.StyledRowFlex>
      }
    />
  );
};

const DstTokenAmount = () => {
  const selectedOrder = useSelectedOrder();
  const { data } = hooks.useOrderPastEvents(selectedOrder!, true);
  const amount = hooks.useFormatNumber({ value: data?.dstAmountOut });

  return (
    <OrderDetail
      label="Output Amount"
      value={
        <Styles.StyledRowFlex justifyContent="flex-start">
          <Typography>{amount}</Typography>
          <Components.Base.TokenLogo logo={selectedOrder?.ui.dstToken.logoUrl} />
        </Styles.StyledRowFlex>
      }
    />
  );
};

const MinReceivedPerTrade = () => {
  const selectedOrder = useSelectedOrder();
  const { translations } = useTwapContext();
  const amount = hooks.useFormatNumber({ value: selectedOrder?.ui.dstMinAmountOutUsdUi });
  const tooltip = hooks.useFormatNumber({ value: selectedOrder?.ui.dstMinAmountOutUsdUi, decimalScale: 18 });

  if (selectedOrder?.ui.isMarketOrder) return null;
  return <OrderDetail valueTooltip={tooltip} labelTooltip={translations.confirmationMinDstAmountTootipLimit} label={translations.minReceivedPerTrade} value={amount} />;
};

const TradeSize = () => {
  const selectedOrder = useSelectedOrder();
  const { translations } = useTwapContext();
  const amount = hooks.useFormatNumber({ value: selectedOrder?.ui.srcChunkAmountUi });
  const tooltip = hooks.useFormatNumber({ value: selectedOrder?.ui.srcChunkAmountUi, decimalScale: 18 });

  return <OrderDetail value={amount} valueTooltip={tooltip} label={translations.tradeSize} labelTooltip={translations.tradeSizeTooltip} />;
};

const OrderStatus = () => {
  const selectedOrder = useSelectedOrder();

  return <OrderDetail label="Status" value={getStatusName(selectedOrder!.ui.status)} />;
};

const TotalTrades = () => {
  const selectedOrder = useSelectedOrder();
  const { translations } = useTwapContext();

  const amount = hooks.useFormatNumber({ value: selectedOrder?.ui.totalChunks });

  return <OrderDetail labelTooltip={translations.totalTradesTooltip} label={translations.totalTrades} value={amount} />;
};

const TradeInterval = () => {
  const selectedOrder = useSelectedOrder();
  const { translations } = useTwapContext();
  const minimumDelayMinutes = store.useTwapStore((state) => state.getMinimumDelayMinutes());

  return (
    <OrderDetail
      labelTooltip={translations.tradeIntervalTootlip.replace("{{minutes}}", minimumDelayMinutes.toString())}
      label={translations.tradeInterval}
      value={store.fillDelayText(selectedOrder!.ui.fillDelay, translations)}
    />
  );
};

const Deadline = () => {
  const selectedOrder = useSelectedOrder();
  const { translations } = useTwapContext();

  return <OrderDetail labelTooltip={translations.maxDurationTooltip} label={translations.deadline} value={selectedOrder?.ui.deadlineUi} />;
};

const CancelOrder = () => {
  const selectedOrder = useSelectedOrder();

  if (selectedOrder?.ui.status !== Status.Open) return null;
  return <CancelOrderButton orderId={selectedOrder!.order.id} />;
};

const StyledOrderDetail = styled(Styles.StyledColumnFlex)({
  width: "calc(50% - 10px)",
  ".twap-token-logo": {
    width: 26,
    height: 26,
  },
});
const Header = () => {
  const { limit } = useOrdersContext();
  return (
    <StyledHeader>
      <StyledHeaderTitle>{limit ? "Limit Orders" : "TWAP Orders"}</StyledHeaderTitle>
      <Tabs />
    </StyledHeader>
  );
};

const useSelectedOrder = (): OrderUI | undefined => {
  const { selectedOrderId } = useOrdersContext();
  const { dataUpdatedAt, flatOrders } = useOrders();

  return useMemo(() => flatOrders.find((order: OrderUI) => order.order.id === selectedOrderId), [dataUpdatedAt, selectedOrderId]);
};
const Order = () => {
  const selectedOrder = useSelectedOrder();
  console.log(selectedOrder);

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
      <StyledDetails>
        <SrcTokenAmount />
        <DstTokenAmount />
        <MinReceivedPerTrade />
        <TradeSize />
        <TotalTrades />
        <TradeInterval />
        <Deadline />
        <OrderStatus />
      </StyledDetails>
      <CancelOrder />
    </StyledOrder>
  );
};

const StyledDetails = styled(Styles.StyledRowFlex)({
  flexWrap: "wrap",
  justifyContent: "flex-start",
});

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
  justifyContent: "space-between",
});

const StyledOrders = styled(Styles.StyledColumnFlex)({
  background: "#111111",
  padding: 20,
  width: "100%",
  color: "white",
});

const List = () => {
  const { selectedTab } = useOrdersContext();
  const { selectedOrders } = useOrders();

  if (!_.size(selectedOrders)) {
    return (
      <StyledEmptyList>
        No <span>{getStatusName(selectedTab)}</span> Order
      </StyledEmptyList>
    );
  }
  return (
    <StyledList>
      {selectedOrders?.map((o) => {
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
      <Styles.StyledRowFlex justifyContent="space-between">
        <Typography>
          Buy {order.ui.dstToken.symbol} with {order.ui.srcToken.symbol}
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
  padding: "0px 15px",
  cursor: "pointer",
  fontSize: 14,
  transition: "background 0.2s",
}));
const StyledTabs = styled(Styles.StyledRowFlex)({
  background: "#717171",
  borderRadius: 8,
  height: 34,
  padding: 2,
  width: "auto",
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
  padding: "5px 14px",
  cursor: "pointer",
  minHeight: 64,
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
