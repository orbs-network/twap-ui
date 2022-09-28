import { Typography } from "@mui/material";
import { styled } from "@mui/system";
import { StyledBorderWrapper, StyledShadowContainer } from "../styles";
import TWAPLib from "@orbs-network/twap-ui";

function MaxDuration() {
  const { maxDurationFormat, maxDurationMillis } = TWAPLib.state();

  const { onMaxDurationChange } = TWAPLib.actions();

  return (
    <StyledContainer>
      <StyledTitle>
        <TWAPLib.components.InfoIconTooltip text="some-text">
          <Typography>Max Duration</Typography>
        </TWAPLib.components.InfoIconTooltip>
      </StyledTitle>
      <TWAPLib.components.TimeSelect onChange={onMaxDurationChange} millis={maxDurationMillis} timeFormat={maxDurationFormat} />
    </StyledContainer>
  );
}

export default MaxDuration;

const StyledContainer = styled(StyledBorderWrapper)({});

const StyledTitle = styled(StyledShadowContainer)({
  paddingRight: 20,
  paddingLeft: 14,
});
