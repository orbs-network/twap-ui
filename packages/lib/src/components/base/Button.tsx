import { useMemo } from "react";
import { styled } from "styled-components";
import { useTwapContext } from "../../context/context";
import { ButtonProps } from "../../types";
import { Spinner } from "./Spinner";

function Button(props: ButtonProps) {
  const { children, disabled = false, onClick, loading = false, className = "", allowClickWhileLoading } = props;
  const {
    Components: { Button },
  } = useTwapContext();

  if (Button) {
    return <Button {...props}>{children}</Button>;
  }

  const _disabled = useMemo(() => {
    if (disabled) {
      return true;
    }
    if (loading && !allowClickWhileLoading) {
      return true;
    }
    return false;
  }, [allowClickWhileLoading, disabled, loading]);
  return (
    <StyledContainer
      onClick={onClick}
      className={`twap-button ${loading ? "twap-button-loading" : ""} ${disabled ? "twap-button-disabled" : ""} ${className}`}
      disabled={_disabled}
    >
      {loading && (
        <StyledLoader className="twap-button-loader">
          <Spinner className="twap-button-loader" />
        </StyledLoader>
      )}
      <StyledChildren className="twap-button-children">{children}</StyledChildren>
    </StyledContainer>
  );
}

const StyledLoader = styled("div")({
  left: "50%",
  top: "55%",
  transform: "translate(-50%, -50%) scale(0.8)",
  position: "absolute",
});

const StyledContainer = styled("button")<{ disabled: boolean }>(({ disabled }) => ({
  position: "relative",
  width: "100%",
  border: "unset",
  fontWeight: 600,
  cursor: disabled ? "unset" : "pointer",
  fontSize: 16,
  opacity: disabled ? 0.6 : 1,
  transition: "0.2s all",
}));

const StyledChildren = styled("div")({});

export default Button;
