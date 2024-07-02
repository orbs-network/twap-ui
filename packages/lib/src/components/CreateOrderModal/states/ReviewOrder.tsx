import { styled } from "@mui/material";
import { StyledColumnFlex } from "../../../styles";
import { Separator, SubmitButton, TokensPreview } from "../Components";
import { AcceptDisclaimer, Details } from "../Details";

export function ReviewOrder({ onSubmit, className = "" }: { onSubmit: () => void; className?: string }) {
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
