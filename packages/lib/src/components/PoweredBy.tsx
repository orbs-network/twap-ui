import { Typography } from "@mui/material";
import { Box, styled } from "@mui/system";
import React from "react";
import { useTwapContext } from "../context";

function PoweredBy() {
  const translations = useTwapContext().translations;
  return (
    <StyledContainer className="twap-powered-by">
      <a href="https://www.orbs.com/" target="_blank">
        <Typography>{translations.poweredBy}</Typography>

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

  marginTop: 10,
  marginBottom: 10,
  "& p": {
    fontSize: 15,
    color: "inherit",
  },
  "& a": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "unset",
    gap: 8,
  },
  "& img": {
    width: 24,
    height: 24,
    objectFit: "contain",
  },
});
