import { styled } from "@mui/material";
import { HiArrowRight } from "@react-icons/all-files/hi/HiArrowRight";
import _ from "lodash";
import { useCallback, useEffect, useRef } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { VariableSizeList } from "react-window";
import { useTwapContext } from "../../context";
import { useParseOrderUi, useFormatNumberV2 } from "../../hooks";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { ParsedOrder, Token, Translations } from "../../types";
import { Loader, TokenLogo } from "../base";
import { useOrderHistoryContext } from "./context";

export function List() {
  const { selectOrder, orders, order, isLoading, selectedTab } = useOrderHistoryContext();
  const sizeMap = useRef({} as any);
  const listRef = useRef<any>();
  const setSize = useCallback((index: number, size: number) => {
    sizeMap.current = { ...sizeMap.current, [index]: size };
    listRef.current.resetAfterIndex(0);
  }, []);
  const getSize = useCallback((index: number): number => {
    return sizeMap.current[index] || 50;
  }, []);

  if (isLoading) {
    return <StyledLoader height={120} />;
  }

  if (!_.size(orders)) {
    return <EmptyList />;
  }

  return (
    <ListContainer style={{ opacity: order ? 0 : 1, pointerEvents: order ? "none" : "all" }}>
      <AutoSizer>
        {({ height, width }: any) => (
          <VariableSizeList ref={listRef} height={height} itemCount={_.size(orders)} itemSize={getSize} width={width} itemData={{ setSize }}>
            {({ index, style }) => (
              <div style={style}>
                <ListOrder onSelect={selectOrder} setSize={setSize} index={index} order={orders[index]} showStatus={!selectedTab?.key} />
              </div>
            )}
          </VariableSizeList>
        )}
      </AutoSizer>
    </ListContainer>
  );
}

const EmptyList = () => {
  const tab = useOrderHistoryContext().selectedTab;
  return (
    <StyledEmpty>
      <StyledText>No {tab?.name} Orders</StyledText>
    </StyledEmpty>
  );
};

const ListContainer = styled(StyledColumnFlex)({
  width: "100%",
  height: "calc(100% - 50px)",
  top: 50,
  position: "absolute",
  zIndex: 1,
  "*::-webkit-scrollbar": {
    display: "none",
  },
});
const StyledLoader = styled(Loader)({
  borderRadius: 15,
  transformOrigin: "top",
});

const StyledEmpty = styled(ListContainer)({
  alignItems: "center",
  justifyContent: "flex-start",
  paddingTop: 50,
  fontSize: 20,
  fontWeight: 500,
});

export function ListOrder({
  order: parsedOrder,
  index,
  setSize,
  onSelect,
  showStatus,
}: {
  order?: ParsedOrder;
  index: number;
  setSize: (index: number, value: number) => void;
  onSelect: (o?: ParsedOrder) => void;
  showStatus?: boolean;
}) {
  const order = useParseOrderUi(parsedOrder);
  const root = useRef<any>();
  useEffect(() => {
    setSize(index, root.current.getBoundingClientRect().height);
  }, [index]);

  if (!order) return null;

  return (
    <Wrapper className="twap-order" ref={root} onClick={() => onSelect(parsedOrder)}>
      <StyledListOrder className="twap-order-container">
        <ListItemHeader order={order} showStatus={showStatus} />
        <StyledRowFlex className="twap-order-tokens">
          <TokenDisplay token={order.ui.srcToken} amount={order.ui.srcAmountUi} />
          <HiArrowRight className="twap-order-tokens-arrow" />
          <TokenDisplay token={order.ui.dstToken} />
        </StyledRowFlex>
      </StyledListOrder>
    </Wrapper>
  );
}

const ListItemHeader = ({ order, showStatus }: { order: ReturnType<typeof useParseOrderUi>; showStatus?: boolean }) => {
  const t = useTwapContext().translations;
  const status = order && t[order.ui.status as keyof Translations];

  return (
    <StyledHeader className="twap-order-header">
      <StyledText className="twap-order-header-text">
        {" "}
        #{order?.order.id} {order?.ui.isMarketOrder ? t.market : t.limit} <span>{`(${order?.ui.createdAtUi})`}</span>
      </StyledText>
      <StyledText className="twap-order-header-status">{status}</StyledText>
    </StyledHeader>
  );
};

const StyledHeader = styled(StyledRowFlex)({
  justifyContent: "space-between",
  fontSize: 14,
  ".twap-order-header-text": {
    textTransform: "capitalize",
    span: {
      fontSize: 12,
      opacity: 0.7,
    },
  },
  ".twap-order-header-status": {
    fontSize: 12,
    opacity: 0.7,
  },
});

const Wrapper = styled(StyledColumnFlex)({
  padding: "0px 0px 10px 0px",
});

const StyledListOrder = styled(StyledColumnFlex)({
  borderRadius: 15,
  padding: 10,
  gap: 5,
  cursor: "pointer",
  ".twap-order-tokens": {
    justifyContent: "flex-start",
  },
  ".twap-order-tokens-arrow": {
    width: 16,
    height: 16,
  },
  ".twap-token-logo": {
    width: 16,
    height: 16,
  },
});

const TokenDisplay = ({ token, amount }: { token?: Token; amount?: string }) => {
  const _amount = useFormatNumberV2({ value: amount, decimalScale: 4 });
  return (
    <StyledTokenDisplay className="twap-order-token">
      <TokenLogo logo={token?.logoUrl} />
      <StyledText className="twap-order-token-text">
        {_amount} {token?.symbol}
      </StyledText>
    </StyledTokenDisplay>
  );
};

const StyledTokenDisplay = styled(StyledRowFlex)({
  width: "auto",
  ".twap-order-token-text": {
    fontSize: 14,
    opacity: 0.8,
  },
});
