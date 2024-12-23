import { styled } from "@mui/system";
import { ReactElement, ReactNode } from "react";
import Tooltip from "./Tooltip";

import { AiOutlineQuestionCircle } from "@react-icons/all-files/ai/AiOutlineQuestionCircle";

import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { Typography } from "@mui/material";
import { useTwapContext } from "../../context";

interface Props {
  children: string | number | ReactNode;
  tooltipText?: string | ReactElement;
  className?: string;
  fontSize?: number;
  subtitle?: boolean;
  placement?: "bottom-end" | "bottom-start" | "bottom" | "left-end" | "left-start" | "left" | "right-end" | "right-start" | "right" | "top-end" | "top-start" | "top";
}

function Label({ children, tooltipText, className = "", fontSize, placement, subtitle }: Props) {
  const uiPreferences = useTwapContext()?.uiPreferences;

  const InfoIcon = uiPreferences?.infoIcon || AiOutlineQuestionCircle;

  if (subtitle) {
    return (
      <StyledColumnFlex className={`twap-label ${className}`}>
        <StyledText style={{ fontSize }}>{children}</StyledText>
        <Typography>{tooltipText}</Typography>
      </StyledColumnFlex>
    );
  }
  return (
    <StyledContainer className={`twap-label ${className}`} style={{ gap: 0 }}>
      <StyledText style={{ fontSize }}>{children}</StyledText>
      {tooltipText && (
        <Tooltip placement={placement} text={tooltipText}>
          <InfoIcon className="twap-icon twap-tooltip-icon" style={{ width: 16, position: "relative", top: 3, marginLeft: 5 }} />
        </Tooltip>
      )}
    </StyledContainer>
  );
}

export default Label;

const StyledContainer = styled(StyledRowFlex)({
  justifyContent: "flex-start",
  gap: 7,
  width: "fit-content",
});
