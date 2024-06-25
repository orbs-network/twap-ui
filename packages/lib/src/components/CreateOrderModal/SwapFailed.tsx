import { Box, styled } from "@mui/material";
import React from "react";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { IoIosWarning } from "@react-icons/all-files/io/IoIosWarning";
import { useTwapContext } from "../../context";
import { SmallTokens } from "./Components";

export function SwapFailed() {
  return (
    <StyledContainer>
      <Logo />
      <Title />
      <SmallTokens />
    </StyledContainer>
  );
}



const Title = () => {
  const { isLimitOrder } = useTwapContext();

  return <StyledTitle>{isLimitOrder ? "Limit failed" : "Twap failed"}</StyledTitle>;
};

const StyledTitle = styled(StyledText)({
    fontSize: 24
});

const Logo = () => {
  return (
    <StyledLogo>
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
