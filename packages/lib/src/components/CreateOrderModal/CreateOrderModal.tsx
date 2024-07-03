import { styled } from "@mui/material";
import _ from "lodash";
import { useSubmitOrderFlow } from "../../hooks/useTransactions";
import { StyledColumnFlex } from "../../styles";
import { CreateOrderModalArgs } from "../../types";
import { CreateOrderModalContext } from "./context";
import { OrderSubmitted, Failed } from "./states";
import { ReviewOrder } from "./states/ReviewOrder";

interface Props extends CreateOrderModalArgs {
  className?: string;
}
export const CreateOrderModal = ({ className = "", ...rest }: Props) => {
  const { mutate: onSubmit, swapState, error } = useSubmitOrderFlow();

  let content = <ReviewOrder onSubmit={onSubmit} />;
  if (swapState === "failed") {
    content = <Failed error={error} />;
  }

  if (swapState === "success") {
    content = <OrderSubmitted />;
  }

  return (
    <CreateOrderModalContext.Provider value={rest}>
      <StyledContainer className={className}>{content}</StyledContainer>
    </CreateOrderModalContext.Provider>
  );
};

const StyledContainer = styled(StyledColumnFlex)({
  gap: 0,
});
