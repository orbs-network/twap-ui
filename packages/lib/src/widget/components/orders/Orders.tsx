import React, { ReactNode } from "react";
import { styled } from "styled-components";
import { SelectedOrder } from "./SelectedOrder";
import { OrderHistoryContextProvider, useOrderHistoryContext } from "./context";
import { OrderHistoryList } from "./OrderHistoryList";
import { FaArrowRight } from "@react-icons/all-files/fa/FaArrowRight";
import { useMemo } from "react";
import { Portal, Spinner } from "../../../components/base";
import { StyledColumnFlex, StyledRowFlex } from "../../../styles";
import { useWidgetContext } from "../../widget-context";
import { OrderHistoryHeader } from "./OrderHistoryHeader";
import { useOrderHistoryManager } from "../../../hooks/useOrderHistoryManager";
const PORTAL_ID = "twap-orders-portal";
export const OrdersPortal = () => {
  return <div id={PORTAL_ID} />;
};

export const Orders = ({ className = "" }: { className?: string }) => {
  return (
    <Portal containerId={PORTAL_ID}>
      <OrderHistoryContextProvider>
        <OrderHistory />
        <OrdersButton className={className} />
      </OrderHistoryContextProvider>
    </Portal>
  );
};

export const OrdersButton = ({ className = "" }: { className?: string }) => {
  const openOrders = useOrderHistoryManager().groupedOrdersByStatus?.open;
  const {
    state: { newOrderLoading },
  } = useWidgetContext();
  const { onOpen, isLoading } = useOrderHistoryContext();
  const text = useMemo(() => {
    if (isLoading) {
      return "Loading orders";
    }
    if (newOrderLoading) {
      return "Updating orders";
    }

    return `${openOrders?.length || 0} Open orders`;
  }, [openOrders, isLoading, newOrderLoading]);

  return (
    <StyledOrderHistoryButton className={`twap-order-history-button ${className}`} onClick={onOpen}>
      {isLoading && <Spinner size={20} />}
      <span className="twap-order-history-button-text">{text}</span>
      <FaArrowRight className="twap-order-history-button-icon" />
    </StyledOrderHistoryButton>
  );
};

const CustomModal = ({ children }: { children: ReactNode }) => {
  const Modal = useWidgetContext().components.Modal;
  const { isOpen, onClose } = useOrderHistoryContext();

  if (!Modal) {
    return <>{children}</>;
  }
  return (
    <Modal isOpen={Boolean(isOpen)} onClose={onClose} title="Order history">
      {children}
    </Modal>
  );
};

const OrderHistory = ({ className = "" }: { className?: string }) => {
  const { selectedOrderId: order } = useOrderHistoryContext();
  return (
    <CustomModal>
      <StyledContainer className={`twap-order-history ${className}`} order={order ? 1 : 0}>
        <OrderHistoryHeader />
        <SelectedOrder />
        <OrderHistoryList />
      </StyledContainer>
    </CustomModal>
  );
};

const StyledOrderHistoryButton = styled(StyledRowFlex)({
  justifyContent: "flex-start",
  ".twap-show-orders-btn-arrow": {
    marginLeft: "auto",
  },
});

const StyledContainer = styled(StyledColumnFlex)<{ order: number }>(({ order }) => {
  return {
    width: "100%",
    position: "relative",
    height: order ? "auto" : "700px",
    maxHeight: "90vh",
  };
});
