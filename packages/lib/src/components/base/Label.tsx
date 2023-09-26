import { Box, styled } from "@mui/system";
import React, { ReactElement, ReactNode } from "react";
import Tooltip from "./Tooltip";
import { SlInfo } from "react-icons/sl";
import Icon from "./Icon";
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
  const { uiPreferences } = useTwapContext();

  const InfoIcon = uiPreferences.infoIcon || SlInfo;
  if (subtitle) {
    return (
      <StyledColumnFlex className={`twap-label ${className}`}>
        <StyledLabel style={{ fontSize }}>{children}</StyledLabel>
        <Typography>{tooltipText}</Typography>
      </StyledColumnFlex>
    );
  }
  return (
    <StyledContainer className={`twap-label ${className}`}>
      <StyledLabel style={{ fontSize }}>
        {children}
        {tooltipText && (
          <Tooltip placement={placement} text={tooltipText}>
            <InfoIcon className="twap-icon twap-tooltip-icon" style={{ width: 14, height: 14, position: "relative", top: 2, marginLeft: 5 }} />
          </Tooltip>
        )}
      </StyledLabel>
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
