import { Box, Fade, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { CSSProperties, ReactNode } from "react";
import Loader from "./Loader";

function SmallLabel({ children, style, loading = false }: { children?: string | ReactNode; style?: CSSProperties; loading?: boolean }) {
  return (
    <StyledContainer style={style} className="twap-small-label">
      <Fade in={loading}>
        <StyledLoader>
          <Loader width="100%" height="100%" />
        </StyledLoader>
      </Fade>

      {children && (
        <Fade in={!loading}>
          <StyledChildren>{children}</StyledChildren>
        </Fade>
      )}
    </StyledContainer>
  );
}

export default SmallLabel;

const StyledChildren = styled(Typography)({
  fontSize: "inherit",
});

const StyledLoader = styled(Box)({
  width: "100%",
  height: 20,
  position: "absolute",
  top: "50%",
  transform: "translate(0, -50%)",
  left: 0,
});

const StyledContainer = styled(Box)({
  position: "relative",
  minWidth: 50,
});
