import { Typography } from "@mui/material";
import { Box, styled } from "@mui/system";
import React from "react";
import AmountInput from "../base-components/AmountInput";
import InfoIconTooltip from "../base-components/InfoIconTooltip";
import TokenDisplay from "../base-components/TokenDisplay";
import { useActionHandlers, useTradeSize } from "../store/store";
import { StyledSmallTitle, StyledShadowContainer, StyledColumnGap, StyledBorderWrapper, StyledSmallTextDetail } from "../styles";

function TradeSize() {
  const {tradeSizeForUi, totalTradesForUi} = useTradeSize()
  const {onTradeSizeChange} = useActionHandlers()

  

  return (
    <StyledContainer gap={10}>
      <StyledTop>
        <StyledTitle>
          <InfoIconTooltip text="some text">
            <StyledSmallTitle>Trade size</StyledSmallTitle>
          </InfoIconTooltip>
        </StyledTitle>
        <StyledInput>
          <AmountInput value={tradeSizeForUi} onChange={(values) => onTradeSizeChange(values.value)} />
        </StyledInput>
        <TokenDisplay address={""} />
      </StyledTop>
      <StyledBottom>
        <StyledSmallTextDetail>Total trades: {totalTradesForUi}</StyledSmallTextDetail>
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
