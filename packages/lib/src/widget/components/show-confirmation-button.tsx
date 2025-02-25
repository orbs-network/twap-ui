import React from "react";
import { Button } from "../../components/base";
import { useShowConfirmationButton } from "../hooks";

export const ShowConfirmationButton = ({ className = "" }: { className?: string }) => {
  const args = useShowConfirmationButton();

  return (
    <Button className={`twap-submit-button ${className}`} onClick={args.onClick} loading={args.loading} disabled={Boolean(args.disabled)}>
      {args.text}
    </Button>
  );
};
