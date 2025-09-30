import { OrderPreview } from "./order-preview";
import { OrdersList } from "./orders-list";
import { OrderHistoryProps } from "../../../types";
import { useTwapStore } from "../../../useTwapStore";
import { OrderHistoryProvider } from "../../../context/order-history-context";

export const Orders = (props: OrderHistoryProps) => {
  const selectedOrderID = useTwapStore((s) => s.state.selectedOrderID);
  const isPreviewOrder = selectedOrderID !== undefined;
  return (
    <OrderHistoryProvider {...props}>
      <div className={`twap-orders ${selectedOrderID !== undefined ? "twap-orders__show-selected" : ""}`}>{isPreviewOrder ? <OrderPreview /> : <OrdersList />}</div>
    </OrderHistoryProvider>
  );
};
