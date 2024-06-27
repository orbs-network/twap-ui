import { styled } from "@mui/material";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../../styles";
import { IoIosWarning } from "@react-icons/all-files/io/IoIosWarning";
import { SmallTokens } from "../Components";
import { useOrderType } from "../hooks";

export function Failed() {
  return (
    <StyledContainer>
      <Logo />
      <Title />
      <SmallTokens />
    </StyledContainer>
  );
}

const Title = () => {
  const type = useOrderType();

  return <StyledTitle className="twap-order-modal-failed-title">{`${type} order failed`}</StyledTitle>;
};

const StyledTitle = styled(StyledText)({
  fontSize: 24,
  textTransform: "capitalize",
});

const Logo = () => {
  return (
    <StyledLogo className="twap-order-modal-failed-logo">
      <IoIosWarning />
    </StyledLogo>
  );
};

const StyledLogo = styled(StyledRowFlex)({
  background: "rgba(255, 255, 255, 0.07)",
  width: 48,
  height: 48,
  borderRadius: 12,
  svg: {
    fill: "rgb(155, 155, 155)",
    width: 24,
    height: 24,
  },
});

const StyledContainer = styled(StyledColumnFlex)({
  alignItems: "center",
});
