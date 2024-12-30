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

  if (subtitle) {
    return (
      <StyledColumnFlex className={`twap-label ${className}`}>
        <StyledText style={{ fontSize }}>{children}</StyledText>
        <Typography>{tooltipText}</Typography>
      </StyledColumnFlex>
    );
  }
  return (
    <StyledContainer className={`twap-label ${tooltipText ? "twap-label-with-tooltip" : ""} ${className}`} style={{ gap: 0 }}>
      {tooltipText ? (
        <Tooltip placement={placement} text={tooltipText}>
          <StyledText style={{ fontSize }}>{children}</StyledText>
        </Tooltip>
      ) : (
        <StyledText style={{ fontSize }}>{children}</StyledText>
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
