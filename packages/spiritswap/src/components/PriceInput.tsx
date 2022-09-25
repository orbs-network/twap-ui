import { Box, Typography } from "@mui/material";
import { styled } from "@mui/system";
import React, { useState } from "react";

import { StyledBorderWrapper, StyledShadowContainer } from "../styles";
import TWAPLib from "@orbs-network/twap-ui";

function PriceInput() {
  const [open, setOpen] = useState(false);
  const { address: srcTokenAddress } = TWAPLib.actions.useSrcToken();
  const { address: dstTokenAddress } = TWAPLib.actions.useDstToken();
  return (
    <StyledContainer>
      <StyledTop>
        <StyledTitle>
          <TWAPLib.components.InfoIconTooltip text="some-text">
            <TWAPLib.components.CustomSwitch value={open} onChange={() => setOpen(!open)} />
            <Typography>Limit price</Typography>
          </TWAPLib.components.InfoIconTooltip>
        </StyledTitle>
        <StyledNoneText fontWeight={500}>None</StyledNoneText>
      </StyledTop>
      {open && (
        <StyledBottom>
          <TWAPLib.components.TokenDisplay address={srcTokenAddress} />
          <TWAPLib.components.AmountInput value="" onChange={() => {}} />
          <TWAPLib.components.TokenDisplay address={dstTokenAddress} />
        </StyledBottom>
      )}
    </StyledContainer>
  );
}

export default PriceInput;

const StyledBottom = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  padding: "0px 20px",
  "& .input": {
    bordeBottom: "1px solid black",
  },
});

const StyledContainer = styled(StyledBorderWrapper)({
  display: "flex",
  flexDirection: "column",
  gap: 20,
  height: "auto",
});

const StyledNoneText = styled(Typography)({
  fontSize: 14,
});

const StyledTop = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  width: "100%",
  alignItems: "center",
  paddingRight: 10,
});

const StyledTitle = styled(StyledShadowContainer)({
  paddingRight: 20,
  paddingLeft: 14,
});
