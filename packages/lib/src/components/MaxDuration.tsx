import { Typography } from "@mui/material";
import { styled } from "@mui/system";
import InfoIconTooltip from "../base-components/InfoIconTooltip";
import TimeSelect from "../base-components/TimeSelect";
import { useMaxDuration } from "../store/store";
import { StyledBorderWrapper, StyledShadowContainer } from "../styles";

function MaxDuration() {
  const { millis, setMillis, timeFormat, setTimeFormat } = useMaxDuration();

  return (
    <StyledContainer>
      <StyledTitle>
        <InfoIconTooltip text="some-text">
          <Typography>Max Duration</Typography>
        </InfoIconTooltip>
      </StyledTitle>
      <TimeSelect setMillis={setMillis} millis={millis} timeFormat={timeFormat} setTimeFormat={setTimeFormat} />
    </StyledContainer>
  );
}

export default MaxDuration;

const StyledContainer = styled(StyledBorderWrapper)({});

const StyledTitle = styled(StyledShadowContainer)({
  paddingRight: 20,
  paddingLeft: 14,
});
