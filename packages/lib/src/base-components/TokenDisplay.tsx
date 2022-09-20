import { Typography } from "@mui/material";
import { Box, styled } from "@mui/system";
import { CSSProperties } from "react";
import { StyledSmallTitle } from "../styles";

interface props {
  address: string;
  imageSize?: string;
}

function TokenDisplay({ address, imageSize }: props) {
  return (
    <StyledContainer>
      <StyledLogo size={imageSize} src={""} />
      <StyledSmallTitle>{address}</StyledSmallTitle>
    </StyledContainer>
  );
}

export default TokenDisplay;

const StyledContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 6,
  justifyContent: "center",
});

const StyledLogo = styled("img")(({ size }: { size?: string }) => ({
  width: size || 30,
  height: size || 30,
}));
