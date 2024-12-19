import { styled } from "styled-components";
import { HiArrowRight } from "@react-icons/all-files/hi/HiArrowRight";
import { useTwapContext } from "../../context/context";
import { useFormatNumberV2 } from "../../hooks/hooks";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { LinearProgress, Loader, TokenLogo } from "../base";
import { useOrderHistoryContext, useTokenFromList } from "./context";
import * as React from "react";
import { size } from "../../utils";
import { Order } from "@orbs-network/twap-sdk";
import moment from "moment";
import { Virtuoso } from "react-virtuoso";

export const OrderHistoryList = () => {
  const { selectOrder, orders, isLoading, selectedOrderId } = useOrderHistoryContext();

  if (selectedOrderId) return null;

  if (isLoading) {
    return <StyledLoader height={120} />;
  }

  if (!size(orders)) {
    return <EmptyList />;
  }

  return (
    <Virtuoso
      totalCount={size(orders)}
      overscan={10}
      className="twap-orders-list"
      style={{ height: "100%", width: "100%" }}
      itemContent={(index) => {
        const order = orders[index];
        return <ListOrder selectOrder={selectOrder} order={order} />;
      }}
    />
  );
};

const ListOrder = ({ order, selectOrder }: { order: Order; selectOrder: (id?: number) => void }) => {
  return (
    <StyledListOrder className="twap-order" onClick={() => selectOrder(order?.id)}>
      <ListItemHeader order={order} />
      <LinearProgressWithLabel value={order.progress || 0} />
      <StyledRowFlex className="twap-order-tokens">
        <TokenDisplay address={order.srcTokenAddress} />
        <HiArrowRight className="twap-order-tokens-arrow" />
        <TokenDisplay address={order.dstTokenAddress} />
      </StyledRowFlex>
    </StyledListOrder>
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
      {!token ? (
        <StyledTokenDisplayLoader />
      ) : (
        <>
          <TokenLogo logo={token?.logoUrl} />
          <StyledText className="twap-order-token-text">
            {_amount} {token?.symbol}
          </StyledText>
        </>
      )}
    </StyledTokenDisplay>
  );
};

const StyledTokenDisplayLoader = styled(Loader)({
  borderRadius: "50%",
  width: 20,
  height: 20,
});

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
