import { styled } from "@mui/material";
import { StyledColumnFlex, StyledText } from "../../../styles";
import { Spinner } from "../../base";
import { SmallTokens } from "../Components";
import { useOrderType } from "../hooks";

export function ConfirmOrder() {
  return (
    <StyledContainer>
      <Spinner size={55} />
      <Title />
      <SmallTokens />
      <StyledText className="twap-order-modal-confirm-bottom">Proceed in your wallet</StyledText>
    </StyledContainer>
  );
}

const Title = () => {
  const type = useOrderType();
  return <StyledText className="twap-order-modal-confirm-title">Confirm {type} order</StyledText>;
};

const StyledContainer = styled(StyledColumnFlex)({
  gap: 15,
  alignItems: "center",
  ".twap-order-modal-confirm-title": {
    fontSize: 16,
  },
  ".twap-order-modal-confirm-bottom": {
    marginTop: 30,
    color: "rgb(155, 155, 155)",
    fontSize: 14,
  },
});
