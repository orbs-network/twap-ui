import { styled } from "styled-components";
import { HiArrowRight } from "@react-icons/all-files/hi/HiArrowRight";
import { Order } from "@orbs-network/twap-sdk";
import { useOrderHistoryContext } from "./context";
import * as React from "react";
import moment from "moment";
import { Virtuoso } from "react-virtuoso";
import { Loader, TokenLogo } from "../../../components/base";
import { StyledRowFlex, StyledText, StyledColumnFlex } from "../../../styles";
import { size } from "../../../utils";
import { useWidgetContext } from "../../widget-context";
import { useFormatNumber } from "../../../hooks/useFormatNumber";
import { useGetOrderNameCallback } from "../../../hooks/useOrderName";

const ListLoader = () => {
  return (
    <StyledColumnFlex className="twap-orders-list-loader">
      <Loader />
    </StyledColumnFlex>
  );
};

export const OrderHistoryList = () => {
  const { selectOrder, orders, isLoading, selectedOrderId } = useOrderHistoryContext();
  const {
    state: { newOrderLoading },
  } = useWidgetContext();

  if (selectedOrderId) return null;

  if (isLoading) {
    return <ListLoader />;
  }

  if (!size(orders)) {
    return <EmptyList />;
  }

  return (
    <>
      {newOrderLoading && <ListLoader />}
      <Virtuoso
        totalCount={size(orders)}
        overscan={10}
        className="twap-order-history-list"
        style={{ height: "100%", width: "100%" }}
        itemContent={(index) => {
          const order = orders[index];
          return <ListOrder selectOrder={selectOrder} order={order} />;
        }}
      />
    </>
  );
};

const ListOrder = ({ order, selectOrder }: { order: Order; selectOrder: (id?: number) => void }) => {
  return (
    <StyledListOrder className="twap-order-history-order" onClick={() => selectOrder(order?.id)}>
      <ListItemHeader order={order} />
      <LinearProgressWithLabel value={order.progress || 0} />
      <StyledRowFlex className="twap-order-history-order-tokens">
        <TokenDisplay address={order.srcTokenAddress} />
        <HiArrowRight />
        <TokenDisplay address={order.dstTokenAddress} />
      </StyledRowFlex>
    </StyledListOrder>
  );
};

const EmptyList = () => {
  const tab = useOrderHistoryContext().selectedTab;

  const name = React.useMemo(() => {
    if (tab?.name === "all") {
      return "";
    }
    return tab?.name;
  }, [tab]);

  return (
    <StyledEmpty className="twap-order-history-list-empty">
      <StyledText>No {name} Orders</StyledText>
    </StyledEmpty>
  );
};

const StyledEmpty = styled(StyledColumnFlex)({
  alignItems: "center",
  justifyContent: "flex-start",
  paddingTop: 30,
  paddingBottom: 30,
  fontSize: 18,
  fontWeight: 500,
});

const ListItemHeader = ({ order }: { order: Order }) => {
  const t = useWidgetContext().translations;
  const status = order && order.status;
  const getName = useGetOrderNameCallback();
  const formattedDate = React.useMemo(() => {
    return moment(order.createdAt).format("DD/MM/YYYY HH:mm");
  }, [order.createdAt]);

  const name = React.useMemo(() => getName(order.isMarketOrder, order.totalChunks), [order, getName]);

  return (
    <StyledHeader className="twap-order-header">
      <StyledText className="twap-order-header-text">
        {" "}
        #{order?.id} {name} <span>{`(${formattedDate})`}</span>
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

const StyledListOrder = styled(StyledColumnFlex)({
  borderRadius: 15,
  padding: 10,
  gap: 5,
  cursor: "pointer",
  ".twap-order-history-order-tokens": {
    justifyContent: "flex-start",
  },
  ".twap-order-history-order-tokens-arrow": {
    width: 16,
    height: 16,
  },
  ".twap-token-logo": {
    width: 16,
    height: 16,
  },
});

const TokenDisplay = ({ address, amount }: { address?: string; amount?: string }) => {
  const { useToken } = useWidgetContext();
  const token = useToken?.(address);

  const _amount = useFormatNumber({ value: amount, decimalScale: 4 });

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
      <Progress value={props.value} />
      <div className="twap-order-token-progress-label">
        <StyledText>{`${Math.round(props.value)}%`}</StyledText>
      </div>
    </StyledProgress>
  );
}

const Progress = ({ value }: { value: number }) => {
  return (
    <div className="twap-order-token-progress-bar">
      <div className="twap-order-token-progress-bar-filled" style={{ width: `${value}%` }} />
    </div>
  );
};

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
