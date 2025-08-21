import { HistoryOrderPreview } from "./HistoryOrderPreview";
import { OrderHistoryList } from "./OrderHistoryList";
import { OrderHistoryProps } from "../../types";
import { useTwapStore } from "../../useTwapStore";
import { OrderHistoryProvider } from "./context";

export const OrderHistory = (props: OrderHistoryProps) => {
  const selectedOrderID = useTwapStore((s) => s.state.selectedOrderID);
  return (
    <OrderHistoryProvider {...props}>
      <div className={`twap-orders ${selectedOrderID !== undefined ? "twap-orders__show-selected" : ""}`}>
        <HistoryOrderPreview />
        <OrderHistoryList />
      </div>
    </OrderHistoryProvider>
  );
};
