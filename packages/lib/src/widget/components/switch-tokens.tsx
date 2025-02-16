import React, { ReactNode } from "react";
import { RiArrowUpDownLine } from "@react-icons/all-files/ri/RiArrowUpDownLine";
import { useSwitchTokens } from "../hooks";

export const SwitchTokens = ({ children, className = "" }: { children?: ReactNode; className?: string; icon?: any }) => {
  const onSwitchTokens = useSwitchTokens();
  return (
    <div className={`${className} twap-switch-tokens`}>
      <button onClick={onSwitchTokens}>{children || <RiArrowUpDownLine />}</button>
    </div>
  );
};
