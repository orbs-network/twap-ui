import { CSSProperties, ReactNode } from "react";
import { styled } from "styled-components";
import { StyledOneLineText } from "../../styles";
import { Loader } from "./Loader";

function SmallLabel({ children, style, loading = false, className = "" }: { children?: string | ReactNode; style?: CSSProperties; loading?: boolean; className?: string }) {
  return (
    <StyledContainer style={style} className={`twap-small-label ${className}`}>
      {loading && <Loader width="100%" height="100%" />}

      {!loading && <StyledChildren>{children}</StyledChildren>}
    </StyledContainer>
  );
}

export default SmallLabel;

const StyledChildren = styled(StyledOneLineText)({
  fontSize: "inherit",
  fontFamily: "inherit",
});

const StyledLoader = styled(Loader)({
  width: 50,
  height: 20,
});

const StyledContainer = styled("div")({
  position: "relative",
  display: "flex",
  alignItems: "center",
});
