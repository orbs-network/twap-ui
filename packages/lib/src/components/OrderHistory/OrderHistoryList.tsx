import { styled } from "styled-components";
import { HiArrowRight } from "@react-icons/all-files/hi/HiArrowRight";
import { useCallback, useEffect, useRef } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { VariableSizeList } from "react-window";
import { useTwapContext } from "../../context/context";
import { useFormatNumberV2 } from "../../hooks";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { LinearProgress, Loader, TokenLogo } from "../base";
import { useOrderHistoryContext, useTokenFromList } from "./context";
import * as React from "react";
import { size } from "../../utils";
import { Order } from "@orbs-network/twap-sdk";
import moment from "moment";

export const OrderHistoryList = () => {
  const { selectOrder, orders, selectedOrderId, isLoading } = useOrderHistoryContext();
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

  if (!size(orders)) {
    return <EmptyList />;
  }

  return (
    <ListContainer style={{ opacity: selectedOrderId ? 0 : 1, pointerEvents: selectedOrderId ? "none" : "all" }} className="twap-orders-list">
      <AutoSizer>
        {({ height, width }: any) => (
          <VariableSizeList ref={listRef} height={height} itemCount={size(orders)} itemSize={getSize} width={width} itemData={{ setSize, selectOrder, orders }}>
            {Comp}
          </VariableSizeList>
        )}
      </AutoSizer>
    </ListContainer>
  );
};

const Comp = (props: any) => {
  const { style, data, index } = props;

  const { selectOrder, setSize, orders } = data;
  return (
    <div style={style}>
      <ListOrder onSelect={selectOrder} setSize={setSize} index={index} order={orders[index]} />
    </div>
  );
};

const EmptyList = () => {
  const tab = useOrderHistoryContext().selectedTab;

  const name = React.useMemo(() => {
    if (tab?.name === "All") {
      return "";
    }
    return tab?.name;
  }, [tab]);

  return (
    <StyledEmpty>
      <StyledText>No {name} Orders</StyledText>
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

const StyledEmpty = styled(StyledColumnFlex)({
  alignItems: "center",
  justifyContent: "flex-start",
  paddingTop: 30,
  paddingBottom: 30,
  fontSize: 18,
  fontWeight: 500,
});

const ListOrder = React.memo(
  ({ order, index, setSize, onSelect }: { order?: Order; index: number; setSize: (index: number, value: number) => void; onSelect: (id?: number) => void }) => {
    const root = useRef<any>();
    useEffect(() => {
      setSize(index, root.current?.getBoundingClientRect().height);
    }, [index]);

    if (!order) return null;
    

    return (
      <Wrapper className="twap-order" ref={root} onClick={() => onSelect(order?.id)}>
        <StyledListOrder className="twap-order-container">
          <ListItemHeader order={order} />
          <LinearProgressWithLabel value={order.progress || 0} />

          <StyledRowFlex className="twap-order-tokens">
            <TokenDisplay address={order.srcTokenAddress} />
            <HiArrowRight className="twap-order-tokens-arrow" />
            <TokenDisplay address={order.dstTokenAddress} />
          </StyledRowFlex>
        </StyledListOrder>
      </Wrapper>
    );
  },
);

const ListItemHeader = ({ order }: { order: Order }) => {
  const t = useTwapContext().translations;
  const status = order && order.status;

  const formattedDate = React.useMemo(() => {
    return moment(order.createdAt).format("DD/MM/YYYY HH:mm");
  }, [order.createdAt]);

  return (
    <StyledHeader className="twap-order-header">
      <StyledText className="twap-order-header-text">
        {" "}
        #{order?.id} {order?.isMarketOrder ? t.twapMarket : t.limit} <span>{`(${formattedDate})`}</span>
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
  "@media(max-width: 1000px)": {
    fontSize: 12,
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

const TokenDisplay = ({ address, amount }: { address?: string; amount?: string }) => {
  const token = useTokenFromList(address);
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
  "@media(max-width: 1000px)": {
    ".twap-order-token-text": {
      fontSize: 12,
    },
  },
});

function LinearProgressWithLabel(props: { value: number }) {
  return (
    <StyledProgress className="twap-order-token-progress">
      <div style={{ width: "100%" }}>
        <LinearProgress variant="determinate" {...props} />
      </div>
      <div className="twap-order-token-progress-label">
        <StyledText>{`${Math.round(props.value)}%`}</StyledText>
      </div>
    </StyledProgress>
  );
}

const StyledProgress = styled(StyledRowFlex)({
  width: "100%",
  gap: 0,
  p: {
    fontSize: 12,
    opacity: 0.8,
    textAlign: "right",
  },
  ".twap-order-token-progress-label": {
    minWidth: 40,
  },
});
