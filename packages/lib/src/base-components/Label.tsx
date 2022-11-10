import { Box, styled } from "@mui/system";
import React, { ReactElement, ReactNode } from "react";
import Tooltip from "./Tooltip";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import Icon from "./Icon";
import { Typography } from "@mui/material";

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
          <Icon icon={<AiOutlineQuestionCircle className="twap-tooltip-icon" style={{ width: 16, height: 16 }} />} />
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

const StyledLabel = styled(Typography)({
  // whiteSpace: "nowrap",
});
