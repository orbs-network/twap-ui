import { Box, ClickAwayListener, styled, Typography, useMediaQuery } from "@mui/material";
import { Status } from "@orbs-network/twap";
import { CancelOrderButton, Components, hooks, OrderUI, ParsedOrder, store, Styles, useTwapContext, OrdersPanel, fillDelayText } from "@orbs-network/twap-ui";
import _ from "lodash";
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { parseTheme } from "./styles";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
interface ContextProps {
  selectedOrderID?: number;
  setSelectedOrderID: (value: number) => void;
  selectedTab: Status;
  setSelectedTab: (status: Status) => void;
  limit?: boolean;
  theme: any;
}

const useMobile = () => useMediaQuery("(max-width: 600px)");
const TABS = [Status.Open, Status.Completed, Status.Canceled];

const Context = createContext({} as ContextProps);

const useOrdersContext = () => useContext(Context);

const useOrders = () => {
  const { data, dataUpdatedAt, isLoading } = hooks.useOrdersHistoryQuery();
  const { limit, selectedOrderID } = useOrdersContext();

  const orders = useMemo(() => {
    const filterCondition = limit ? (order: ParsedOrder) => order?.ui.totalChunks === 1 : (order: ParsedOrder) => (order?.ui.totalChunks || 0) > 1;
    const _orders = _.filter(_.flatMap(data), (it: ParsedOrder) => it?.ui.status !== Status.Expired);
    return _.groupBy(_.filter(_orders, filterCondition), (order: ParsedOrder) => order?.ui.status);
  }, [dataUpdatedAt, limit]);

  const selectedOrder = useMemo(() => {
    return _.find(_.flatMap(orders), (order: ParsedOrder) => order?.order.id === selectedOrderID) as ParsedOrder | undefined;
  }, [orders, selectedOrderID]);

  return {
    orders,
    selectedOrder,
    isLoading,
  };
};

const ContextWrapper = ({ children, limit, theme }: { children: ReactNode; limit?: boolean; theme: any }) => {
  const [selectedOrderID, setSelectedOrderID] = useState<number | undefined>(undefined);
  const [selectedTab, setSelectedTab] = useState<Status>(Status.Open);

  return <Context.Provider value={{ theme, limit, selectedOrderID, setSelectedOrderID, selectedTab, setSelectedTab }}>{children}</Context.Provider>;
};

export const PangolinOrders = ({ limit, theme }: { limit?: boolean; theme: any }) => {
  const { lib } = store.useTwapStore();

  if (!lib) return null;
  return (
    <OrdersPanel>
      <ContextWrapper limit={limit} theme={theme}>
        <Orders />
      </ContextWrapper>
    </OrdersPanel>
  );
};

function Orders() {
  const { orders, isLoading } = useOrders();
  const { setSelectedOrderID, limit, selectedOrderID, theme } = useOrdersContext();
  const account = useTwapContext().account;
  const mobile = useMobile();
  const limitRef = useRef(limit);
  const accountRef = useRef(account);

  useEffect(() => {
    const flatOrders = _.flatMap(orders) as ParsedOrder[];
    if (!selectedOrderID || limit !== limitRef.current || account !== accountRef.current) {
      flatOrders[0] && setSelectedOrderID(flatOrders[0]?.order.id);
      limitRef.current = limit;
      accountRef.current = account;
    }
  }, [orders, limit, selectedOrderID, account]);

  return (
    <StyledOrders theme={theme}>
      <Header />
      {isLoading ? <OrdersLoader /> : mobile ? <Mobile /> : <Desktop />}
    </StyledOrders>
  );
}

const OrdersLoader = () => {
  return (
    <StyledOrdersLoader>
      <Components.Base.Spinner />
    </StyledOrdersLoader>
  );
};

const StyledOrdersLoader = styled(Styles.StyledRowFlex)({
  marginTop: 50,
  marginBottom: 50,
});

const Desktop = () => {
  return (
    <StyledOrdersFlex>
      <SelectedOrder />
      <DesktopList />
    </StyledOrdersFlex>
  );
};

const Mobile = () => {
  return (
    <StyledOrdersFlex>
      <MobileList />
    </StyledOrdersFlex>
  );
};

