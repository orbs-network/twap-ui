import { Box, styled } from "@mui/system";
import React, { useState } from "react";
import { useWeb3 } from "../store/store";
import { createTxData, OrderStatus } from "./data";
import LimitOrder from "./order/Order";

// TODO chnage all limitOrder -->  orders, ordersList, Order

function OrdersList({ type, orders }: { type: OrderStatus; orders: any[] }) {
  const [selected, setSelected] = useState<number | undefined>(undefined);
  const { account } = useWeb3();

  const onSelect = (value: number) => {
    setSelected((prevState) => (prevState === value ? undefined : value));
  };
  return (
    <StyledContainer>
      {orders.length ? (
        orders.map((it, index) => {
          return <LimitOrder type={type} key={index} expanded={index === selected} onExpand={() => onSelect(index)} />;
        })
      ) : (
        <StyledEmptyList>No Orders found</StyledEmptyList>
      )}
    </StyledContainer>
  );
}

export default OrdersList;

const StyledEmptyList = styled(Box)({
  textAlign: "center",
  paddingTop: 40,
});

const StyledContainer = styled(Box)({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 20,
});
