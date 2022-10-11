import { Typography } from "@mui/material";
import { styled } from "@mui/system";
import { CSSProperties, ReactNode } from "react";

function SmallLabel({ children, style }: { children?: string | ReactNode; style?: CSSProperties }) {
  return (
    <StyledText style={style} className="twap-small-label">
      {children}
    </StyledText>
  );
}

export default SmallLabel;

const StyledText = styled(Typography)({});
