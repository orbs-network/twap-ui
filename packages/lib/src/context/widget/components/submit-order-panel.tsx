import { styled } from "@mui/material";
import React from "react";
import { ShowConfirmationButton } from "../../../components";
import { StyledColumnFlex } from "../../../styles";
import { WidgetErrorMessage } from "./WidgetErrorMessage";
import { WidgetMessage } from "./WidgetMessage";

export const SubmitOrderPanel = ({ className = "", hideMessage = false, hideErrorMessage = false }: { className?: string; hideMessage?: boolean; hideErrorMessage?: boolean }) => {
  return (
    <Container className={className}>
      {!hideMessage && <WidgetMessage />}
      <WidgetErrorMessage />
      <ShowConfirmationButton />
    </Container>
  );
};

const Container = styled(StyledColumnFlex)({
  gap: 10,
});
