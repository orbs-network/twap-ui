import React, { useMemo } from "react";
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
    <button
      onClick={onClick}
      className={`twap-button ${loading ? "twap-button-loading" : ""} ${disabled ? "twap-button-disabled" : "twap-button-enabled"} ${className}`}
      disabled={_disabled}
    >
      <div className="twap-button-children" style={{ pointerEvents: loading ? "none" : "auto" }}>
        {children}
      </div>
    </button>
  );
}

export default Button;