const Select = () => {
  const { selectedTab, setSelectedTab, theme } = useOrdersContext();
  const [open, setOpen] = useState(false);
  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <StyledSelect>
        <StyledSelectSelected theme={theme} open={open ? 1 : 0} onClick={() => setOpen(!open)}>
          <Typography>{selectedTab}</Typography>
          <IoIosArrowDown />
        </StyledSelectSelected>
        {open && (
          <StyledSelectList theme={theme}>
            {TABS.map((tab) => {
              return (
                <StyledSelectOption
                  onClick={() => {
                    setSelectedTab(tab);
                    setOpen(false);
                  }}
                  key={tab}
                >
                  {getStatusName(tab)}
                </StyledSelectOption>
              );
            })}
          </StyledSelectList>
        )}
      </StyledSelect>
    </ClickAwayListener>
  );
};

const OrderDetail = ({ label, value, labelTooltip, valueTooltip }: { label: string; labelTooltip?: string; value: ReactNode; valueTooltip?: string }) => {
  const { theme } = useOrdersContext();
  return (
    <StyledOrderDetail>
      <StyledOrderDetailLabel theme={theme} tooltipText={labelTooltip}>
        {label}
      </StyledOrderDetailLabel>
      <StyledOrderDetailValue>
        <Components.Base.Tooltip text={valueTooltip}>{value}</Components.Base.Tooltip>
      </StyledOrderDetailValue>
    </StyledOrderDetail>
  );
};

const SrcTokenAmount = ({ orderUI }: { orderUI: OrderUI }) => {
  const amount = hooks.useFormatNumber({ value: orderUI?.ui.srcAmountUi });

  return (
    <OrderDetail
      label="Input Amount"
      value={
        <Styles.StyledRowFlex justifyContent="flex-start">
          <Styles.StyledOneLineText>{amount}</Styles.StyledOneLineText>
          <Components.Base.TokenLogo logo={orderUI?.ui.srcToken?.logoUrl} />
        </Styles.StyledRowFlex>
      }
    />
  );
};

const Progress = ({ orderUI }: { orderUI: OrderUI }) => {
  const { limit } = useOrdersContext();

  if (limit) return null;
  return <OrderDetail label="Progress" value={<Typography>{`${orderUI?.ui.progress}%`}</Typography>} />;
};

const DstTokenAmount = ({ orderUI }: { orderUI?: OrderUI }) => {
  const { data } = hooks.useOrderPastEvents(orderUI!, true);
  const amount = hooks.useFormatNumber({ value: data?.dstAmountOut });

  return (
    <OrderDetail
      label="Output Amount filled"
      value={
        <Styles.StyledRowFlex justifyContent="flex-start">
          {!data ? <StyledDstAmountLoader /> : <Styles.StyledOneLineText>{amount}</Styles.StyledOneLineText>}
          <Components.Base.TokenLogo logo={orderUI?.ui.dstToken?.logoUrl} />
        </Styles.StyledRowFlex>
      }
    />
  );
};

const MinReceivedPerTrade = ({ orderUI }: { orderUI?: OrderUI }) => {
  const { translations } = useTwapContext();
  const amount = hooks.useFormatNumber({ value: orderUI?.ui.dstMinAmountOutUsdUi });
  const tooltip = hooks.useFormatNumber({ value: orderUI?.ui.dstMinAmountOutUsdUi, decimalScale: 18 });
  const { limit } = useOrdersContext();

  if (limit || orderUI?.ui.isMarketOrder) return null;
  return (
    <OrderDetail
      valueTooltip={tooltip}
      labelTooltip={translations.confirmationMinDstAmountTootipLimit}
      label={translations.minReceivedPerTrade}
      value={<Styles.StyledOneLineText>{amount}</Styles.StyledOneLineText>}
    />
  );
};

const TradeSize = ({ orderUI }: { orderUI?: OrderUI }) => {
  const { translations } = useTwapContext();
  const amount = hooks.useFormatNumber({ value: orderUI?.ui.srcChunkAmountUi });
  const tooltip = hooks.useFormatNumber({ value: orderUI?.ui.srcChunkAmountUi, decimalScale: 18 });
  const { limit } = useOrdersContext();

  if (limit) return null;
  return (
    <OrderDetail
      value={
        <Styles.StyledRowFlex justifyContent="flex-start">
          <Styles.StyledOneLineText>{amount}</Styles.StyledOneLineText>
          <Components.Base.TokenLogo logo={orderUI?.ui.srcToken?.logoUrl} />
        </Styles.StyledRowFlex>
      }
      valueTooltip={tooltip}
      label={translations.tradeSize}
      labelTooltip={translations.tradeSizeTooltip}
    />
  );
};

