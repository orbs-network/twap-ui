import React, { ReactNode } from "react";
import { HistoryOrderPreview } from "./HistoryOrderPreview";
import { OrderHistoryContextProvider, useOrderHistoryContext } from "./context";
import { OrderHistoryList } from "./OrderHistoryList";
import { useTwapContext } from "../../context";
import { SwapFlow } from "@orbs-network/swap-ui";
import { Portal } from "../../components/Portal";
import { useOrderHistoryPanel } from "../twap";

const PORTAL_ID = "twap-orders-portal";

const OrdersContent = () => {
  const context = useTwapContext();
  const { isOpen, onClose } = useOrderHistoryPanel();

  if (!context.OrderHistory.Panel) {
    return null;
  }

  return (
    <context.OrderHistory.Panel isOpen={isOpen} onClose={onClose}>
      <OrderHistory />
    </context.OrderHistory.Panel>
  );
};

export const Orders = () => {
  return (
    <Portal containerId={PORTAL_ID}>
      <OrderHistoryContextProvider>
        <OrdersContent />
      </OrderHistoryContextProvider>
    </Portal>
  );
};

export const OrdersPortal = ({ children }: { children?: ReactNode }) => {
  return <div id={PORTAL_ID}>{children}</div>;
};

const LoadingView = ({ orderId }: { orderId: number }) => {
  const { TransactionModal, srcToken, dstToken } = useTwapContext();
  if (TransactionModal?.CancelOrder?.LoadingView && srcToken && dstToken) {
    return <TransactionModal.CancelOrder.LoadingView srcToken={srcToken} dstToken={dstToken} orderId={orderId} />;
  }
  return <SwapFlow.Main />;
};

const SuccessContent = ({ explorerUrl, orderId }: { explorerUrl: string; orderId: number }) => {
  const { TransactionModal, srcToken, dstToken, translations: t } = useTwapContext();
  if (TransactionModal?.CancelOrder?.SuccessContent && srcToken && dstToken) {
    return <TransactionModal.CancelOrder.SuccessContent explorerUrl={explorerUrl} srcToken={srcToken} dstToken={dstToken} orderId={orderId} />;
  }
  return <SwapFlow.Success title={t.orderCancelled} explorerUrl={explorerUrl} />;
};

const FailedContent = ({ error, orderId }: { error: string; orderId: number }) => {
  const { TransactionModal, srcToken, dstToken } = useTwapContext();
  if (TransactionModal?.CancelOrder?.ErrorContent && srcToken && dstToken) {
    return <TransactionModal.CancelOrder.ErrorContent orderId={orderId} error={error} srcToken={srcToken} dstToken={dstToken} />;
  }
  return <SwapFlow.Failed link="https://www.orbs.com/dtwap-and-dlimit-faq" />;
};

export const OrderHistory = ({ className = "" }: { className?: string }) => {
  const { selectedOrderId } = useOrderHistoryContext();

  return (
    <div className={`twap-orders ${selectedOrderId !== undefined ? "twap-orders__show-selected" : ""} ${className}`}>
      <HistoryOrderPreview />
      <OrderHistoryList />
    </div>
  );
};
