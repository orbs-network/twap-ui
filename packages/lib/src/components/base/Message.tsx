import { styled } from "@mui/material";
import { AiOutlineWarning } from "@react-icons/all-files/ai/AiOutlineWarning";
import { IoIosWarning } from "@react-icons/all-files/io/IoIosWarning";
import { ReactNode } from "react";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { MessageVariant } from "../../types";

interface Props {
  variant?: MessageVariant;
  title: ReactNode;
  text?: ReactNode;
  className?: string;
}

export function Message({ text, className = "", variant, title }: Props) {
  if (variant === "error") {
    return (
      <Container className={className}>
        <StyledError className="twap-error-message">
          <AiOutlineWarning className="twap-error-message-icon" />
          <StyledColumnFlex className="twap-error-message-right">
            <StyledText className="twap-error-message-title">{title}</StyledText>
            {text && <StyledText className="twap-error-message-text">{text}</StyledText>}
          </StyledColumnFlex>
        </StyledError>
      </Container>
    );
  }

  if (variant === "warning") {
    return (
      <Container className={className}>
        <StyledWarning className="twap-warning-message">
          <IoIosWarning className="twap-warning-message-icon" />
          <StyledText className="twap-warning-message-title">{title}</StyledText>
        </StyledWarning>
      </Container>
    );
  }

  return (
    <Container className={className}>
      <StyledMessage className="twap-message">{title}</StyledMessage>
    </Container>
  );
}

const Container = styled("div")({
  a: {
    color: "rgb(252, 114, 255)",
    textDecoration: "none",
    transition: "opacity 0.2s",
    "&:hover": {
      opacity: 0.8,
    },
  },
});

const StyledMessage = styled(StyledText)({
  fontSize: 14,
});
const StyledError = styled(StyledRowFlex)({
  gap: 15,
  alignItems: "center",
  ".twap-error-message-icon": {
    width: 20,
    height: 20,
    color: "rgb(255, 95, 82)",
  },
  ".twap-error-message-right": {
    gap: 0,
    flex: 1,
    width: "auto",
  },
  ".twap-error-message-title": {
    fontSize: 16,
    lineHeight: "23px",
  },
  ".twap-error-message-text": {
    fontSize: 14,
    lineHeight: "19px",
    color: "rgb(155, 155, 155)",
  },
});

const StyledWarning = styled(StyledRowFlex)({
  alignItems: "flex-start",
  ".twap-warning-message-icon": {
    width: 20,
    height: 20,
  },
  ".twap-warning-message-title": {
    fontSize: 14,
    lineHeight: "19px",
    flex: 1,
  },
});
