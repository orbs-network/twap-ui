import React from "react";
import { Button } from "../components";
import { useSubmitButton } from "../hooks";

const SubmitButton = ({ className = "" }: { className?: string }) => {
  const { loading, text, onClick, disabled } = useSubmitButton();
  return (
    <Button className={className} loading={loading} onClick={onClick || (() => {})} disabled={disabled}>
      {text}
    </Button>
  );
};

export default SubmitButton;
