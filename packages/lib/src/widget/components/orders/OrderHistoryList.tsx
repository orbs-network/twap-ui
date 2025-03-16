import { styled } from "styled-components";
import { HiArrowRight } from "@react-icons/all-files/hi/HiArrowRight";
import { Order, OrderStatus } from "@orbs-network/twap-sdk";
import { useOrderHistoryContext } from "./context";
import * as React from "react";
import moment from "moment";
import { Loader } from "../../../components/base/Loader";
import TokenLogo from "../../../components/base/TokenLogo";
import { StyledRowFlex, StyledText, StyledColumnFlex } from "../../../styles";
import { useFormatNumber } from "../../../hooks/useFormatNumber";
import { useTwapContext } from "../../../context";
import { OrderHistoryMenu } from "./OrderHistorySelect";
import { useOrderName } from "../../../hooks/logic-hooks";

const ListLoader = () => {
  return (
    <StyledColumnFlex className="twap-orders-list-loader">
      <Loader />
    </StyledColumnFlex>
  );
};

export const OrderHistoryList = () => {
  const { selectOrder, selectedOrders, isLoading, selectedOrderId } = useOrderHistoryContext();

  if (selectedOrderId !== undefined) return null;

  return (
    <>
      <OrderHistoryMenu />
      {isLoading ? (
        <ListLoader />
      ) : !selectedOrders.length ? (
        <EmptyList />
      ) : (
        <div className="twap-order-history-list">
          {selectedOrders.map((order) => {
            return <ListOrder key={order.id} selectOrder={selectOrder} order={order} />;
          })}
        </div>
      )}
    </>
  );
};

const ListOrder = ({ order, selectOrder }: { order: Order; selectOrder: (id?: number) => void }) => {
  const { components } = useTwapContext();

  if (components.OrderHistoryListOrder) {
    return <components.OrderHistoryListOrder order={order} selectOrder={selectOrder} />;
  }

  return (
    <div className={`twap-order-history-order twap-order-history-order-${order.status}`} onClick={() => selectOrder(order?.id)}>
      <ListItemHeader order={order} />
      <LinearProgressWithLabel value={order.progress || 0} />
      <div className="twap-order-history-order-tokens">
        <TokenDisplay address={order.srcTokenAddress} />
        <HiArrowRight />
        <TokenDisplay address={order.dstTokenAddress} />
      </div>
    </div>
  );
};

const EmptyList = () => {
  const status = useOrderHistoryContext().status;
  const t = useTwapContext().translations;
  const name = React.useMemo(() => {
    if (status === OrderStatus.All) {
      return "";
    }
    return status;
  }, [status]);

  return (
    <StyledEmpty className="twap-order-history-list-empty">
      <StyledText>{t.noOrders.replace("{status}", name)}</StyledText>
    </StyledEmpty>
  );
};

const StyledEmpty = styled(StyledColumnFlex)({
  alignItems: "center",
  justifyContent: "flex-start",
  paddingTop: 30,
  paddingBottom: 30,
});

const ListItemHeader = ({ order }: { order: Order }) => {
  const status = order && order.status;
  const name = useOrderName(order.isMarketOrder, order.totalChunks);
  const formattedDate = React.useMemo(() => {
    return moment(order.createdAt).format("DD/MM/YYYY HH:mm");
  }, [order.createdAt]);

  return (
    <StyledHeader className="twap-order-header">
      <StyledText className="twap-order-header-text">
        #{order?.id} {name} <span>{`(${formattedDate})`}</span>
      </StyledText>
      <StyledText className="twap-order-header-status">{status}</StyledText>
    </StyledHeader>
  );
};

const StyledHeader = styled(StyledRowFlex)({
  justifyContent: "space-between",
});

const StyledListOrder = styled(StyledColumnFlex)({});

const TokenDisplay = ({ address, amount }: { address?: string; amount?: string }) => {
  const { useToken, components } = useTwapContext();
  const token = useToken?.(address);

  const _amount = useFormatNumber({ value: amount, decimalScale: 4 });

  return (
    <StyledTokenDisplay className="twap-order-token">
      {!token ? (
        <StyledTokenDisplayLoader />
      ) : (
        <>
          {components.TokenLogo ? <components.TokenLogo token={token} /> : <TokenLogo logo={token?.logoUrl} />}
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
});

function LinearProgressWithLabel(props: { value: number }) {
  return (
    <StyledProgress className="twap-order-token-progress">
      <ProgressBar value={props.value} />
      <div className="twap-order-token-progress-label">
        <StyledText>{`${Math.round(props.value)}%`}</StyledText>
      </div>
    </StyledProgress>
  );
}

const ProgressBar = ({ value }: { value: number }) => {
  return (
    <StyledProgressBar className="twap-order-token-progress-bar">
      <div className="twap-order-token-progress-bar-filled" style={{ width: `${value}%` }} />
    </StyledProgressBar>
  );
};

const StyledProgressBar = styled("div")({
  flex: 1,
});

const StyledProgress = styled(StyledRowFlex)({
  width: "100%",
  gap: 0,
});
