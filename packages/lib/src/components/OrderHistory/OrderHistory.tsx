import { styled } from "@mui/material";
import { StyledColumnFlex } from "../../styles";
import { SelectedOrder } from "./SelectedOrder";
import { OrderHistoryHeader } from "./OrderHistoryHeader";
import _ from "lodash";
import { OrderHistoryContextProvider, useOrderHistoryContext } from "./context";
import { List } from "./List";

export function OrderHistory() {
  return (
    <OrderHistoryContextProvider>
      <Content />
    </OrderHistoryContextProvider>
  );
}

const Content = () => {
  const order = useOrderHistoryContext().selectedOrderId;
  return (
    <Container order={order ? 1 : 0}>
      <OrderHistoryHeader />
      <SelectedOrder />
      <List />
    </Container>
  );
};

const Container = styled(StyledColumnFlex)<{ order: number }>(({ order }) => {
  return {
    position: "relative",
    height: order ? "auto" : "500px",
    maxHeight: "90vh",
  };
});
