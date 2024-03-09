import { Box, CircularProgress, Fade, styled } from "@mui/material";
import { useTwapContext } from "../../context";
import { ButtonProps } from "../../types";

function Button({ children, disabled = false, onClick, loading = false, className = "" }: ButtonProps) {
  const ContextButton = useTwapContext().uiPreferences.Button;

  if (ContextButton) {
    return (
      <ContextButton disabled={disabled} onClick={onClick} loading={loading} className={className}>
        {children}
      </ContextButton>
    );
  }

  return (
    <StyledContainer onClick={onClick} className={`twap-button ${loading ? "twap-button-loading" : ""} ${disabled ? "twap-button-disabled" : ""} ${className}`} disabled={disabled}>
      {loading && (
        <StyledLoader className="twap-button-loader">
          <CircularProgress className="twap-button-loader" />
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
  transform: "translate(-50%, -50%) scale(0.8)",
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
