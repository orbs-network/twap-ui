import { Tooltip } from "../components";
import { useTwapContext } from "../context";
import { handleFillDelayText, useTwapStore } from "../store";
import { StyledRowFlex, StyledText } from "../styles";
import { AiOutlineWarning } from "react-icons/ai";
import { styled } from "@mui/system";

const Warning = ({ tootlip, warning }: { tootlip: string; warning: string }) => {
  return (
    <Tooltip text={tootlip}>
      <StyledWarning justifyContent="flex-start" gap={5} className="twap-warning">
        <StyledText>{warning}</StyledText>
        <AiOutlineWarning />
      </StyledWarning>
    </Tooltip>
  );
};

export const PartialFillWarning = () => {
  const translations = useTwapContext().translations;
  const isWarning = useTwapStore((state) => state.getIsPartialFillWarning());
  if (!isWarning) return null;

  return <Warning tootlip={translations.prtialFillWarningTooltip} warning={translations.prtialFillWarning} />;
};

export const FillDelayWarning = () => {
  const translations = useTwapContext().translations;
  const fillDelayWarning = useTwapStore((store) => store.getFillDelayWarning());
  const minimumDelayMinutes = useTwapStore((store) => store.getMinimumDelayMinutes());
  if (!fillDelayWarning) return null;

  return <Warning tootlip={handleFillDelayText(translations.fillDelayWarningTooltip, minimumDelayMinutes)} warning={translations.invalid} />;
};

const StyledWarning = styled(StyledRowFlex)({
  p: {
    fontSize: 14,
    color: "#dc3545",
  },
  "& *": {
    fill: "#dc3545",
  },
});
