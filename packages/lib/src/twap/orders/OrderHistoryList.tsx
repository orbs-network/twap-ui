import { HiArrowRight } from "@react-icons/all-files/hi/HiArrowRight";
import { Order, OrderType } from "@orbs-network/twap-sdk";
import * as React from "react";
import { useTwapContext } from "../../context";
import { useOrderName, useOrders } from "../../hooks/order-hooks";
import { Virtuoso } from "react-virtuoso";
import moment from "moment";
import TokenLogo from "../../components/TokenLogo";
import { useCancelOrderMutation } from "../../hooks/use-cancel-order";
import { FC } from "react";
import { TokenLogoProps, UseToken } from "../../types";
import { useTwapStore } from "../../useTwapStore";
import { useOrderHistoryContext } from "./context";

const ListLoader = () => {
  const { listLoader } = useOrderHistoryContext();
  return <div className="twap-orders__loader">{listLoader || <p>Loading...</p>}</div>;
};

export const OrderHistoryList = () => {
  const selectedOrderID = useTwapStore((s) => s.state.selectedOrderID);
  const status = useTwapStore((s) => s.state.orderHistoryStatusFilter);
  const [selectedOrders, setSelectedOrders] = React.useState<string[]>([]);
  const cancelOrdersMode = useTwapStore((s) => s.state.cancelOrdersMode);

  const { orders: allOrders, isLoading } = useOrders();
  const orders = React.useMemo(() => (!allOrders ? [] : !status ? allOrders.all : allOrders[status.toUpperCase() as keyof typeof allOrders]), [allOrders, status]);

  const onSelectOrder = React.useCallback((id: string) => {
    setSelectedOrders((prev) => {
      if (prev.includes(id)) {
        return prev.filter((orderId) => orderId !== id);
      }
      return [...prev, id];
    });
  }, []);


  if (selectedOrderID !== undefined) return null;

  return (
    <>
    
      {isLoading ? (
        <ListLoader />
      ) : !orders.length ? (
        <EmptyList />
      ) : (
        <div className="twap-orders__list">
          <Virtuoso
            style={{ height: "100%" }}
            data={orders}
            itemContent={(index, order) => <ListOrder cancelOrdersMode={Boolean(cancelOrdersMode)} selected={selectedOrders.includes(order.id)} key={index} selectOrder={onSelectOrder} order={order} />}
          />
        </div>
      )}
    </>
  );
};

const ListOrder = ({ order, selectOrder, selected, cancelOrdersMode }: { order: Order; selectOrder: (id: string) => void; selected: boolean; cancelOrdersMode: boolean }) => {
  const { mutateAsync: cancelOrder } = useCancelOrderMutation();
  const { useToken, ListOrder: CustomListOrder, Checkbox, callbacks } = useOrderHistoryContext();
  const updateState = useTwapStore((s) => s.updateState);

  const onShowOrder = React.useCallback(() => {
    updateState({ selectedOrderID: order?.id });
  }, [updateState, order?.id]);

  const handleCancelOrder = React.useCallback(() => {
    return cancelOrder({ orderIds: [order.id], callbacks });
  }, [cancelOrder, order]);

  const onClick = React.useCallback(() => {
    if (cancelOrdersMode) {
      selectOrder(order?.id);
    } else {
      onShowOrder();
    }
  }, [cancelOrdersMode, selectOrder, onShowOrder, order?.id]);

  if (CustomListOrder) {
    return <CustomListOrder order={order} selectOrder={onClick} cancelOrder={handleCancelOrder} selected={selected} />;
  }

  return (
    <div className={`twap-orders__list-item twap-orders__list-item-${order.status} ${cancelOrdersMode ? "twap-orders__list-item-select-mode" : ""}`} onClick={onClick}>
      {cancelOrdersMode && <Checkbox checked={selected} setChecked={() => {}} />}

      <div className="twap-orders__list-item-content">
        <ListItemHeader order={order} />
        <LinearProgressWithLabel value={order.progress || 0} />
        <div className="twap-orders__list-item-tokens">
          <TokenDisplay address={order.srcTokenAddress} useToken={useToken} />
          <HiArrowRight className="twap-orders__list-item-tokens-arrow" />
          <TokenDisplay address={order.dstTokenAddress} useToken={useToken} />
        </div>
      </div>
    </div>
  );
};

const EmptyList = () => {
  const status = useTwapStore((s) => s.state.orderHistoryStatusFilter);
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
