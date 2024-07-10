import { styled } from "@mui/material";
import { StyledColumnFlex, StyledRowFlex } from "../../styles";
import { SelectedOrder } from "./SelectedOrder";
import { OrderHistoryHeader } from "./OrderHistoryHeader";
import _ from "lodash";
import { OrderHistoryContextProvider, useOrderHistoryContext } from "./context";
import { List } from "./List";
import { Modal, Spinner } from "../base";
import { FaArrowRight } from "@react-icons/all-files/fa/FaArrowRight";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { useTwapContext } from "../../context/context";
import { query, useOpenOrders } from "../../hooks";

const OrderHistoryButton = ({ onClick }: { onClick: () => void }) => {
  const { data } = query.useOrdersHistory();
  const { state } = useTwapContext();
  const { waitForOrderId } = state;
  const openOrders = useOpenOrders();
  const isLoading = waitForOrderId || !data;
  const text = useMemo(() => {
    if (!data) {
      return "Loading orders";
    }
    if (waitForOrderId) {
      return "Updating orders";
    }
    return `${_.size(openOrders)} Open orders`;
  }, [data, waitForOrderId, openOrders]);

  const _onClick = useCallback(() => {
    if (!isLoading) {
      onClick();
    }
  }, [isLoading, onClick]);

  return (
    <StyledOrderHistoryButton className="twap-show-orders-btn" onClick={_onClick}>
      {isLoading && <Spinner size={20} />}
      <span>{text}</span>
      <FaArrowRight className="twap-show-orders-btn-arrow" />
    </StyledOrderHistoryButton>
  );
};

export const OrderHistory = ({ className = "", children }: { className?: string; children: ReactNode }) => {
  const { dappProps, isWrongChain } = useTwapContext();
  const { account } = dappProps;

  if (!account || isWrongChain) return null;

  return (
    <OrderHistoryContextProvider>
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
  return (
    <Container className={className}>
      <SelectedOrder />
      <List />
    </Container>
  );
};

const OrderHistoryModal = ({ className = "" }: { className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const onClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const onOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  return (
    <>
      <OrderHistoryButton onClick={onOpen} />
      <Modal open={isOpen} onClose={onClose}>
        <Container className={className}>
          <OrderHistoryHeader />
          <Content />
        </Container>
      </Modal>
    </>
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
OrderHistory.Modal = OrderHistoryModal;
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
