import { HiArrowRight } from "@react-icons/all-files/hi/HiArrowRight";
import { Order, OrderType } from "@orbs-network/twap-sdk";
import * as React from "react";
import { useTwapContext } from "../../context";
import { OrderHistoryMenu } from "./OrderHistorySelect";
import { useOrderName, useOrders } from "../../hooks/order-hooks";
import { Virtuoso } from "react-virtuoso";
import moment from "moment";
import TokenLogo from "../../components/TokenLogo";
import { useCancelOrder } from "../../hooks/use-cancel-order";
import { FC, ReactNode } from "react";
import { OrderHistoryListOrderProps, OrderHistoryProps, Token, TokenLogoProps, UseToken } from "../../types";
import { useTwapStore } from "../../useTwapStore";
import { useOrderHistoryContext } from "./context";

const ListLoader = () => {
  const { listLoader } = useOrderHistoryContext();
  return <div className="twap-orders__loader">{listLoader || <p>Loading...</p>}</div>;
};

export const OrderHistoryList = () => {
  const selectedOrderID = useTwapStore((s) => s.state.selectedOrderID);
  const status = useTwapStore((s) => s.state.orderHIstoryStatusFilter);
  const updateState = useTwapStore((s) => s.updateState);
  const selectOrder = React.useCallback(
    (id?: string) => {
      updateState({ selectedOrderID: id });
    },
    [updateState],
  );

  const { orders, isLoading } = useOrders();
  const selectedOrders = !orders ? [] : !status ? orders.all : orders[status.toUpperCase() as keyof typeof orders];

  if (selectedOrderID !== undefined) return null;

  return (
    <>
      <OrderHistoryMenu />
      {isLoading ? (
        <ListLoader />
      ) : !selectedOrders.length ? (
        <EmptyList />
      ) : (
        <div className="twap-orders__list">
          <Virtuoso style={{ height: "100%" }} data={selectedOrders} itemContent={(index, order) => <ListOrder key={index} selectOrder={selectOrder} order={order} />} />
        </div>
      )}
    </>
  );
};

const ListOrder = ({ order, selectOrder }: { order: Order; selectOrder: (id?: string) => void }) => {
  const { callback: cancelOrder } = useCancelOrder();
  const { useToken, ListOrder: CustomListOrder } = useOrderHistoryContext();

  const handleCancelOrder = React.useCallback(() => {
    return cancelOrder(order);
  }, [cancelOrder, order]);

  if (CustomListOrder) {
    return <CustomListOrder order={order} selectOrder={selectOrder} cancelOrder={handleCancelOrder} />;
  }

  return (
    <div className={`twap-orders__list-item twap-orders__list-item-${order.status}`} onClick={() => selectOrder(order?.id)}>
      <ListItemHeader order={order} />
      <LinearProgressWithLabel value={order.progress || 0} />
      <div className="twap-orders__list-item-tokens">
        <TokenDisplay address={order.srcTokenAddress} useToken={useToken} />
        <HiArrowRight className="twap-orders__list-item-tokens-arrow" />
        <TokenDisplay address={order.dstTokenAddress} useToken={useToken} />
      </div>
    </div>
  );
};

const EmptyList = () => {
  const status = useTwapStore((s) => s.state.orderHIstoryStatusFilter);
  const t = useTwapContext().translations;
  const name = React.useMemo(() => {
    if (!status) {
      return "";
    }
    return status;
  }, [status]);

  return (
    <div className="twap-orders__list-empty">
      <p>{t.noOrders.replace("{status}", name)}</p>
    </div>
  );
};

const ListItemHeader = ({ order }: { order: Order }) => {
  const status = order && order.status;
  const { dateFormat } = useOrderHistoryContext();
  const name = useOrderName(order.type === OrderType.TWAP_MARKET, order.chunks);
  const formattedDate = React.useMemo(() => {
    if (!order.createdAt) return "";
    if (dateFormat) return dateFormat(order.createdAt);
    return moment(order.createdAt).format("DD/MM/YYYY HH:mm");
  }, [order.createdAt, dateFormat]);

  return (
    <div className="twap-orders__list-item-header">
      <p className="twap-orders__list-item-header-title">
        {name} <span>{`(${formattedDate})`}</span>
      </p>
      <p className="twap-orders__list-item-header-status">{status}</p>
    </div>
  );
};

const TokenDisplay = (props: { address?: string; amount?: string; TokenLogo?: FC<TokenLogoProps>; useToken: UseToken }) => {
  const token = props.useToken?.(props.address);

  return (
    <div className="twap-orders__list-item-token">
      {!token ? (
        <div />
      ) : (
        <>
          <div className="twap-orders__list-item-token-logo">{props.TokenLogo ? <props.TokenLogo token={token} /> : <TokenLogo logo={token?.logoUrl} />}</div>
          <p className="twap-orders__list-item-token-symbol">{token?.symbol}</p>
        </>
      )}
    </div>
  );
};

function LinearProgressWithLabel(props: { value: number }) {
  return (
    <div className="twap-orders__list-item-progress">
      <div className="twap-orders__list-item-progress-bar">
        <div className="twap-orders__list-item-progress-bar-filled" style={{ width: `${props.value}%` }} />
      </div>
      <div className="twap-orders__list-item-token-progress-label">
        <p>{`${Math.round(props.value)}%`}</p>
      </div>
    </div>
  );
}
