import { styled } from "styled-components";
import { useSubmitOrderFlow } from "../../hooks/useTransactions";
import { StyledColumnFlex } from "../../styles";
import { OrderSubmitted, Failed } from "./states";
import { Main } from "./states/Main";
import React from "react";

export interface Props {
  className?: string;
}
export const CreateOrderModal = ({ className = "" }: Props) => {
  const { mutate: onSubmit, swapStatus, error } = useSubmitOrderFlow();

  let content = <Main onSubmit={onSubmit} />;
  if (swapStatus === "failed") {
    content = <Failed error={error} />;
  }

  if (swapStatus === "success") {
    content = <OrderSubmitted />;
  }

  return <StyledContainer className={`${className} twap-create-order-content`}>{content}</StyledContainer>;
};

const StyledContainer = styled(StyledColumnFlex)({
  gap: 0,
});

CreateOrderModal.Main = Main;
