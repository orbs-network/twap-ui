import React, { useMemo } from "react";
import { styled } from "styled-components";
import { ButtonProps } from "../../types";
import { useTwapContext } from "../../context";

function Button(props: ButtonProps) {
  const CustomButton = useTwapContext().components.Button;
  const { children, disabled = false, onClick, loading = false, className = "", allowClickWhileLoading } = props;

  const _disabled = useMemo(() => {
    if (disabled) {
      return true;
    }
    if (loading && !allowClickWhileLoading) {
      return true;
    }
    return false;
  }, [allowClickWhileLoading, disabled, loading]);

  if (CustomButton) {
    return <CustomButton {...props} />;
  }

  return (
    <StyledContainer
      onClick={onClick}
      className={`twap-button ${loading ? "twap-button-loading" : ""} ${disabled ? "twap-button-disabled" : "twap-button-enabled"} ${className}`}
      disabled={_disabled}
    >
      <StyledChildren className="twap-button-children" style={{ pointerEvents: loading ? "none" : "auto" }}>
        {children}
      </StyledChildren>
    </StyledContainer>
  );
}

const StyledContainer = styled("button")<{ disabled: boolean }>(({ disabled }) => ({
  position: "relative",
  width: "100%",
  border: "unset",
  cursor: disabled ? "unset" : "pointer",
  opacity: disabled ? 0.6 : 1,
  transition: "0.2s all",
}));

const StyledChildren = styled("div")({});

export default Button;
