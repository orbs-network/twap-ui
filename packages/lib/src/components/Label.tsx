import { Box, styled } from "@mui/system";
import React, { ReactElement, ReactNode } from "react";
import Tooltip from "./Tooltip";
import { SlInfo } from "react-icons/sl";
import Icon from "./Icon";
import { StyledOneLineText } from "../styles";

interface Props {
  children: string | number | ReactNode;
  tooltipText?: string | ReactElement;
  className?: string;
  fontSize?: number;
  iconStart?: ReactElement;
}

function Label({ children, tooltipText, className = "", fontSize, iconStart }: Props) {
  if (tooltipText) {
    return (
      <Tooltip text={tooltipText}>
        <StyledTooltipContent className={`twap-label ${className}`}>
          {iconStart}
          <StyledLabel style={{ fontSize }}>{children}</StyledLabel>
          <Icon icon={<SlInfo className="twap-tooltip-icon" style={{ width: 14, height: 14 }} />} />
        </StyledTooltipContent>
      </Tooltip>
    );
  }
  return <StyledLabel className={`twap-label ${className}`}>{children}</StyledLabel>;
}

export default Label;

const StyledTooltipContent = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 5,
});

const StyledLabel = styled(StyledOneLineText)({
  fontSize: "inherit",
  fontFamily: "inherit",
});
