import { Box, styled } from "@mui/system";
import { ReactNode } from "react";

const Card = ({ children }: { children: ReactNode }) => {
  return <StyledContainer className="twap-card">{children}</StyledContainer>;
};

export default Card;

const StyledContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  width: "100%",
});
