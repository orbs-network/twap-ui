import React, { useCallback, useState } from "react";
import { useWidgetContext, WidgetProvider } from "../context";
import { CreateOrderModal, LimitPanel, OrderHistory, PoweredBy, ShowConfirmation } from "../../components";
import { useFillDelay, useTradeSizeWarning } from "../../hooks/lib";
import { LimitPanelDeadlineSelect } from "./LimitPanelDeadlineSelect";
import { TradesAmountSelect } from "./TradesAmountSelect";
import { TokenPanel } from "./TokenPanel";
import { FillDelaySelector } from "./FillDelaySelector";
import { useSwapModal } from "../../hooks/useSwapModal";
import { WidgetProps } from "../../types";
import { Warnings } from "./Warnings";

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
Widget.LimitPanel = LimitPanel;
Widget.ShowConfirmationButton = ShowConfirmation;
Widget.LimitPanelDeadlineSelect = LimitPanelDeadlineSelect;
Widget.Warnings = Warnings;
Widget.TradesAmountSelect = TradesAmountSelect;
Widget.TokenPanel = TokenPanel;
Widget.PoweredBy = PoweredBy;
Widget.FillDelaySelect = FillDelaySelector;
Widget.SubmitOrderModal = SubmitOrderModal;

export { Widget };
