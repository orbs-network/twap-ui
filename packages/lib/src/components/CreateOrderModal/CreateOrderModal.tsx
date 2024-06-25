import { styled } from "@mui/material";
import _ from "lodash";
import { useTwapContext } from "../../context";
import { useOneWaySubmit, useSwapSteps } from "../../hooks";
import { useTwapStore } from "../../store";
import { StyledColumnFlex } from "../../styles";
import { Button } from "../base";
import { Separator, TokensPreview } from "./Components";
import { ConfirmOrder } from "./ConfirmOrder";
import { AcceptDisclaimer, ChunksAmount, ChunkSize, Details, Expiry, LimitDetails, MinDestAmount, Price, Recipient, TradeInterval, TwapDetails } from "./Details";
import { OrderSubmitted } from "./OrderSubmitted";
import { Steps } from "./Steps";
import { SwapFailed } from "./SwapFailed";
import { TokenDisplay } from "./TokenDisplay";

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

const SubmitButton = ({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) => {
  const t = useTwapContext().translations;
  const { isLoading, disclaimerAccepted } = useTwapStore((s) => ({
    isLoading: s.swapState === "loading",
    disclaimerAccepted: s.disclaimerAccepted,
  }));
  return (
    <Button onClick={onClick} loading={isLoading} disabled={!disclaimerAccepted}>
      {t.placeOrder}
    </Button>
  );
};

export const CreateOrderModal = () => {
  const { swapState, mutate: onSubmit } = useOneWaySubmit();
  const { createOrdertxHash } = useTwapStore((s) => ({
    createOrdertxHash: s.createOrdertxHash,
  }));

  let content = <Review onSubmit={onSubmit} />;
  if (swapState === "failed") {
    content = <SwapFailed />;
  }

  if (swapState === "loading" && !createOrdertxHash) {
    content = <SwapPending />;
  }
  if (createOrdertxHash) {
    content = <OrderSubmitted />;
  }

  return <StyledContainer>{content}</StyledContainer>;
};

CreateOrderModal.TokenDisplay = TokenDisplay;
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
  const { steps } = useSwapSteps();

  if (_.size(steps) === 1) {
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
