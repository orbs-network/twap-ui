import { Typography, typographyClasses } from "@mui/material";
import { Box, styled } from "@mui/system";
import React from "react";
import AmountInput from "../base-components/AmountInput";
import InfoIconTooltip from "../base-components/InfoIconTooltip";
import TokenDisplay from "../base-components/TokenDisplay";
import { StyledSmallTitle, StyledShadowContainer, StyledColumnGap, StyledBorderWrapper } from "../styles";

function TradeSize() {
  return (
    <StyledContainer gap={10}>
      <StyledTop>
        <StyledTitle>
          <InfoIconTooltip text="some text">
            <StyledSmallTitle>Trade size</StyledSmallTitle>
          </InfoIconTooltip>
        </StyledTitle>
        <StyledInput>
          <AmountInput value="" onChange={() => {}} />
        </StyledInput>
        <TokenDisplay address={""} />
      </StyledTop>
      <StyledBottom>
        <StyledTotalTrades>Total trades: 0</StyledTotalTrades>
      </StyledBottom>
    </StyledContainer>
  );
}

export default TradeSize;

const StyledTitle = styled(StyledShadowContainer)({
  justifyContent: "flex-start",
  paddingLeft: 14,
});

const StyledContainer = styled(StyledColumnGap)({});

const StyledTop = styled(StyledBorderWrapper)({
  paddingRight: 15,
});
const StyledInput = styled(Box)({
  flex: 1,
});

const StyledBottom = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
});

const StyledTotalTrades = styled(Typography)({});
