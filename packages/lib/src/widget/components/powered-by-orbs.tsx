import { useState } from "react";
import { StyledRowFlex, StyledText } from "../../styles";
import React from "react";
import { ORBS_LOGO, ORBS_LOGO_FALLBACK } from "../../consts";
import { Portal } from "../../components/base";
import { styled } from "styled-components";
import { useTwapContext } from "../../context";

export function PoweredbyOrbsPortal() {
  const [url, setUrl] = useState(ORBS_LOGO);
  const translations = useTwapContext().translations;

  const onError = () => {
    setUrl(ORBS_LOGO_FALLBACK);
  };

  return (
    <Portal containerId="twap-powered-by-container">
      <StyledPoweredBy className={` twap-powered-by`}>
        <a href="https://www.orbs.com/" target="_blank">
          <StyledText>{translations.poweredBy}</StyledText>
          <img src={url} onError={onError} />
        </a>
      </StyledPoweredBy>
    </Portal>
  );
}

export const PoweredByOrbs = () => {
  return <div id="twap-powered-by-container" />;
};

const StyledPoweredBy = styled(StyledRowFlex)({
  marginTop: 10,
  marginBottom: 10,
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
