import { Box, styled } from "@mui/system";
import React, { CSSProperties, ReactNode } from "react";

interface Props {
  children: ReactNode;
  style?: CSSProperties;
  disabled?: boolean;
  onClick: () => void;
}

function CustomButton({ children, style = {}, disabled = false, onClick }: Props) {
  return (
    <StyledContainer onClick={onClick} className="button" style={style} disabled={disabled}>
      <StyledChildren>{children}</StyledChildren>
    </StyledContainer>
  );
}

export default CustomButton;

const StyledContainer = styled("button")(({ disabled }: { disabled: boolean }) => ({
  height: "100%",
  width: "100%",
  border: "unset",
  background: disabled ? "transparent" : "linear-gradient(114.98deg, #5D81ED 1.42%, #DB95FF 54.67%, #FF8497 105.73%)",
  boxShadow: "0px 26px 60px rgba(141, 155, 170, 0.05)",
  borderRadius: 26,
  color: disabled ? "#ADB4C0" : "white",
  fontWeight: 600,
  cursor: disabled ? "unset" : "pointer",
  //   opacity: disabled ? 0.6 : 1
}));

const StyledChildren = styled(Box)({});