const OrderStatus = ({ orderUI }: { orderUI: OrderUI }) => {
  return <OrderDetail label="Status" value={getStatusName(orderUI?.ui.status)} />;
};

const TotalTrades = ({ orderUI }: { orderUI: OrderUI }) => {
  const { translations } = useTwapContext();
  const { limit } = useOrdersContext();

  const amount = hooks.useFormatNumber({ value: orderUI?.ui.totalChunks });

  if (limit) return null;
  return <OrderDetail labelTooltip={translations.totalTradesTooltip} label={translations.totalTrades} value={<Styles.StyledOneLineText>{amount}</Styles.StyledOneLineText>} />;
};

const TradeInterval = ({ orderUI }: { orderUI: OrderUI }) => {
  const { translations } = useTwapContext();
  const minimumDelayMinutes = store.useTwapStore((state) => state.getMinimumDelayMinutes());
  const { limit } = useOrdersContext();

  if (limit || !orderUI) return null;
  return (
    <OrderDetail
      labelTooltip={translations.tradeIntervalTootlip.replace("{{minutes}}", minimumDelayMinutes.toString())}
      label={translations.tradeInterval}
      value={<Typography>{fillDelayText(orderUI!.ui.fillDelay, translations)}</Typography>}
    />
  );
};

const Deadline = ({ orderUI }: { orderUI: OrderUI }) => {
  const { translations } = useTwapContext();
  const { limit } = useOrdersContext();

  if (limit) return null;
  return <OrderDetail labelTooltip={translations.maxDurationTooltip} label={translations.deadline} value={<Typography>{orderUI?.ui.deadlineUi}</Typography>} />;
};

const CancelOrder = ({ className = "", orderUI }: { className?: string; orderUI?: OrderUI }) => {
  if (orderUI?.ui.status !== Status.Open) return null;
  return <StyledCancelButton className={className} orderId={orderUI!.order.id} />;
};

const Header = () => {
  const { limit } = useOrdersContext();
  const mobile = useMobile();
  return (
    <StyledHeader>
      <StyledHeaderTitle>{limit ? "Limit Orders" : "TWAP Orders"}</StyledHeaderTitle>
      {mobile ? <Select /> : <Tabs />}
    </StyledHeader>
  );
};

const SelectedOrder = () => {
  const { selectedOrder } = useOrders();
  const orderUI = hooks.useParseOrderUi(selectedOrder);
  const { theme } = useOrdersContext();
  if (!orderUI) return null;
  return (
    <StyledSelectedOrder>
      <StyledOrderHeader gap={53}>
        <StyledDestopPairLogos orderUI={orderUI} />
        <StyledOrderSymbols>
          <StyledOrderSymbolsTop>
            {orderUI.ui.srcToken?.symbol}/{orderUI.ui.dstToken?.symbol}
          </StyledOrderSymbolsTop>
          <StyledOrderSymbolsBottom theme={theme}> Buy {orderUI.ui.dstToken?.symbol}</StyledOrderSymbolsBottom>
        </StyledOrderSymbols>
      </StyledOrderHeader>
      <OrderDetails orderUI={orderUI} />
      <CancelOrder orderUI={orderUI} />
    </StyledSelectedOrder>
  );
};

const PairLogos = ({ orderUI, className = "" }: { orderUI: OrderUI; className?: string }) => {
  return (
    <StyledPairLogos className={className}>
      <Components.Base.TokenLogo className="src" logo={orderUI?.ui.srcToken?.logoUrl} />
      <Components.Base.TokenLogo className="dst" logo={orderUI?.ui.dstToken?.logoUrl} />
    </StyledPairLogos>
  );
};

interface ISelectedOrderContext {
  orderUI: OrderUI;
}
const useSelectedOrderContext = () => useContext(SelectedOrderContext);

