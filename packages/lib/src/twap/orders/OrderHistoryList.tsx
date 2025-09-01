import { HiArrowRight } from "@react-icons/all-files/hi/HiArrowRight";
import { HiOutlineTrash } from "@react-icons/all-files/hi/HiOutlineTrash";

import { Order, OrderType } from "@orbs-network/twap-sdk";
import * as React from "react";
import { useTwapContext } from "../../context";
import { OrderHistoryMenu } from "./OrderHistorySelect";
import { useOrderName, useOrders } from "../../hooks/order-hooks";
import { Virtuoso } from "react-virtuoso";
import moment from "moment";
import TokenLogo from "../../components/TokenLogo";
import { useCancelOrderMutation } from "../../hooks/use-cancel-order";
import { FC } from "react";
import { TokenLogoProps, UseToken } from "../../types";
import { useTwapStore } from "../../useTwapStore";
import { useOrderHistoryContext } from "./context";
import { useMutation } from "@tanstack/react-query";

const ListLoader = () => {
  const { listLoader } = useOrderHistoryContext();
  return <div className="twap-orders__loader">{listLoader || <p>Loading...</p>}</div>;
};

export const OrderHistoryList = () => {
  const selectedOrderID = useTwapStore((s) => s.state.selectedOrderID);
  const status = useTwapStore((s) => s.state.orderHIstoryStatusFilter);
  const { Button, callbacks } = useOrderHistoryContext();
  const [selectedOrders, setSelectedOrders] = React.useState<string[]>([]);
  const [selectMode, setSelectMode] = React.useState(false);
  const { mutateAsync: cancelOrder } = useCancelOrderMutation();

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

  const onToggleSelectMode = React.useCallback(() => {
    setSelectMode((prev) => !prev);
    setSelectedOrders([]);
  }, []);

  const { mutate: onCancelOrders, isLoading: isCancelOrdersLoading } = useMutation({
    mutationFn: () => {
      return cancelOrder({ orderIds: selectedOrders, callbacks });
    },
  });

  if (selectedOrderID !== undefined) return null;

  return (
    <>
      <div className="twap-orders__list-header">
        <OrderHistoryMenu />

        <div className="twap-orders__list-header-select-toggle-container">
          <Button className={`twap-orders__list-header-select-toggle ${selectMode ? "twap-orders__list-header-select-toggle-active" : ""}`} onClick={onToggleSelectMode}>
            <p> Select Mode</p>
          </Button>
          {selectedOrders.length > 0 && (
            <Button onClick={onCancelOrders} loading={isCancelOrdersLoading} className="twap-orders__list-header-select-toggle-cancel">
              <HiOutlineTrash className="twap-orders__list-header-select-toggle-cancel-icon" />
              <p>{`Cancel (${selectedOrders.length})`}</p>
            </Button>
          )}
        </div>
      </div>
      {isLoading ? (
        <ListLoader />
      ) : !orders.length ? (
        <EmptyList />
      ) : (
        <div className="twap-orders__list">
          <Virtuoso
            style={{ height: "100%" }}
            data={orders}
            itemContent={(index, order) => <ListOrder selectMode={selectMode} selected={selectedOrders.includes(order.id)} key={index} selectOrder={onSelectOrder} order={order} />}
          />
        </div>
      )}
    </>
  );
};

const ListOrder = ({ order, selectOrder, selected, selectMode }: { order: Order; selectOrder: (id: string) => void; selected: boolean; selectMode: boolean }) => {
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
    if (selectMode) {
      selectOrder(order?.id);
    } else {
      onShowOrder();
    }
  }, [selectMode, selectOrder, onShowOrder, order?.id]);

  if (CustomListOrder) {
    return <CustomListOrder order={order} selectOrder={onClick} cancelOrder={handleCancelOrder} selected={selected} />;
  }

  return (
    <div className={`twap-orders__list-item twap-orders__list-item-${order.status} ${selectMode ? "twap-orders__list-item-select-mode" : ""}`} onClick={onClick}>
      {selectMode && <Checkbox checked={selected} setChecked={() => {}} />}

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
