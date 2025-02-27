import React, { ReactNode } from "react";
import { styled } from "styled-components";
import { HistoryOrderPreview } from "./HistoryOrderPreview";
import { OrderHistoryContextProvider, useOrderHistoryContext } from "./context";
import { OrderHistoryList } from "./OrderHistoryList";
import { FaArrowRight } from "@react-icons/all-files/fa/FaArrowRight";
import { useMemo } from "react";
import { Spinner } from "../../../components/base";
import { StyledColumnFlex, StyledRowFlex } from "../../../styles";
import { OrderHistoryHeader } from "./OrderHistoryHeader";
import { useTwapContext } from "../../../context";
import { useGroupedByStatusOrders } from "../../../hooks/order-hooks";

export const Orders = ({ className = "" }: { className?: string }) => {
  return (
    <OrderHistoryContextProvider>
      <OrderHistory />
      <OrdersButton className={className} />
    </OrderHistoryContextProvider>
  );
};

export const OrdersButton = ({ className = "" }: { className?: string }) => {
  const openOrders = useGroupedByStatusOrders().open;

  const { onOpen, isLoading } = useOrderHistoryContext();
  const text = useMemo(() => {
    if (isLoading) {
      return "Loading orders";
    }

    return `${openOrders?.length || 0} Open orders`;
  }, [openOrders, isLoading]);

  return (
    <StyledOrderHistoryButton className={`twap-order-history-button ${className}`} onClick={onOpen}>
      {isLoading && <Spinner size={20} />}
      <span className="twap-order-history-button-text">{text}</span>
      <FaArrowRight className="twap-order-history-button-icon" />
    </StyledOrderHistoryButton>
  );
};

const CustomModal = ({ children }: { children: ReactNode }) => {
  const Modal = useTwapContext().components.Modal;
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
        <HistoryOrderPreview />
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