const SelectedOrderContext = createContext<ISelectedOrderContext>({} as ISelectedOrderContext);
const OrderDetails = ({ orderUI, className = "" }: { orderUI: OrderUI; className?: string }) => {
  return (
    <SelectedOrderContext.Provider value={{ orderUI }}>
      <StyledDetails className={className}>
        <SrcTokenAmount orderUI={orderUI} />
        <DstTokenAmount orderUI={orderUI} />
        <MinReceivedPerTrade orderUI={orderUI} />
        <TradeSize orderUI={orderUI} />
        <TotalTrades orderUI={orderUI} />
        <TradeInterval orderUI={orderUI} />
        <Deadline orderUI={orderUI} />
        <Progress orderUI={orderUI} />
        <OrderStatus orderUI={orderUI} />
      </StyledDetails>
    </SelectedOrderContext.Provider>
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
const StyledOrderSymbolsBottom = styled(Typography)(({ theme }) => ({
  fontSize: 12,
  color: parseTheme(theme).isDarkMode ? "#E5E5E5" : "black",
}));
const StyledPairLogos = styled(Box)({
  position: "relative",
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
  "@media(max-width:400px)": {
    fontSize: 16,
  },
});
const StyledHeader = styled(Styles.StyledRowFlex)({
  gap: 20,
  justifyContent: "space-between",
});

const StyledOrders = styled(Styles.StyledColumnFlex)(({ theme }) => ({
  width: "100%",
  color: parseTheme(theme).isDarkMode ? "white" : "black",
  padding: 20,
  background: parseTheme(theme).containerBackground,
  borderRadius: 10,
}));

const DesktopList = () => {
  const { selectedTab } = useOrdersContext();
  const { orders } = useOrders();

  const mobile = useMobile();
  const selectedOrders = orders[selectedTab];

  return (
    <StyledList mobile={mobile ? 1 : 0}>
      {!_.size(selectedOrders) ? (
        <StyledEmptyList>
          No <span>{getStatusName(selectedTab)}</span> Order
        </StyledEmptyList>
      ) : (
        selectedOrders?.map((o) => {
          return <DesktopListItem key={o.order.id} order={o} />;
        })
      )}
    </StyledList>
  );
};

const MobileList = () => {
  const { selectedTab } = useOrdersContext();
  const { orders } = useOrders();

  const selectedOrders = orders[selectedTab];

  return (
    <StyledMobileList>
      {!_.size(selectedOrders) ? (
        <StyledEmptyList>
          No <span>{getStatusName(selectedTab)}</span> Order
        </StyledEmptyList>
      ) : (
        selectedOrders?.map((o) => {
          return <MobileListItem key={o.order.id} order={o} />;
        })
      )}
    </StyledMobileList>
  );
};

const StyledMobileList = styled(Styles.StyledColumnFlex)({
  gap: 0,
});

const MobileListItem = ({ order }: { order: ParsedOrder }) => {
  const { selectedOrderID, setSelectedOrderID, theme } = useOrdersContext();
  const isSelected = selectedOrderID === order?.order.id;
  const orderUI = hooks.useParseOrderUi(order);
  return (
    <StyledMobileListItem theme={theme} selected={isSelected ? 1 : 0} gap={20} onClick={() => order?.order.id && setSelectedOrderID(order.order.id)}>
      <StyledMobileListTopFlex>
        <Styles.StyledColumnFlex gap={3} style={{ width: "auto" }}>
          <Styles.StyledRowFlex justifyContent="flex-start" gap={23}>
            <StyledMobilePairLogos orderUI={orderUI} />
            <StyledMobilePairSymbols orderUI={orderUI} />
          </Styles.StyledRowFlex>
          <StyledMobileBuyText orderUI={orderUI} />
        </Styles.StyledColumnFlex>
        <StyledMobileAmounts orderUI={orderUI} />
      </StyledMobileListTopFlex>
      {isSelected && <MobileSelectedOrder order={order} />}
    </StyledMobileListItem>
  );
};

const MobileSelectedOrder = ({ order }: { order?: ParsedOrder }) => {
  const orderUI = hooks.useParseOrderUi(order);
  return (
    <>
      <OrderDetails orderUI={orderUI} /> <CancelOrder orderUI={orderUI} />
    </>
  );
};

const StyledMobileListTopFlex = styled(Styles.StyledRowFlex)({
  justifyContent: "space-between",
  alignItems: "flex-start",
  "@media(max-width:400px)": {
    flexDirection: "column",
  },
});

const BuyText = ({ orderUI, className = "" }: { orderUI: OrderUI; className?: string }) => {
  return (
    <StyledBuyText className={className}>
      Buy {orderUI?.ui.dstToken?.symbol} with {orderUI?.ui.srcToken?.symbol}{" "}
    </StyledBuyText>
  );
};

const PairSymbols = ({ orderUI, className = "" }: { orderUI: OrderUI; className?: string }) => {
  return (
    <StyledPairSymbols className={className}>
      {orderUI?.ui.srcToken?.symbol}/{orderUI?.ui.dstToken?.symbol}
    </StyledPairSymbols>
  );
};

const Amounts = ({ orderUI, className = "" }: { orderUI: OrderUI; className?: string }) => {
  const { data } = hooks.useOrderPastEvents(orderUI, true);
  const outAmount = hooks.useFormatNumber({ value: data?.dstAmountOut, decimalScale });
  const srcAmount = hooks.useFormatNumber({ value: orderUI?.ui.srcAmountUi, decimalScale });
  return (
    <StyledAmounts className={className}>
      {!data ? (
        <Components.Base.Loader width={60} />
      ) : (
        <Typography>
          {srcAmount} / {outAmount}
        </Typography>
      )}
    </StyledAmounts>
  );
};

const StyledAmounts = styled(Styles.StyledRowFlex)({
  width: "auto",
  p: {
    fontWeight: 500,
  },
});

const StyledMobileListItem = styled(Styles.StyledColumnFlex)<{ selected: number }>(({ selected, theme }) => {
  const bg = parseTheme(theme).isDarkMode ? "#1C1C1C" : "#E5E5E5";
  return {
    background: selected ? bg : "transparent",
    padding: 10,
    borderBottom: "1px solid #282828",
  };
});

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
const DesktopListItem = ({ order }: { order: ParsedOrder }) => {
  const { setSelectedOrderID, selectedOrderID, theme } = useOrdersContext();
  const orderUI = hooks.useParseOrderUi(order);

  return (
    <StyledListItem theme={theme} selected={orderUI?.order.id === selectedOrderID ? 1 : 0} onClick={() => orderUI && setSelectedOrderID(orderUI.order?.id)}>
      <BuyText orderUI={orderUI} />
      <Styles.StyledColumnFlex style={{ width: "auto", alignItems: "flex-end", gap: 2 }}>
        <Amounts orderUI={orderUI} />
        <StyledListItemStatus>{getStatusName(order?.ui.status)}</StyledListItemStatus>
      </Styles.StyledColumnFlex>
    </StyledListItem>
  );
};

const Tabs = () => {
  const { selectedTab, setSelectedTab } = useOrdersContext();
  const { theme } = useOrdersContext();
  return (
    <StyledTabs theme={theme}>
      {TABS.map((it) => {
        return (
          <StyledTab theme={theme} onClick={() => setSelectedTab(it)} selected={selectedTab === it ? 1 : 0} key={it}>
            {getStatusName(it)}
          </StyledTab>
        );
      })}
    </StyledTabs>
  );
};

const StyledTab = styled("button")<{ selected: number }>(({ selected, theme }) => {
  const isDarkMode = parseTheme(theme).isDarkMode;
  const bg = isDarkMode ? "#111111" : "white";
  return {
    textTransform: "uppercase",
    background: selected ? bg : "transparent",
    border: "none",
    flex: 1,
    height: "100%",
    color: isDarkMode ? "#E5E5E5" : "black",
    borderRadius: 5,
    padding: "0px 12px",
    cursor: "pointer",
    fontSize: 13,
    transition: "background 0.2s",
  };
});
const StyledTabs = styled(Styles.StyledRowFlex)(({ theme }) => ({
  background: parseTheme(theme).isDarkMode ? "#717171" : "#E5E5E5",
  borderRadius: 8,
  height: 34,
  padding: 2,
  width: "auto",
}));

const getStatusName = (status?: Status) => {
  if (!status) return "";
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

const StyledListItem = styled(Styles.StyledRowFlex)<{ selected: number }>(({ selected, theme }) => {
  const isDarkMode = parseTheme(theme).isDarkMode;
  const bg = isDarkMode ? "#1C1C1C" : "#E5E5E5";
  return {
    padding: "5px 14px",
    cursor: "pointer",
    minHeight: 64,
    justifyContent: "space-between",
    borderBottom: "1px solid #282828",
    background: selected ? bg : "transparent",
    alignItems: "center",
    p: {
      fontSize: 12,
      fontWeight: 500,
    },
  };
});

const StyledList = styled(Styles.StyledColumnFlex)<{ mobile: number }>(({ mobile }) => ({
  width: mobile ? "100%" : "50%",
  gap: 0,
}));

const StyledCancelButton = styled(CancelOrderButton)({
  background: "#717171",
  margin: 0,
  minHeight: 34,
  padding: "0 20px",
  marginLeft: "auto",
  marginRight: "auto",
  marginTop: 20,
  "*": {
    color: "white",
    fontSize: 14,
  },
});

const StyledOrderDetail = styled(Styles.StyledColumnFlex)({
  gap: 5,
  width: "calc(50% - 10px)",
  ".twap-token-logo": {
    minWidth: 22,
    minHeight: 22,
    width: 22,
    height: 22,
  },
  "@media(max-width:400px)": {
    width: "100%",
  },
});

const StyledOrderDetailLabel = styled(Components.Base.Label)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 500,
  color: parseTheme(theme).isDarkMode ? "#C3C5CB" : "black",
}));

