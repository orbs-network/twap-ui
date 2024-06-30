import { styled } from "@mui/material";
import { ReactNode } from "react";
import { StyledColumnFlex } from "../../styles";

export const BottomContent = ({ children }: { children: ReactNode }) => {
  return <StyledBottomText className="twap-card-bottom-content">{children}</StyledBottomText>;
};

const StyledBottomText = styled(StyledColumnFlex)({
  marginTop: 10,
  gap: 5,
  ".twap-warning-message": {
    gap: 5,
  },
  ".twap-warning-message-icon": {
    width: 18,
    height: 18,
    color: "rgb(255, 95, 82)",
  },
});
