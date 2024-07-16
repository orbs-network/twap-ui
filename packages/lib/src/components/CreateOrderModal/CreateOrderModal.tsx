import { styled } from "@mui/material";
import _ from "lodash";
import { useSubmitOrderFlow } from "../../hooks/useTransactions";
import { StyledColumnFlex } from "../../styles";
import { OrderSubmitted, Failed } from "./states";
import { Main } from "./states/Main";

export interface Props {
  className?: string;
}
export const CreateOrderModal = ({ className = "" }: Props) => {
  const { mutate: onSubmit, swapState, error } = useSubmitOrderFlow();

  let content = <Main onSubmit={onSubmit} />;
  if (swapState === "failed") {
    content = <Failed error={error} />;
  }

  if (swapState === "success") {
    content = <OrderSubmitted />;
  }

  return <StyledContainer className={`${className} twap-create-order-content`}>{content}</StyledContainer>;
};

const StyledContainer = styled(StyledColumnFlex)({
  gap: 0,
});

CreateOrderModal.Main = Main;
