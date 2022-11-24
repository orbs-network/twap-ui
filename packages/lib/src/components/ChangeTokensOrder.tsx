import { Box } from "@mui/material";
import { styled } from "@mui/system";
import { ReactNode } from "react";

function ChangeTokensOrder({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <StyledContainer onClick={onClick} className="twap-change-order">
      <StyledChildren>{children}</StyledChildren>
    </StyledContainer>
  );
}

export default ChangeTokensOrder;

const StyledChildren = styled(Box)({});

const StyledContainer = styled("button")({
  borderRadius: "50%",
  border: "unset",
  marginLeft: "auto",
  marginRight: "auto",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});
