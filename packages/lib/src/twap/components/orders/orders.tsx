import { OrderPreview } from "./order-preview";
import { OrdersList } from "./orders-list";
import { useTwapStore } from "../../../useTwapStore";

export const Orders = () => {
  const selectedOrderID = useTwapStore((s) => s.state.selectedOrderID);
  const isPreviewOrder = selectedOrderID !== undefined;
  return <div className={`twap-orders ${selectedOrderID !== undefined ? "twap-orders__show-selected" : ""}`}>{isPreviewOrder ? <OrderPreview /> : <OrdersList />}</div>;
};
