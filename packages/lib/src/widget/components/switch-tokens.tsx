import React, { ReactNode } from "react";
import { IoMdArrowDown } from "@react-icons/all-files/io/IoMdArrowDown";
import { useSwitchTokensCallback } from "../../hooks/ui-hooks";
import { useTwapContext } from "../../context";

export const SwitchTokens = ({ children, className = "" }: { children?: ReactNode; className?: string; icon?: any }) => {
  const onSwitchTokens = useSwitchTokensCallback();
  const { components } = useTwapContext();

  if (components.SwitchTokens) {
    return <components.SwitchTokens onClick={onSwitchTokens || (() => {})} />;
  }

  return (
    <div className={`${className} twap-switch-tokens`}>
      <button onClick={onSwitchTokens}>{children || <IoMdArrowDown />}</button>
    </div>
  );
};
