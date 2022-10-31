import { Box, styled } from "@mui/system";
import React, { useState } from "react";
import { useWeb3 } from "../store/store";
import { Order, OrderStatus } from "../types";
import OrderComponent from "./order/Order";

// TODO chnage all limitOrder -->  orders, ordersList, Order

function OrdersList({ orders, type }: { orders: Order[]; type: OrderStatus }) {
  const [selected, setSelected] = useState<number | undefined>(undefined);

  const onSelect = (value: number) => {
    setSelected((prevState) => (prevState === value ? undefined : value));
  };
  return (
    <StyledContainer>
      {orders ? (
        orders.map((order, index) => {
          return <OrderComponent order={order} type={type} key={index} expanded={index === selected} onExpand={() => onSelect(index)} />;
        })
      ) : (
        <StyledEmptyList>No Orders Found</StyledEmptyList>
      )}
    </StyledContainer>
  );
}

export default OrdersList;

const StyledEmptyList = styled(Box)({
  textAlign: "center",
  paddingTop: 40,
  marginBottom: 40,
});

const StyledContainer = styled(Box)({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 20,
});
