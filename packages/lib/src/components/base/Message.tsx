import { styled } from "styled-components";
// import { RiErrorWarningLine } from "@react-icons/all-files/io/RiErrorWarningLine";
import { RiErrorWarningLine } from "@react-icons/all-files/ri/RiErrorWarningLine";

import React, { ReactNode, useMemo } from "react";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { MessageVariant } from "../../types";
import { useWidgetContext } from "../../widget/widget-context";

export function Message({ text, className = "", variant, title }: { variant?: MessageVariant; title: ReactNode; text?: ReactNode; className?: string }) {
  const { uiPreferences } = useWidgetContext();

  const _className = useMemo(() => {
    switch (variant) {
      case "error":
        return "twap-error-message";
      case "warning":
        return "twap-warning-message";

      default:
        return "";
    }
  }, [variant]);

  const icon = useMemo(() => {
    switch (variant) {
      case "error":
        return uiPreferences.message?.errorIcon || <RiErrorWarningLine className="twap-message-icon" />;
      case "warning":
        return uiPreferences.message?.warningIcon || <RiErrorWarningLine className="twap-message-icon" />;

      default:
        return undefined;
    }
  }, [variant, uiPreferences.message]);

  return (
    <Container className={`twap-message ${_className} ${className}`}>
      {icon && icon}
      <StyledColumnFlex className="twap-message-right">
        <StyledText className="twap-message-title">{title}</StyledText>
        {text && <StyledText className="twap-message-text">{text}</StyledText>}
      </StyledColumnFlex>
    </Container>
  );
}

const Container = styled(StyledRowFlex)({
  gap: 7,
  alignItems: "flex-start",
  ".twap-message-right": {
    flex: 1,
    width: "auto",
  },
  svg: {},
});
