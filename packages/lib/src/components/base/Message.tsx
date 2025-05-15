// import { RiErrorWarningLine } from "@react-icons/all-files/io/RiErrorWarningLine";
import { RiErrorWarningLine } from "@react-icons/all-files/ri/RiErrorWarningLine";

import React, { ReactNode, useMemo } from "react";
import { MessageVariant } from "../../types";
import { useTwapContext } from "../../context";

export function Message({ text, className = "", variant }: { variant: MessageVariant; text?: ReactNode; className?: string }) {
  const { components } = useTwapContext();
  const _className = useMemo(() => {
    switch (variant) {
      case "error":
        return "twap-error-message";
      case "warning":
        return "twap-warning-message";

      default:
        return "";
    }
  }, [variant]);

  const icon = useMemo(() => {
    switch (variant) {
      case "error":
        return <RiErrorWarningLine className="twap-message-icon" />;
      case "warning":
        return <RiErrorWarningLine className="twap-message-icon" />;

      default:
        return undefined;
    }
  }, [variant]);

  if (components.Message) {
    return <components.Message text={text} variant={variant} />;
  }

  return (
    <div className={`twap-message ${_className} ${className}`}>
      {icon && icon}
      <div className="twap-message-right">{text && <p className="twap-message-text">{text}</p>}</div>
    </div>
  );
}
