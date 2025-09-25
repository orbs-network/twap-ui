import { HistoryOrderPreview } from "./HistoryOrderPreview";
import { OrderHistoryList } from "./OrderHistoryList";
import { OrderHistoryProps } from "../../types";
import { useTwapStore } from "../../useTwapStore";
import { OrderHistoryProvider } from "./context";

export const OrderHistory = (props: OrderHistoryProps) => {
  const selectedOrderID = useTwapStore((s) => s.state.selectedOrderID);
  const isPreviewOrder = selectedOrderID !== undefined;
  return (
    <OrderHistoryProvider {...props}>
      <div className={`twap-orders ${selectedOrderID !== undefined ? "twap-orders__show-selected" : ""}`}>{isPreviewOrder ? <HistoryOrderPreview /> : <OrderHistoryList />}</div>
    </OrderHistoryProvider>
  );
};
