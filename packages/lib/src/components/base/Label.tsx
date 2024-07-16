import { styled } from "@mui/system";
import { ReactElement, ReactNode } from "react";
import Tooltip from "./Tooltip";

import { AiOutlineQuestionCircle } from "@react-icons/all-files/ai/AiOutlineQuestionCircle";

import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { Typography } from "@mui/material";
import { useTwapContext } from "../../context/context";

interface Props {
  children: string | number | ReactNode;
  tooltipText?: string | ReactElement;
  className?: string;
  fontSize?: number;
  subtitle?: boolean;
  placement?: "bottom-end" | "bottom-start" | "bottom" | "left-end" | "left-start" | "left" | "right-end" | "right-start" | "right" | "top-end" | "top-start" | "top";
}

function Label({ children, tooltipText, className = "", fontSize, placement = "right", subtitle }: Props) {
  const uiPreferences = useTwapContext()?.uiPreferences;

  const InfoIcon = uiPreferences?.infoIcon || <AiOutlineQuestionCircle />;

  if (subtitle) {
    return (
      <StyledColumnFlex className={`twap-label ${className}`}>
        <StyledLabel style={{ fontSize }} className="twap-label-text">
          {children}
        </StyledLabel>
        <Typography>{tooltipText}</Typography>
      </StyledColumnFlex>
    );
  }
  return (
    <StyledContainer className={`twap-label ${className}`} style={{ gap: 0 }}>
      {tooltipText ? (
        <Tooltip placement={placement} text={tooltipText}>
          <StyledTooltipContent>
            <>
              <StyledLabel className="twap-label-text" style={{ fontSize }}>
                {children}
              </StyledLabel>
              {InfoIcon}
            </>
          </StyledTooltipContent>
        </Tooltip>
      ) : (
        <StyledLabel className="twap-label-text" style={{ fontSize }}>
          {children}
        </StyledLabel>
      )}
    </StyledContainer>
  );
}

export default Label;

const StyledTooltipContent = styled(StyledRowFlex)({
  alignItems: "center",
  gap: 5
});

const StyledContainer = styled(StyledRowFlex)({
  justifyContent: "flex-start",
  gap: 7,
  width: "fit-content",
});

const StyledLabel = styled(StyledText)({
  fontSize: "inherit",
  fontFamily: "inherit",
});
