import React, { ReactNode } from "react";
import { HistoryOrderPreview } from "./HistoryOrderPreview";
import { OrderHistoryContextProvider, useOrderHistoryContext, useSelectedOrder } from "./context";
import { OrderHistoryList } from "./OrderHistoryList";
import { useMemo } from "react";
import { useTwapContext } from "../../context";
import { Step, SwapFlow } from "@orbs-network/swap-ui";
import { useTransactionExplorerLink } from "../../hooks/logic-hooks";
import { Portal } from "../../components/Portal";
import { useOrderHistoryPanel } from "../twap";
import { SwapFlowComponent } from "../swap-flow";

const PORTAL_ID = "twap-orders-portal";

const OrdersContent = () => {
  const context = useTwapContext();
  const { isOpen, onClose } = useOrderHistoryPanel();

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

const CancelOrderFlow = () => {
  const { cancelOrderTxHash, cancelOrderStatus, cancelOrderError } = useOrderHistoryContext();
  const { translations: t, useToken, TransactionModal } = useTwapContext();
  const order = useSelectedOrder();
  const inToken = useToken?.(order?.srcTokenAddress);
  const outToken = useToken?.(order?.dstTokenAddress);

  const explorerUrl = useTransactionExplorerLink(cancelOrderTxHash);
  const currentStep = useMemo((): Step => {
    return {
      title: t.cancelOrderModalTitle.replace("{id}", order?.id?.toString() || ""),
      explorerUrl,
    };
  }, [cancelOrderTxHash, order?.id, t]);

  if (!order) {
    return null;
  }

  return (
    <SwapFlowComponent
      className="twap-cancel-order-flow"
      swapStatus={cancelOrderStatus}
      totalSteps={1}
      currentStep={currentStep}
      currentStepIndex={0}
      failedContent={<FailedContent error={cancelOrderError || ""} orderId={order.id} />}
      successContent={<SuccessContent explorerUrl={explorerUrl || ""} orderId={order.id} />}
      mainContent={<SwapFlow.Main />}
      loadingViewContent={TransactionModal?.CancelOrder?.LoadingView ? <LoadingView orderId={order.id} /> : null}
      inToken={inToken}
      outToken={outToken}
    />
  );
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

const OrderHistory = ({ className = "" }: { className?: string }) => {
  const { selectedOrderId, cancelOrderStatus } = useOrderHistoryContext();

  return (
    <>
      {cancelOrderStatus ? (
        <CancelOrderFlow />
      ) : (
        <div className={`twap-orders ${selectedOrderId !== undefined ? "twap-orders__show-selected" : ""} ${className}`}>
          <HistoryOrderPreview />
          <OrderHistoryList />
        </div>
      )}
    </>
  );
};
