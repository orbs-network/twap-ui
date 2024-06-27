import { styled } from "@mui/material";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../../styles";
import { Link, SmallTokens } from "../Components";
import { HiArrowCircleUp } from "@react-icons/all-files/hi/HiArrowCircleUp";
import { useOrderType } from "../hooks";

export function OrderSubmitted() {
  return (
    <StyledContainer>
      <Logo>
        <HiArrowCircleUp />
      </Logo>
      <Title />
      <SmallTokens />
      <Link href="/">Learn more</Link>
    </StyledContainer>
  );
}

const Logo = styled(StyledRowFlex)({
  svg: {
    width: 70,
    height: 70,
  },
});

const Title = () => {
  const type = useOrderType();
  return <StyledText className="twap-order-modal-submitted-title">{type} order submitted</StyledText>;
};

const StyledContainer = styled(StyledColumnFlex)({
  gap: 15,
  alignItems: "center",
  ".twap-order-modal-submitted-title": {
    fontSize: 16,
    textTransform: "capitalize",
  },
  ".twap-order-modal-link": {
    marginTop: 30,
  },
});