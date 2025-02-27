import React, { ReactNode } from "react";
import { IoMdArrowDown } from "@react-icons/all-files/io/IoMdArrowDown";
import { useSwitchTokensCallback } from "../../hooks/ui-hooks";

export const SwitchTokens = ({ children, className = "" }: { children?: ReactNode; className?: string; icon?: any }) => {
  const onSwitchTokens = useSwitchTokensCallback();
  return (
    <div className={`${className} twap-switch-tokens`}>
      <button onClick={onSwitchTokens}>{children || <IoMdArrowDown />}</button>
    </div>
  );
};
