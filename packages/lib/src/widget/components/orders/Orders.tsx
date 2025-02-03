import React from "react";
import { styled } from "styled-components";
import { SelectedOrder } from "./SelectedOrder";
import { OrderHistoryContextProvider, useOrderHistoryContext } from "./context";
import { OrderHistoryList } from "./OrderHistoryList";
import { FaArrowRight } from "@react-icons/all-files/fa/FaArrowRight";
import { useMemo } from "react";
import { useOpenOrders, useOrdersHistory } from "../../../hooks";
import { size } from "../../../utils";
import { Portal, Spinner } from "../../../components/base";
import { StyledColumnFlex, StyledRowFlex } from "../../../styles";
import { useWidgetContext } from "../../widget-context";
import { OrderHistoryHeader } from "./OrderHistoryHeader";
const PORTAL_ID = "twap-orders-portal";
export const OrdersPortal = () => {
  return <div id={PORTAL_ID} />
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
  const { data } = useOrdersHistory();
  const openOrders = useOpenOrders();
  const { onOpen } = useOrderHistoryContext();
  const isLoading = !data
  const text = useMemo(() =>isLoading ? 'Loading orders...' :  `${size(openOrders)} Open orders`, [data, openOrders, isLoading]);

  return (
    <StyledOrderHistoryButton className={`twap-order-history-button ${className}`} onClick={onOpen}>
      {isLoading && <Spinner size={20} />}
      <span className="twap-order-history-button-text">{text}</span>
      <FaArrowRight className="twap-order-history-button-icon" />
    </StyledOrderHistoryButton>
  );
};

const OrderHistory = ({ className = "" }: { className?: string }) => {
  const { selectedOrderId: order, isOpen, onClose } = useOrderHistoryContext();
  const Modal = useWidgetContext().components.Modal;
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <StyledContainer className={`twap-order-history ${className}`} order={order ? 1 : 0}>
        <OrderHistoryHeader />
        <SelectedOrder />
        <OrderHistoryList />
      </StyledContainer>
    </Modal>
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
    height: order ? "auto" : "500px",
    maxHeight: "90vh",
  };
});
