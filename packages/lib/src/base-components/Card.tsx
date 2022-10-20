import { Box, styled } from "@mui/system";
import { ReactNode } from "react";

const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  return <StyledContainer className={`twap-card ${className}`}>{children}</StyledContainer>;
};

export default Card;

const StyledContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  width: "100%",
});
