import { Box, styled } from "@mui/system";
import React, { forwardRef, ReactNode } from "react";

const Card = forwardRef(({ children }: { children: ReactNode }, ref) => {
  return (
    <StyledContainer className="twap-card" ref={ref}>
      {children}
    </StyledContainer>
  );
});

export default Card;

const StyledContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  width: "100%",
});
