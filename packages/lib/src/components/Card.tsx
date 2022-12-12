import { Box, styled } from "@mui/system";
import { CSSProperties, ReactNode } from "react";

const Card = ({ children, className = "", style = {} }: { children: ReactNode; className?: string, style?: CSSProperties }) => {
  return (
    <StyledContainer style={style} className={`twap-card ${className}`}>
      {children}
    </StyledContainer>
  );
};

export default Card;

const StyledContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  width: "100%",
});
