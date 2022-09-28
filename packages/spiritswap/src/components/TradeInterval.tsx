import { Typography, IconButton } from "@mui/material";
import { styled } from "@mui/system";
import { StyledBorderWrapper, StyledShadowContainer } from "../styles";
import TWAPLib from "@orbs-network/twap-ui";

function TradeInterval() {
  const { tradeIntervalFormat, tradeIntervalMillis, tradeIntervalEnabled } = TWAPLib.state();
  const { onTradeIntervalChange } = TWAPLib.actions();

  return (
    <StyledContainer>
      <StyledTitle>
        <TWAPLib.components.InfoIconTooltip text="some-text">
          <Typography>Trade Interval</Typography>
        </TWAPLib.components.InfoIconTooltip>
      </StyledTitle>
      <IconButton>
        <Typography>Edit</Typography>
      </IconButton>
      <TWAPLib.components.TimeSelect onChange={onTradeIntervalChange} millis={tradeIntervalMillis} timeFormat={tradeIntervalFormat} />
    </StyledContainer>
  );
}

export default TradeInterval;

const StyledContainer = styled(StyledBorderWrapper)({});

const StyledTitle = styled(StyledShadowContainer)({
  paddingRight: 20,
  paddingLeft: 14,
});
