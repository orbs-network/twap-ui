import { Box, styled } from "@mui/system";
import React, { ReactElement, ReactNode } from "react";
import Tooltip from "./Tooltip";
import { SlInfo } from "react-icons/sl";
import Icon from "./Icon";
import { StyledRowFlex, StyledText } from "../../styles";

interface Props {
  children: string | number | ReactNode;
  tooltipText?: string | ReactElement;
  className?: string;
  fontSize?: number;
  placement?: "bottom-end" | "bottom-start" | "bottom" | "left-end" | "left-start" | "left" | "right-end" | "right-start" | "right" | "top-end" | "top-start" | "top";
}

function Label({ children, tooltipText, className = "", fontSize, placement }: Props) {
  return (
    <StyledContainer className={`twap-label ${className}`}>
      <StyledLabel style={{ fontSize }}>{children}</StyledLabel>
      {tooltipText && (
        <Tooltip placement={placement} text={tooltipText}>
          <StyledTooltipContent className={`twap-label-tooltip-content ${className}`}>
            <Icon icon={<SlInfo className="twap-tooltip-icon" style={{ width: 14, height: 14 }} />} />
          </StyledTooltipContent>
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

const StyledTooltipContent = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 5,
});

const StyledLabel = styled(StyledText)({
  fontSize: "inherit",
  fontFamily: "inherit",
});
