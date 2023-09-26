import { Box, styled, Typography } from "@mui/material";
import { Status } from "@orbs-network/twap";
import { CancelOrderButton, Components, hooks, OrderUI, store, Styles, useTwapContext } from "@orbs-network/twap-ui";
import _ from "lodash";
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";

interface ContextProps {
  selectedOrder?: OrderUI;
  setSelectedOrder: (value: OrderUI) => void;
  selectedTab: Status;
  setSelectedTab: (status: Status) => void;
  limit?: boolean;
}

const Context = createContext({} as ContextProps);

const useOrdersContext = () => useContext(Context);

const useOrders = () => {
  const { data, dataUpdatedAt } = hooks.useOrdersHistoryQuery();
  const { limit } = useOrdersContext();

  return useMemo(() => {
    const filterCondition = limit ? (order: OrderUI) => order.ui.totalChunks === 1 : (order: OrderUI) => order.ui.totalChunks > 1;
    const _orders = _.filter(_.flatMap(data), (it: OrderUI) => it.ui.status !== Status.Expired);
    const allOrders = _.groupBy(_.filter(_orders, filterCondition), (order: OrderUI) => order.ui.status);
    const flatOrders = _.flatMap(allOrders);
    return {
      allOrders,
      flatOrders,
      firstOrder: _.first(flatOrders) as OrderUI,
    };
  }, [dataUpdatedAt, limit]);
};

const ContextWrapper = ({ children, limit }: { children: ReactNode; limit?: boolean }) => {
  const [selectedOrder, setSelectedOrder] = useState<OrderUI | undefined>(undefined);
  const [selectedTab, setSelectedTab] = useState<Status>(Status.Open);

  return <Context.Provider value={{ limit, selectedOrder, setSelectedOrder, selectedTab, setSelectedTab }}>{children}</Context.Provider>;
};

export const PangolinOrders = ({ limit }: { limit?: boolean }) => {
  const { lib } = store.useTwapStore();
  if (!lib) return null;
  return (
    <ContextWrapper limit={limit}>
      <Orders />;
    </ContextWrapper>
  );
};

function Orders() {
  const { firstOrder } = useOrders();
  const { setSelectedOrder, limit, selectedOrder } = useOrdersContext();
  const ref = useRef(limit);
  const account = useTwapContext().account;
  useEffect(() => {
    if (!selectedOrder || limit !== ref.current) {
      setSelectedOrder(firstOrder);
      ref.current = limit;
    }
  }, [firstOrder, limit, selectedOrder]);

  useEffect(() => {
    setSelectedOrder(firstOrder);
  }, [account, firstOrder]);

  return (
    <StyledOrders>
      <Header />
      <StyledOrdersFlex>
        <SelectedOrder />
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
      <StyledOrderDetailLabel tooltipText={labelTooltip}>{label}</StyledOrderDetailLabel>
      <StyledOrderDetailValue>
        <Components.Base.Tooltip text={valueTooltip}>{value}</Components.Base.Tooltip>
      </StyledOrderDetailValue>
    </StyledOrderDetail>
  );
};

