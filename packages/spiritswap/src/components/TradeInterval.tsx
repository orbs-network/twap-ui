import { Typography } from "@mui/material";
import { styled } from "@mui/system";
import { StyledBorderWrapper, StyledShadowContainer } from "../styles";
import TWAPLib from "@orbs-network/twap-ui";

function TradeInterval() {
  const { setMillis, millis, timeFormat, setTimeFormat } = TWAPLib.actions.useTradeInterval();
  return (
    <StyledContainer>
      <StyledTitle>
        <TWAPLib.components.InfoIconTooltip text="some-text">
          <Typography>Trade Interval</Typography>
        </TWAPLib.components.InfoIconTooltip>
      </StyledTitle>
      <TWAPLib.components.TimeSelect setMillis={setMillis} millis={millis} timeFormat={timeFormat} setTimeFormat={setTimeFormat} />
    </StyledContainer>
  );
}

export default TradeInterval;

const StyledContainer = styled(StyledBorderWrapper)({});

const StyledTitle = styled(StyledShadowContainer)({
  paddingRight: 20,
  paddingLeft: 14,
});