const StyledOrderDetailValue = styled("div")({
  width: "100%",
  fontSize: 14,
  fontWeight: 500,
  "*": {
    fontSize: "inherit",
    fontWeight: "inherit",
  },
});

const StyledSelectSelected = styled(Styles.StyledRowFlex)<{ open: number }>(({ open, theme }) => {
  const isDarkMode = parseTheme(theme).isDarkMode;
  return {
    background: isDarkMode ? "#212427" : "white",
    border: open ? `1px solid #FEC802` : `1px solid ${isDarkMode ? "white" : "hsl(0, 0%, 80%)"}`,
    borderRadius: 4,
    padding: "6px 10px 6px 10px",
    cursor: "pointer",
    p: {
      fontSize: 14,
    },
    "&:hover": {
      border: `1px solid #FEC802`,
    },
  };
});

const StyledSelect = styled(Box)({
  position: "relative",
});

const StyledSelectList = styled("ul")(({ theme }) => ({
  position: "absolute",
  listStyleType: "none",
  width: "auto",
  left: 0,
  padding: 0,
  background: parseTheme(theme).isDarkMode ? "#212427" : "white",
  top: "calc(100% + 10px)",
  margin: 0,
  minWidth: "100%",
  border: `1px solid ${parseTheme(theme).isDarkMode ? "white" : "hsl(0, 0%, 80%)"}`,
}));

