import React from "react";
import { Button } from "../../components/base";
import { useShowConfirmationButton } from "../hooks";

export const ShowConfirmationButton = ({ className = "" }: { className?: string }) => {
  const { onClick, text, disabled, loading, allowClickWhileLoading } = useShowConfirmationButton();

  return (
    <Button allowClickWhileLoading={allowClickWhileLoading} className={`twap-submit-button ${className}`} onClick={onClick} loading={loading} disabled={Boolean(disabled)}>
      {text}
    </Button>
  );
};
