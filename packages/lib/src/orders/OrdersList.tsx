import { Box, styled } from "@mui/system";
import React, { useState } from "react";
import Order from "./Order/Order";
import CircularProgress from "@mui/material/CircularProgress";
import { Status } from "@orbs-network/twap";
import { useOrdersContext } from "../context";
import { OrderUI } from "../types";

function OrdersList({ orders, status, isLoading }: { orders?: OrderUI[]; status: Status; isLoading: boolean }) {
  const [selected, setSelected] = useState<number | undefined>(undefined);
  const translations = useOrdersContext().translations;

  const onSelect = (value: number) => {
    setSelected((prevState) => (prevState === value ? undefined : value));
  };

  if (isLoading) {
    return (
      <StyledLoader>
        <CircularProgress className="twap-spinner" />
      </StyledLoader>
    );
  }
  return (
    <StyledContainer className="twap-orders-list">
      {orders ? (
        orders.map((order, index) => {
          return <Order order={order} key={index} expanded={index === selected} onExpand={() => onSelect(index)} />;
        })
      ) : (
        <StyledEmptyList>{`${translations.noOrdersFound} ${(translations as any)["noOrdersFound_" + status]} ${translations.noOrdersFound1}`}</StyledEmptyList>
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

const StyledLoader = styled(StyledContainer)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: 110,
  "& .twap-spinner": {
    color: "white",
  },
});
