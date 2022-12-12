import { Box, styled } from "@mui/system";
import React, { ReactElement, ReactNode } from "react";
import Tooltip from "./Tooltip";
import { SlInfo } from "react-icons/sl";
import Icon from "./Icon";
import { StyledOneLineText } from "../styles";
import { Styles } from "..";

interface Props {
  children: string | number | ReactNode;
  tooltipText?: string | ReactElement;
  className?: string;
  fontSize?: number;
  iconStart?: ReactElement;
  placement?: "bottom-end" | "bottom-start" | "bottom" | "left-end" | "left-start" | "left" | "right-end" | "right-start" | "right" | "top-end" | "top-start" | "top";
}

function Label({ children, tooltipText, className = "", fontSize, iconStart, placement }: Props) {
  if (tooltipText) {
    return (
      <StyledContainer>
        <StyledLabel style={{ fontSize }}>{children}</StyledLabel>
        <Tooltip placement={placement} text={tooltipText}>
          <StyledTooltipContent className={`twap-label ${className}`}>
            {iconStart}
            <Icon icon={<SlInfo className="twap-tooltip-icon" style={{ width: 14, height: 14 }} />} />
          </StyledTooltipContent>
        </Tooltip>
      </StyledContainer>
    );
  }
  return <StyledLabel className={`twap-label ${className}`}>{children}</StyledLabel>;
}

export default Label;

const StyledContainer = styled(Styles.StyledRowFlex)({
  justifyContent:'flex-start',
  gap: 7,
  width:'fit-content'
})

const StyledTooltipContent = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 5,
});

const StyledLabel = styled(StyledOneLineText)({
  fontSize: "inherit",
  fontFamily: "inherit",
});
