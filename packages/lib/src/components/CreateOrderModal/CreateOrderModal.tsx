import { styled } from "@mui/material";
import _ from "lodash";
import { useSubmitOrderFlow } from "../../hooks/useTransactions";
import { useTwapStore } from "../../store";
import { StyledColumnFlex } from "../../styles";
import { CreateOrderModalArgs } from "../../types";
import { Separator, SubmitButton, TokensPreview } from "./Components";
import { CreateOrderModalContext } from "./context";
import { ChunksAmount, ChunkSize, Expiry, LimitDetails, MinDestAmount, Price, Recipient, TradeInterval, TwapDetails } from "./Details";
import { OrderSubmitted, ConfirmOrder, Failed } from "./states";
import { ReviewOrder } from "./states/ReviewOrder";
import { Steps } from "./Steps";


interface Props extends CreateOrderModalArgs {
  className?: string
}
export const CreateOrderModal = ({ className = "", ...rest }: Props) => {
  const { mutate: onSubmit, swapState } = useSubmitOrderFlow();

  let content = <ReviewOrder onSubmit={onSubmit} />;
  if (swapState === "failed") {
    content = <Failed />;
  }

  if (swapState === "loading") {
    content = <SwapPending />;
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

CreateOrderModal.Price = Price;
CreateOrderModal.Expiry = Expiry;
CreateOrderModal.ChunksAmount = ChunksAmount;
CreateOrderModal.ChunkSize = ChunkSize;
CreateOrderModal.MinDestAmount = MinDestAmount;
CreateOrderModal.TradeInterval = TradeInterval;
CreateOrderModal.Recipient = Recipient;
CreateOrderModal.TwapDetails = TwapDetails;
CreateOrderModal.LimitDetails = LimitDetails;
CreateOrderModal.SubmitButton = SubmitButton;
CreateOrderModal.Review = ReviewOrder;

export const SwapPending = () => {
  const swapSteps = useTwapStore((s) => s.swapSteps);

  if (_.size(swapSteps) === 1) {
    return <ConfirmOrder />;
  }

  return (
    <>
      <TokensPreview />
      <StyledSwapPendingBorder />
      <Steps />
    </>
  );
};

const StyledSwapPendingBorder = styled(Separator)({
  margin: "20px 0px",
});

const StyledContainer = styled(StyledColumnFlex)({
  gap: 0,
});
