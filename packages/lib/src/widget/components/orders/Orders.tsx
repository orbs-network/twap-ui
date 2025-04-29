import React, { FC, ReactNode } from "react";
import { HistoryOrderPreview } from "./HistoryOrderPreview";
import { OrderHistoryContextProvider, useOrderHistoryContext, useSelectedOrder } from "./context";
import { OrderHistoryList } from "./OrderHistoryList";
import { FaArrowRight } from "@react-icons/all-files/fa/FaArrowRight";
import { useMemo } from "react";
import { Portal, Spinner } from "../../../components/base";
import { useTwapContext } from "../../../context";
import { Step, SwapFlow } from "@orbs-network/swap-ui";
import { useTransactionExplorerLink } from "../../../hooks/logic-hooks";
import { useCancelOrder } from "../../../hooks/send-transactions-hooks";
import { OrdersProps } from "../../../types";
import { useOrders } from "../../../hooks/order-hooks";

const PORTAL_ID = "twap-orders-portal";

export const Orders = ({ className = "" }: { className?: string }) => {
  const { components } = useTwapContext();
  if (components.Orders) {
    return <OrdersPortalContainer Component={components.Orders} />;
  }

  return (
    <Portal containerId={PORTAL_ID}>
      <OrderHistoryContextProvider>
        <OrderHistory />
        <OrdersButton className={className} />
      </OrderHistoryContextProvider>
    </Portal>
  );
};

export const OrdersPortalContainer = ({ Component }: { Component: FC<OrdersProps> }) => {
  const { orders, isLoading: orderLoading } = useOrders();
  const { mutateAsync: cancelOrder } = useCancelOrder();
  return (
    <Portal containerId={PORTAL_ID}>
      <Component onCancelOrder={cancelOrder} orders={orders} isLoading={orderLoading} />
    </Portal>
  );
};

export const OrdersPortal = ({children}: {children: ReactNode}) => {
  return <div id={PORTAL_ID}>{children}</div>;
};



export const OrdersButton = ({ className = "" }: { className?: string }) => {
  const openOrders = useOrders()?.orders?.OPEN;
  const { components } = useTwapContext();

  const { onOpen, isLoading } = useOrderHistoryContext();
  const text = useMemo(() => {
    if (isLoading) {
      return "Loading orders";
    }

    return `${openOrders?.length || 0} Open orders`;
  }, [openOrders, isLoading]);

  if (components.OrdersButton) {
    return <components.OrdersButton isLoading={isLoading} onClick={onOpen} openOrdersCount={openOrders?.length || 0} />;
  }

  return (
    <div className={`twap-orders__button ${className}`} onClick={onOpen}>
      {isLoading && <Spinner size={20} />}
      <span className="twap-orders__button-text">{text}</span>
      <FaArrowRight className="twap-orders__button-icon" />
    </div>
  );
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
      }}
    />
  );
};

const CustomModal = ({ children }: { children: ReactNode }) => {
  const OrderHistoryModal = useTwapContext().modals.OrderHistoryModal;
  const { isOpen, onClose, cancelOrderStatus } = useOrderHistoryContext();
  const { translations: t } = useTwapContext();
  if (!OrderHistoryModal) {
    return null;
  }

  return (
    <OrderHistoryModal isOpen={Boolean(isOpen)} onClose={onClose} title={!cancelOrderStatus ? t.orderHistory : ""}>
      {children}
    </OrderHistoryModal>
  );
};

const OrderHistory = ({ className = "" }: { className?: string }) => {
  const { selectedOrderId, cancelOrderStatus } = useOrderHistoryContext();

  return (
    <CustomModal>
      {cancelOrderStatus ? (
        <CancelOrderFlow />
      ) : (
        <div className={`twap-orders ${selectedOrderId !== undefined ? "twap-orders__show-selected" : ""} ${className}`}>
          <HistoryOrderPreview />
          <OrderHistoryList />
        </div>
      )}
    </CustomModal>
  );
};
