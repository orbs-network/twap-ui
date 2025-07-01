import React, { ReactNode } from "react";
import { HistoryOrderPreview } from "./HistoryOrderPreview";
import { OrderHistoryContextProvider, useOrderHistoryContext, useSelectedOrder } from "./context";
import { OrderHistoryList } from "./OrderHistoryList";
import { useMemo } from "react";
import { useTwapContext } from "../../context";
import { Step, SwapFlow } from "@orbs-network/swap-ui";
import { useTransactionExplorerLink } from "../../hooks/logic-hooks";
import { Portal } from "../../components/Portal";

const PORTAL_ID = "twap-orders-portal";

const OrdersContent = () => {
  const context = useTwapContext();

  return (
    <context.OrderHistory.Panel>
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
  const { cancelOrderTxHash, cancelOrderStatus } = useOrderHistoryContext();
  const { translations: t, useToken, components } = useTwapContext();
  const order = useSelectedOrder();
  const srcToken = useToken?.(order?.srcTokenAddress);
  const dstToken = useToken?.(order?.dstTokenAddress);

  const explorerUrl = useTransactionExplorerLink(cancelOrderTxHash);
  const currentStep = useMemo((): Step => {
    return {
      title: t.cancelOrderModalTitle.replace("{id}", order?.id?.toString() || ""),
      explorerUrl,
    };
  }, [cancelOrderTxHash, order?.id, t]);

  if (components.CancelOrderPanel) {
    return <components.CancelOrderPanel status={cancelOrderStatus} explorerUrl={explorerUrl} srcToken={srcToken} dstToken={dstToken} orderId={order?.id} />;
  }

  return (
    <SwapFlow
      className="twap-cancel-order-flow"
      swapStatus={cancelOrderStatus}
      totalSteps={1}
      currentStep={currentStep}
      currentStepIndex={0}
      inToken={srcToken}
      outToken={dstToken}
      components={{
        Failed: <SwapFlow.Failed link="https://www.orbs.com/dtwap-and-dlimit-faq" />,
        Success: <SwapFlow.Success title={t.orderCancelled} explorerUrl={explorerUrl} />,
        Main: <SwapFlow.Main />,
        SrcTokenLogo: components.TokenLogo && <components.TokenLogo token={srcToken} />,
        DstTokenLogo: components.TokenLogo && <components.TokenLogo token={dstToken} />,
        Loader: components.TransactionModal?.Spinner,
        SuccessIcon: components.TransactionModal?.SuccessIcon,
        FailedIcon: components.TransactionModal?.ErrorIcon,
        Link: components.TransactionModal?.Link,
      }}
    />
  );
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
