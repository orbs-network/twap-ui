import React, { useCallback, useState } from "react";
import { useWidgetContext, WidgetProvider } from "../context";
import { ChunkSelector, CreateOrderModal, LimitPanel, LimitSwitch, OrderHistory, PoweredBy, TradeInterval } from "../../components";
import { LimitPanelDeadlineSelect } from "./LimitPanelDeadlineSelect";
import { TokenPanel } from "./TokenPanel";
import { useSwapModal } from "../../hooks/useSwapModal";
import { WidgetProps } from "../../types";
import { Warnings } from "./Errors";
import { WidgetMessage } from "./components/WidgetMessage";
import { SubmitOrderPanel } from "./components/submit-order-panel";

const SubmitOrderModal = () => {
  const { isOpen, onClose } = useSwapModal();
  const { swapStatus } = useWidgetContext().state;
  const Modal = useWidgetContext().components.Modal;

  return (
    <Modal isOpen={!!isOpen} onClose={() => onClose()} title={!swapStatus ? "Review order" : ""}>
      <CreateOrderModal />
    </Modal>
  );
};

const Orders = () => {
  const [isOpen, setIsOpen] = useState(false);
  const Modal = useWidgetContext().components.Modal;

  const onClose = useCallback(() => setIsOpen(false), []);

  return (
    <OrderHistory isOpen={isOpen}>
      <OrderHistory.Button onClick={() => setIsOpen(true)} />
      <Modal isOpen={isOpen} onClose={onClose}>
        <OrderHistory.Header />
        <OrderHistory.Content />
      </Modal>
    </OrderHistory>
  );
};

const Widget = (props: WidgetProps) => {
  return <WidgetProvider {...props} />;
};

Widget.Orders = Orders;
Widget.LimitPricePanel = LimitPanel;
Widget.SubmitOrderPanel = SubmitOrderPanel;
Widget.LimitPanelDeadlineSelect = LimitPanelDeadlineSelect;
Widget.Warnings = Warnings;
Widget.TradesAmountSelect = ChunkSelector;
Widget.TokenPanel = TokenPanel;
Widget.PoweredBy = PoweredBy;
Widget.FillDelaySelect = TradeInterval;
Widget.SubmitOrderModal = SubmitOrderModal;
Widget.LimitPriceSwitch = LimitSwitch;
Widget.Message = WidgetMessage;

export { Widget };
