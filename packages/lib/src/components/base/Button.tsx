import { Box, CircularProgress, Fade, styled } from "@mui/material";
import { CSSProperties, ReactNode } from "react";

export interface Props extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode;
  style?: CSSProperties;
  disabled?: boolean;
  onClick: (e: any) => void;
  loading?: boolean;
}

function Button({ children, disabled = false, onClick, loading = false, className = "" }: Props) {
  return (
    <StyledContainer onClick={onClick} className={`twap-button ${loading ? "twap-button-loading" : ""} ${disabled ? "twap-button-disabled" : ""} ${className}`} disabled={disabled}>
      {loading && (
        <StyledLoader>
          <CircularProgress style={{ zoom: 0.8 }} className="twap-button-loader" />
        </StyledLoader>
      )}
      <Fade in={!loading}>
        <StyledChildren className="twap-button-children">{children}</StyledChildren>
      </Fade>
    </StyledContainer>
  );
}

const StyledLoader = styled(Box)({
  left: "50%",
  top: "55%",
  transform: "translate(-50%, -50%)",
  position: "absolute",
});

const StyledContainer = styled("button")(({ disabled }: { disabled: boolean }) => ({
  position: "relative",
  width: "100%",
  border: "unset",
  fontWeight: 600,
  cursor: disabled ? "unset" : "pointer",
  fontSize: 16,
  opacity: disabled ? 0.6 : 1,
  transition: "0.2s all",
}));

const StyledChildren = styled(Box)({});

export default Button;
