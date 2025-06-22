import { HiArrowRight } from "@react-icons/all-files/hi/HiArrowRight";
import { OrderType } from "@orbs-network/twap-sdk";
import { useOrderHistoryContext } from "./context";
import * as React from "react";
import { Loader } from "../../../components/base/Loader";
import TokenLogo from "../../../components/base/TokenLogo";
import { useTwapContext } from "../../../context";
import { OrderHistoryMenu } from "./OrderHistorySelect";
import { useOrderName } from "../../../hooks/logic-hooks";
import { Virtuoso } from "react-virtuoso";
import moment from "moment";
import { TwapOrder } from "../../../types";

const ListLoader = () => {
  return (
    <div className="twap-orders__loader">
      <Loader />
    </div>
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
        <div className="twap-orders__list">
          <Virtuoso style={{ height: "100%" }} data={selectedOrders} itemContent={(index, order) => <ListOrder key={index} selectOrder={selectOrder} order={order} />} />
        </div>
      )}
    </>
  );
};

const ListOrder = ({ order, selectOrder }: { order: TwapOrder; selectOrder: (id?: number) => void }) => {
  const { components } = useTwapContext();

  const component = (
    <div className={`twap-orders__list-item twap-orders__list-item-${order.status}`} onClick={() => selectOrder(order?.id)}>
      <ListItemHeader order={order} />
      <LinearProgressWithLabel value={order.progress || 0} />
      <div className="twap-orders__list-item-tokens">
        <TokenDisplay address={order.srcTokenAddress} />
        <HiArrowRight className="twap-orders__list-item-tokens-arrow" />
        <TokenDisplay address={order.dstTokenAddress} />
      </div>
    </div>
  );

  if (components.OrderHistoryListOrder) {
    return (
      <components.OrderHistoryListOrder order={order} selectOrder={selectOrder}>
        {component}
      </components.OrderHistoryListOrder>
    );
  }

  return component;
};

const EmptyList = () => {
  const status = useOrderHistoryContext().status;
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

const ListItemHeader = ({ order }: { order: TwapOrder }) => {
  const status = order && order.status;
  const { dateFormat } = useTwapContext();
  const name = useOrderName(order.type === OrderType.TWAP_MARKET, order.chunks);
  const formattedDate = React.useMemo(() => {
    if (!order.createdAt) return "";
    if (dateFormat) return dateFormat(order.createdAt);
    return moment(order.createdAt).format("DD/MM/YYYY HH:mm");
  }, [order.createdAt, dateFormat]);

  return (
    <div className="twap-orders__list-item-header">
      <p className="twap-orders__list-item-header-title">
        {`#${order.id}`} {name} <span>{`(${formattedDate})`}</span>
      </p>
      <p className="twap-orders__list-item-header-status">{status}</p>
    </div>
  );
};

const TokenDisplay = ({ address }: { address?: string; amount?: string }) => {
  const { useToken, components } = useTwapContext();
  const token = useToken?.(address);

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
