import { HiArrowRight } from "@react-icons/all-files/hi/HiArrowRight";
import { Order } from "@orbs-network/twap-sdk";
import * as React from "react";
import { Virtuoso } from "react-virtuoso";
import TokenLogo from "../../../components/TokenLogo";
import { useTwapStore } from "../../../useTwapStore";
import { useOrderName, useOrders, useOrderToDisplay, useSelectedOrderIdsToCancel } from "../../../hooks/order-hooks";
import { useDateFormat } from "../../../hooks/helper-hooks";
import { useTranslations } from "../../../hooks/use-translations";
import { useTwapContext } from "../../../context/twap-context";

const ListLoader = () => {
  return <div className="twap-orders__loader">{<p>Loading...</p>}</div>;
};

export const OrdersList = () => {
  const { isLoading } = useOrders();
  const ordersToDisplay = useOrderToDisplay();
  const orderIdsToCancel = useTwapStore((s) => s.state.orderIdsToCancel);
  const cancelOrdersMode = useTwapStore((s) => s.state.cancelOrdersMode);
  const onSelectOrder = useSelectedOrderIdsToCancel();

  return (
    <>
      {isLoading ? (
        <ListLoader />
      ) : !ordersToDisplay?.length ? (
        <EmptyList />
      ) : (
        <div className={`twap-orders__list ${cancelOrdersMode ? "twap-orders__list-select-mode" : ""}`}>
          <Virtuoso
            style={{ height: "100%" }}
            data={ordersToDisplay}
            itemContent={(index, order) => (
              <ListOrder
                cancelOrdersMode={Boolean(cancelOrdersMode)}
                selected={orderIdsToCancel?.includes(order.id) || false}
                key={index}
                selectOrder={onSelectOrder}
                order={order}
              />
            )}
          />
        </div>
      )}
    </>
  );
};

const ListOrder = ({ order, selectOrder, selected, cancelOrdersMode }: { order: Order; selectOrder: (id: string) => void; selected: boolean; cancelOrdersMode: boolean }) => {
  const updateState = useTwapStore((s) => s.updateState);

  const onShowOrder = React.useCallback(() => {
    updateState({ selectedOrderID: order?.id });
  }, [updateState, order?.id]);

  const onClick = React.useCallback(() => {
    if (cancelOrdersMode) {
      selectOrder(order?.id);
    } else {
      onShowOrder();
    }
  }, [cancelOrdersMode, selectOrder, onShowOrder, order?.id]);

  return (
    <div
      className={`twap-orders__list-item twap-orders__list-item-${order.status} ${cancelOrdersMode ? "twap-orders__list-item-select-mode" : ""} ${
        selected ? "twap-orders__list-item-selected" : ""
      }`}
      onClick={onClick}
    >
      <div className="twap-orders__list-item-content">
        <ListItemHeader order={order} />
        <LinearProgressWithLabel value={order.progress || 0} />
        <div className="twap-orders__list-item-tokens">
          <TokenDisplay address={order.srcTokenAddress} />
          <HiArrowRight className="twap-orders__list-item-tokens-arrow" />
          <TokenDisplay address={order.dstTokenAddress} />
        </div>
      </div>
    </div>
  );
};

const EmptyList = () => {
  const status = useTwapStore((s) => s.state.orderHistoryStatusFilter);
  const t = useTranslations();
  const name = React.useMemo(() => {
    if (!status) {
      return "";
    }
    return status;
  }, [status]);

  return (
    <div className="twap-orders__list-empty">
      <p>{t("noOrders", { status: name })}</p>
    </div>
  );
};

const ListItemHeader = ({ order }: { order: Order }) => {
  const status = order && order.status;
  const name = useOrderName(order);
  const formattedDate = useDateFormat(order.createdAt);

  return (
    <div className="twap-orders__list-item-header">
      <p className="twap-orders__list-item-header-title">
        {name} <span>{`(${formattedDate})`}</span>
      </p>
      <p className="twap-orders__list-item-header-status">{status}</p>
    </div>
  );
};

const TokenDisplay = (props: { address?: string; amount?: string }) => {
  const { useToken, components } = useTwapContext();
  const token = useToken?.(props.address);

  return (
    <div className="twap-orders__list-item-token">
      {!token ? (
        <div />
      ) : (
        <>
          <div className="twap-orders__list-item-token-logo">{components.TokenLogo ? <components.TokenLogo token={token} /> : <TokenLogo logo={token?.logoUrl} />}</div>
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
