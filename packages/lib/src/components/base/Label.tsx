import { styled } from "@mui/system";
import { ReactElement, ReactNode } from "react";
import Tooltip from "./Tooltip";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { Typography } from "@mui/material";
import Markdown from "./Markdown";

interface Props {
  children: string | number | ReactNode;
  tooltipText?: string | ReactElement;
  className?: string;
  fontSize?: number;
  subtitle?: boolean;
  placement?: "bottom-end" | "bottom-start" | "bottom" | "left-end" | "left-start" | "left" | "right-end" | "right-start" | "right" | "top-end" | "top-start" | "top";
}

function Label({ children, tooltipText, className = "", fontSize, placement, subtitle }: Props) {
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
        <Tooltip
          placement={placement}
          text={
            typeof tooltipText === "string" ? (
              <Markdown components={{ p: ({ children }: { children: any }) => <StyledText style={{ fontSize }}>{children}</StyledText> }}>{tooltipText}</Markdown>
            ) : (
              tooltipText
            )
          }
        >
          <StyledText style={{ fontSize }}>{children}</StyledText>
        </Tooltip>
      ) : (
        <StyledText style={{ fontSize }}>{children}</StyledText>
      )}
      {tooltipText && <DottedBorder />}
    </StyledContainer>
  );
}
export default Label;

const StyledContainer = styled(StyledRowFlex)(() => {
  return {
    justifyContent: "flex-start",
    gap: 7,
    width: "fit-content",
    position: "relative",
  };
});

export const DottedBorder = () => {
  return (
    <StyledDottedBorder>
      {Array(30)
        .fill(0)
        .map((_, i) => (
          <span key={i} className="dotted-border"></span>
        ))}
    </StyledDottedBorder>
  );
};

const StyledDottedBorder = styled(StyledRowFlex)(({ theme }) => {
  return {
    gap: 4,
    width: "100%",
    position: "absolute",
    bottom: -2,
    height: 2,
    left: 0,
    overflow: "hidden",
    "& span": {
      minWidth: 2,
      minHeight: 2,
      background: "#aca4c3",
    },
  };
});
