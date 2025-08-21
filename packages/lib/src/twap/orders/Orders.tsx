import { HistoryOrderPreview } from "./HistoryOrderPreview";
import { OrderHistoryList } from "./OrderHistoryList";
import { OrderHistoryProps } from "../../types";
import { useTwapStore } from "../../useTwapStore";

export const OrderHistory = (props: OrderHistoryProps) => {
  const selectedOrderID = useTwapStore((s) => s.state.selectedOrderID);
  return (
    <div className={`twap-orders ${selectedOrderID !== undefined ? "twap-orders__show-selected" : ""}`}>
      <HistoryOrderPreview SelectedOrder={props.SelectedOrder} />
      <OrderHistoryList {...props} />
    </div>
  );
};
