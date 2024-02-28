import { Box, styled } from "@mui/material";
import React, { useState } from "react";
import Order from "./Order/Order";
import CircularProgress from "@mui/material/CircularProgress";
import { useTwapContext } from "../context";
import { ParsedOrder } from "../types";
import _ from "lodash";

function OrdersList({ orders, status, isLoading }: { orders?: ParsedOrder[]; status?: string; isLoading: boolean }) {
  const [selected, setSelected] = useState<number | undefined>(undefined);
  const translations = useTwapContext().translations;

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
      {_.size(orders) ? (
        orders?.map((order, index) => {
          return <Order order={order} key={index} expanded={index === selected} onExpand={() => onSelect(index)} />;
        })
      ) : (
        <StyledEmptyList className="twap-orders-empty-list">
          {!status ? "You currently don't have orders" : `${translations.noOrdersFound} ${(translations as any)["noOrdersFound_" + status]} ${translations.noOrdersFound1}`}
        </StyledEmptyList>
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
