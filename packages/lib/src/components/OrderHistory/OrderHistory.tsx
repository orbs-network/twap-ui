import { styled } from "styled-components";
import { StyledColumnFlex, StyledRowFlex } from "../../styles";
import { SelectedOrder } from "./SelectedOrder";
import { OrderHistoryHeader } from "./OrderHistoryHeader";
import { OrderHistoryContextProvider, useOrderHistoryContext } from "./context";
import { OrderHistoryList } from "./OrderHistoryList";
import { Spinner } from "../base";
import { FaArrowRight } from "@react-icons/all-files/fa/FaArrowRight";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { useTwapContext } from "../../context/context";
import { query, useOpenOrders } from "../../hooks";
import { size } from "../../utils";

const OrderHistoryButton = ({ onClick, className = "" }: { onClick: () => void; className?: string }) => {
  const { data } = query.useOrdersHistory();
  const openOrders = useOpenOrders();
  const isLoading = !data;
  const text = useMemo(() => {
    if (!data) {
      return "Loading orders";
    }

    return `${size(openOrders)} Open orders`;
  }, [data, openOrders]);

  const _onClick = useCallback(() => {
    if (!isLoading) {
      onClick();
    }
  }, [isLoading, onClick]);

  return (
    <StyledOrderHistoryButton className={`twap-show-orders-btn ${className}`} onClick={_onClick}>
      {isLoading && <Spinner size={20} />}
      <span>{text}</span>
      <FaArrowRight className="twap-show-orders-btn-arrow" />
    </StyledOrderHistoryButton>
  );
};

export const OrderHistory = ({ className = "", children, isOpen }: { className?: string; children: ReactNode; isOpen: boolean }) => {
  const { account, isWrongChain } = useTwapContext();

  if (!account || isWrongChain) return null;

  return (
    <OrderHistoryContextProvider isOpen={isOpen}>
      <StyledOrderHistory className={className}>{children}</StyledOrderHistory>
    </OrderHistoryContextProvider>
  );
};

const StyledOrderHistory = styled("div")({
  width: "100%",
});

const StyledOrderHistoryButton = styled(StyledRowFlex)({
  justifyContent: "flex-start",
  ".twap-show-orders-btn-arrow": {
    marginLeft: "auto",
  },
});

const Content = ({ className = "" }: { className?: string }) => {
  const selectedOrderId = useOrderHistoryContext().selectedOrderId;
  return (
    <Container className={className}>
      <SelectedOrder selectedOrderId={selectedOrderId} />
      <OrderHistoryList />
    </Container>
  );
};

const Container = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  const order = useOrderHistoryContext().selectedOrderId;

  return (
    <StyledContainer className={className} order={order ? 1 : 0}>
      {children}
    </StyledContainer>
  );
};

OrderHistory.Button = OrderHistoryButton;
OrderHistory.Content = Content;
OrderHistory.Header = OrderHistoryHeader;
OrderHistory.Container = Container;

const StyledContainer = styled(StyledColumnFlex)<{ order: number }>(({ order }) => {
  return {
    width: "100%",
    position: "relative",
    height: order ? "auto" : "500px",
    maxHeight: "90vh",
  };
});
