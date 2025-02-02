import { styled } from "@mui/material";
import { useState } from "react";
import { StyledRowFlex, StyledText } from "../../styles";
import React from "react";
import { ORBS_LOGO, ORBS_LOGO_FALLBACK } from "../../consts";
import { useWidgetContext } from "../widget-context";
export function PoweredByOrbs({ className = "" }: { className?: string }) {
  const [url, setUrl] = useState(ORBS_LOGO);
  const translations = useWidgetContext().translations;

  const onError = () => {
    setUrl(ORBS_LOGO_FALLBACK);
  };

  return (
    <StyledPoweredBy className={`${className} twap-powered-by`}>
      <a href="https://www.orbs.com/" target="_blank">
        <StyledText>{translations.poweredBy}</StyledText>
        <img src={url} onError={onError} />
      </a>
    </StyledPoweredBy>
  );
}

const StyledPoweredBy = styled(StyledRowFlex)({
  marginTop: 10,
  marginBottom: 10,
  "& p": {
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
    width: 20,
    height: 20,
    objectFit: "contain",
  },
});
