import { styled } from "styled-components";
import { IoIosWarning } from "@react-icons/all-files/io/IoIosWarning";
import React, { ReactNode, useMemo } from "react";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { MessageVariant } from "../../types";

export function Message({ text, className = "", variant, title }: { variant?: MessageVariant; title: ReactNode; text?: ReactNode; className?: string }) {
  const _className = useMemo(() => {
    switch (variant) {
      case "error":
        return "twap-message-error";
      case "warning":
        return "twap-message-warning";

      default:
        return "";
    }
  }, [variant]);

  const icon = useMemo(() => {
    switch (variant) {
      case "error":
      case "warning":
        return <IoIosWarning className="twap-message-icon" />;

      default:
        return undefined;
    }
  }, [variant]);

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

const Container = styled(StyledRowFlex)({});
