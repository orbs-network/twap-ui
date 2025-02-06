import React from "react";
import { Button } from "../../components/base";
import { useConfirmationButton } from "../../hooks/useConfirmationButton";

export const ShowConfirmationButton = ({ className = "" }: { className?: string }) => {
  const { onClick, text, disabled, loading, allowClickWhileLoading } = useConfirmationButton();

  return (
    <Button allowClickWhileLoading={allowClickWhileLoading} className={`twap-submit-button ${className}`} onClick={onClick} loading={loading} disabled={disabled}>
      {text}
    </Button>
  );
};

export const SubmitOrderPanel = ({ className = "" }: { className?: string }) => {
  return <ShowConfirmationButton className={className} />;
};
