import { styled } from "@mui/material";
import _ from "lodash";
import { useSubmitOrderButton } from "../../hooks/useSubmitOrderButton";
import { useSubmitOrderOneFlow } from "../../hooks/useTransactions";
import { useTwapStore } from "../../store";
import { StyledColumnFlex } from "../../styles";
import { Button } from "../base";
import { Separator, TokensPreview } from "./Components";
import { AcceptDisclaimer, ChunksAmount, ChunkSize, Details, Expiry, LimitDetails, MinDestAmount, Price, Recipient, TradeInterval, TwapDetails } from "./Details";
import { OrderSubmitted, ConfirmOrder, Failed } from "./states";
import { Steps } from "./Steps";

export function Review({ onSubmit, className = "" }: { onSubmit: () => void; className?: string }) {
  return (
    <StyledReview className={className}>
      <TokensPreview />
      <Separator />
      <Details />
      <Separator />
      <AcceptDisclaimer />
      <SubmitButton onClick={onSubmit} />
    </StyledReview>
  );
}

const StyledReview = styled(StyledColumnFlex)({
  gap: 0,
  ".twap-order-modal-separator": {
    margin: "20px 0px",
  },
  ".twap-order-modal-details": {
    gap: 5,
  },
  ".twap-order-modal-disclaimer": {
    marginBottom: 20,
  },
});

const SubmitButton = ({ onClick }: { onClick: () => void }) => {
  const button = useSubmitOrderButton(onClick);

  return (
    <Button onClick={button.onClick} loading={button.loading} disabled={button.disabled}>
      {button.text}
    </Button>
  );
};

export const CreateOrderModal = () => {
  const { mutate: onSubmit, swapState, createOrdertxHash } = useSubmitOrderOneFlow();

  let content = <Review onSubmit={onSubmit} />;
  if (swapState === "failed") {
    content = <Failed />;
  }

  if (swapState === "loading") {
    content = <SwapPending />;
  }
  if (swapState === "success") {
    content = <OrderSubmitted />;
  }

  return <StyledContainer>{content}</StyledContainer>;
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
CreateOrderModal.Review = Review;

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