const StyledSelectOption = styled("li")({
  padding: "4px 10px",
  fontSize: 14,
  cursor: "pointer",
});

const StyledOrdersFlex = styled(Styles.StyledRowFlex)({
  gap: 20,
  alignItems: "flex-start",
});

const StyledDstAmountLoader = styled(Components.Base.Loader)({
  flex: 1,
  maxWidth: 80,
});

const StyledDestopPairLogos = styled(PairLogos)({
  ".twap-token-logo": {
    minWidth: 44,
    minHeight: 44,
    width: 44,
    height: 44,
  },
  ".dst": {
    position: "absolute",
    left: 40,
  },
});

const StyledMobilePairLogos = styled(PairLogos)({
  ".twap-token-logo": {
    width: 24,
    height: 24,
  },
  ".dst": {
    position: "absolute",
    left: 20,
  },
});
const StyledPairSymbols = styled(Typography)({
  fontWeight: 500,
});

const StyledMobilePairSymbols = styled(PairSymbols)({
  fontSize: 14,
});

const StyledBuyText = styled(Typography)({
  fontWeight: 500,
});

const StyledMobileBuyText = styled(BuyText)({
  fontSize: 14,
});

const StyledMobileAmounts = styled(Amounts)({
  p: {
    fontSize: 14,
  },
});
