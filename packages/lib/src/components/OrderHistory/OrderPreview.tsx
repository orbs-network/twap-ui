import { styled } from "@mui/material";
import React from "react";
import { useParseOrderUi } from "../../hooks";
import { StyledColumnFlex } from "../../styles";
import { ParsedOrder } from "../../types";

export function OrderPreview({ order: parsedOrder }: { order?: ParsedOrder }) {
  const order = useParseOrderUi(parsedOrder);

  return <StyledOrderPreview>OrderPreview</StyledOrderPreview>;
}

const StyledOrderPreview = styled(StyledColumnFlex)({
  position: "absolute",
  left: 0,
  top: 0,
});
