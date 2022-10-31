import { Box, styled } from "@mui/system";
import React, { ReactElement, ReactNode } from "react";
import Tooltip from "./Tooltip";
import { AiOutlineInfoCircle } from "react-icons/ai";
import Icon from "./Icon";
import { Typography } from "@mui/material";

interface Props {
  children: string;
  tooltipText?: string | ReactElement;
  className?: string;
}

function Label({ children, tooltipText, className }: Props) {
  if (tooltipText) {
    return (
      <Tooltip text={tooltipText}>
        <StyledTooltipContent>
          <StyledLabel className={`twap-label ${className}`}>{children}</StyledLabel>
          <Icon icon={<AiOutlineInfoCircle style={{ width: 15, height: 15 }} />} />
        </StyledTooltipContent>
      </Tooltip>
    );
  }
  return <StyledLabel>{children}</StyledLabel>;
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
