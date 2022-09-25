import { Typography } from "@mui/material";
import { styled } from "@mui/system";
import { StyledBorderWrapper, StyledShadowContainer } from "../styles";
import TWAPLib from "@orbs-network/twap-ui";

function MaxDuration() {
  const { millis, timeFormat, setTimeFormat } = TWAPLib.actions.useMaxDuration();

  const { onMaxDurationChange } = TWAPLib.actions.useActionHandlers();

  return (
    <StyledContainer>
      <StyledTitle>
        <TWAPLib.components.InfoIconTooltip text="some-text">
          <Typography>Max Duration</Typography>
        </TWAPLib.components.InfoIconTooltip>
      </StyledTitle>
      <TWAPLib.components.TimeSelect setMillis={onMaxDurationChange} millis={millis} timeFormat={timeFormat} setTimeFormat={setTimeFormat} />
    </StyledContainer>
  );
}

export default MaxDuration;

const StyledContainer = styled(StyledBorderWrapper)({});

const StyledTitle = styled(StyledShadowContainer)({
  paddingRight: 20,
  paddingLeft: 14,
});
