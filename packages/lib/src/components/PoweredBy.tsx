import { Typography } from "@mui/material";
import { Box, styled } from "@mui/system";
import React from "react";
import { useTwapTranslations } from "../hooks";

function PoweredBy() {
  const translations = useTwapTranslations();
  return (
    <StyledContainer className="twap-powered-by">
      <Typography>{translations.poweredBy}</Typography>
      <a href="https://www.orbs.com/" target="_blank">
        <img src="https://www.orbs.com/assets/img/common/logo.svg" />
      </a>
    </StyledContainer>
  );
}

export default PoweredBy;

const StyledContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
  marginTop: 10,
  marginBottom: 10,
  "& p": {
    fontSize: 15,
  },
  "& a": {
    width: 24,
    height: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
});
