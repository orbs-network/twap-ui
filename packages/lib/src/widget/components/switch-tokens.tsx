import React, { ReactNode } from "react";
import { IoMdArrowDown } from "@react-icons/all-files/io/IoMdArrowDown";
import { useSwitchTokens } from "../hooks";

export const SwitchTokens = ({ children, className = "" }: { children?: ReactNode; className?: string; icon?: any }) => {
  const onSwitchTokens = useSwitchTokens();
  return (
    <div className={`${className} twap-switch-tokens`}>
      <button onClick={onSwitchTokens}>{children || <IoMdArrowDown />}</button>
    </div>
  );
};