const SrcTokenAmount = () => {
  const selectedOrder = useOrdersContext().selectedOrder;
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

const Progress = () => {
  const { selectedOrder, limit } = useOrdersContext();

  if (limit) return null;
  return <OrderDetail label="Progress" value={<Typography>{`${selectedOrder?.ui.progress}%`}</Typography>} />;
};

const DstTokenAmount = () => {
  const selectedOrder = useOrdersContext().selectedOrder;
  const { data } = hooks.useOrderPastEvents(selectedOrder!, true);
  const amount = hooks.useFormatNumber({ value: data?.dstAmountOut });

  return (
    <OrderDetail
      label="Output Amount filled"
      value={
        <Styles.StyledRowFlex justifyContent="flex-start">
          {!data ? <StyledDstAmountLoader /> : <Typography>{amount}</Typography>}
          <Components.Base.TokenLogo logo={selectedOrder?.ui.dstToken.logoUrl} />
        </Styles.StyledRowFlex>
      }
    />
  );
};

const StyledDstAmountLoader = styled(Components.Base.Loader)({
  flex: 1,
  maxWidth: 80,
});

const MinReceivedPerTrade = () => {
  const selectedOrder = useOrdersContext().selectedOrder;
  const { translations } = useTwapContext();
  const amount = hooks.useFormatNumber({ value: selectedOrder?.ui.dstMinAmountOutUsdUi });
  const tooltip = hooks.useFormatNumber({ value: selectedOrder?.ui.dstMinAmountOutUsdUi, decimalScale: 18 });
  const { limit } = useOrdersContext();

  if (limit || selectedOrder?.ui.isMarketOrder) return null;
  return <OrderDetail valueTooltip={tooltip} labelTooltip={translations.confirmationMinDstAmountTootipLimit} label={translations.minReceivedPerTrade} value={amount} />;
};

const TradeSize = () => {
  const selectedOrder = useOrdersContext().selectedOrder;
  const { translations } = useTwapContext();
  const amount = hooks.useFormatNumber({ value: selectedOrder?.ui.srcChunkAmountUi });
  const tooltip = hooks.useFormatNumber({ value: selectedOrder?.ui.srcChunkAmountUi, decimalScale: 18 });
  const { limit } = useOrdersContext();

  if (limit) return null;
  return <OrderDetail value={amount} valueTooltip={tooltip} label={translations.tradeSize} labelTooltip={translations.tradeSizeTooltip} />;
};

const OrderStatus = () => {
  const selectedOrder = useOrdersContext().selectedOrder;

  return <OrderDetail label="Status" value={getStatusName(selectedOrder!.ui.status)} />;
};

const TotalTrades = () => {
  const { translations } = useTwapContext();
  const { limit, selectedOrder } = useOrdersContext();

  const amount = hooks.useFormatNumber({ value: selectedOrder?.ui.totalChunks });

  if (limit) return null;
  return <OrderDetail labelTooltip={translations.totalTradesTooltip} label={translations.totalTrades} value={amount} />;
};

const TradeInterval = () => {
  const { translations } = useTwapContext();
  const minimumDelayMinutes = store.useTwapStore((state) => state.getMinimumDelayMinutes());
  const { limit, selectedOrder } = useOrdersContext();

  if (limit) return null;
  return (
    <OrderDetail
      labelTooltip={translations.tradeIntervalTootlip.replace("{{minutes}}", minimumDelayMinutes.toString())}
      label={translations.tradeInterval}
      value={store.fillDelayText(selectedOrder!.ui.fillDelay, translations)}
    />
  );
};

const Deadline = () => {
  const { translations } = useTwapContext();
  const { limit, selectedOrder } = useOrdersContext();

  if (limit) return null;
  return <OrderDetail labelTooltip={translations.maxDurationTooltip} label={translations.deadline} value={selectedOrder?.ui.deadlineUi} />;
};

const CancelOrder = () => {
  const selectedOrder = useOrdersContext().selectedOrder;

  if (selectedOrder?.ui.status !== Status.Open) return null;
  return <StyledCancelButton orderId={selectedOrder!.order.id} />;
};

const StyledCancelButton = styled(CancelOrderButton)({
  background: "#717171",
  margin: 0,
  minHeight: 34,
  padding: "0 20px",
  marginLeft: "auto",
  marginRight: "auto",
  marginTop: 30,
  minWidth: 200,
  "*": {
    color: "white",
    fontSize: 14,
  },
});

const StyledOrderDetail = styled(Styles.StyledColumnFlex)({
  gap: 5,
  width: "calc(50% - 10px)",
  ".twap-token-logo": {
    width: 22,
    height: 22,
  },
});

const StyledOrderDetailLabel = styled(Components.Base.Label)({
  fontSize: 14,
  fontWeight: 500,
  color: "#C3C5CB",
});

const StyledOrderDetailValue = styled("div")({
  width: "100%",
  fontSize: 14,
  fontWeight: 500,
  "*": {
    fontSize: "inherit",
    fontWeight: "inherit",
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

const SelectedOrder = () => {
  const selectedOrder = useOrdersContext().selectedOrder;

  if (!selectedOrder) return null;
  return (
    <StyledSelectedOrder>
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
        <Progress />
        <OrderStatus />
      </StyledDetails>
      <CancelOrder />
    </StyledSelectedOrder>
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

const StyledSelectedOrder = styled(Styles.StyledColumnFlex)({
  width: "50%",
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
  const { allOrders } = useOrders();

  const selectedOrders = allOrders[selectedTab];

  return (
    <StyledList>
      {!_.size(selectedOrders) ? (
        <StyledEmptyList>
          No <span>{getStatusName(selectedTab)}</span> Order
        </StyledEmptyList>
      ) : (
        selectedOrders?.map((o) => {
          return <ListItem key={o.order.id} order={o} />;
        })
      )}
    </StyledList>
  );
};

const StyledEmptyList = styled(Typography)({
  textAlign: "center",
  width: "100%",
  marginTop: 30,
  fontSize: 15,
  "& span": {
    textTransform: "uppercase",
  },
});
const decimalScale = 3;
const ListItem = ({ order }: { order: OrderUI }) => {
  const { setSelectedOrder, selectedOrder } = useOrdersContext();
  const { data } = hooks.useOrderPastEvents(order, true);
  const outAmount = hooks.useFormatNumber({ value: data?.dstAmountOut, decimalScale });
  const srcAmount = hooks.useFormatNumber({ value: order.ui.srcAmountUi, decimalScale });
  return (
    <StyledListItem selected={order.order.id === selectedOrder?.order.id ? 1 : 0} onClick={() => setSelectedOrder(order)}>
      <Styles.StyledRowFlex justifyContent="space-between">
        <Typography>
          Buy {order.ui.dstToken.symbol} with {order.ui.srcToken.symbol}
        </Typography>
        <Styles.StyledColumnFlex style={{ width: "auto", alignItems: "flex-end", gap: 2 }}>
          {!data ? (
            <StyledListItemLoader />
          ) : (
            <Typography>
              {srcAmount}/{outAmount}
            </Typography>
          )}
          <StyledListItemStatus>{getStatusName(order.ui.status)}</StyledListItemStatus>
        </Styles.StyledColumnFlex>
      </Styles.StyledRowFlex>
    </StyledListItem>
  );
};

const StyledListItemLoader = styled(Components.Base.Loader)({
  width: 60,
});

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
  width: "50%",
  gap: 0,
});
