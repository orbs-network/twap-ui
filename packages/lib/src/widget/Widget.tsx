import React, { useCallback, useState } from "react";
import { TwapAdapter, useTwapContext } from "../context/context";
import { Translations } from "../types";
import { CreateOrderModal, LimitPanel, OrderHistory, PoweredBy, ShowConfirmation } from "../components";
import { useFillDelay, useTradeSizeWarning } from "../hooks/lib";
import { PanelProps } from "./types";
import { PanelProvider, usePanelContext } from "./context";
import { LimitPanelDeadlineSelect } from "./LimitPanelDeadlineSelect";
import { TradesAmountInput } from "./TradesAmountInput";
import { TokenPanel } from "./TokenPanel";
import { FillDelaySelector } from "./FillDelaySelector";
import { useSwapModal } from "../hooks/useSwapModal";

function PanelContent(props: PanelProps) {
  return (
    <TwapAdapter
      config={props.config}
      maxFeePerGas={props.maxFeePerGas}
      priorityFeePerGas={props.priorityFeePerGas}
      translations={props.translations || ({} as Translations)}
      provider={props.provider}
      account={props.account}
      parsedTokens={props.tokens}
      srcToken={props.srcToken}
      dstToken={props.dstToken}
      onSrcTokenSelected={props.onSrcTokenSelected}
      onDstTokenSelected={props.onDstTokenSelected}
      isLimitPanel={props.limit}
      uiPreferences={props.uiPreferences}
      onSwitchTokens={props.onSwitchTokens}
      srcUsd={props.srcUsd}
      dstUsd={props.dstUsd}
      marketPrice={props.marketPrice}
      chainId={props.connectedChainId}
      isExactAppoval={props.isExactAppoval}
    >
      <SubmitOrderModal />
      {props.children}
    </TwapAdapter>
  );
}
export const Widget = (props: PanelProps) => {
  return (
    <PanelProvider value={props}>
      <PanelContent {...props}>{props.children}</PanelContent>
    </PanelProvider>
  );
};

const TradeSizeWarning = () => {
  const warning = useTradeSizeWarning();
  if (!warning) return null;
  return <>{warning}</>;
};

const FillDelayWarning = () => {
  const fillDelayWarning = useFillDelay().warning;

  if (!fillDelayWarning) return null;

  return <>{fillDelayWarning}</>;
};

const Warnings = {
  TradeSize: TradeSizeWarning,
  FillDelay: FillDelayWarning,
};

const SubmitOrderModal = () => {
  const { isOpen, onClose } = useSwapModal();
  const { swapStatus } = useTwapContext().state;
  const Modal = usePanelContext().components.Modal;

  return (
    <Modal isOpen={!!isOpen} onClose={() => onClose()} title={!swapStatus ? "Review order" : ""}>
      <CreateOrderModal />
    </Modal>
  );
};

const Orders = () => {
  const [isOpen, setIsOpen] = useState(false);
  const Modal = usePanelContext().components?.Modal;

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

const ShowConfirmationButton = ({ className = "" }: { className?: string }) => {
  const context = usePanelContext();

  return <ShowConfirmation className={className} connect={context.connect} />;
};

Widget.Orders = Orders;
Widget.LimitPanel = LimitPanel;
Widget.ShowConfirmationButton = ShowConfirmationButton;
Widget.LimitPanelDeadlineSelect = LimitPanelDeadlineSelect;
Widget.Warnings = Warnings;
Widget.TradesAmountSelect = TradesAmountInput;
Widget.TokenPanel = TokenPanel;
Widget.PoweredBy = PoweredBy;
Widget.FillDelaySelect = FillDelaySelector;
