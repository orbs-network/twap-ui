import React from "react";
import { Message } from "../../../components/base";
import { useBalanceWaning } from "../../../hooks";
import { useWidgetContext } from "../../context";

export function WidgetErrorMessage() {
  const {
    twap: { errors },
  } = useWidgetContext();

  const balanceWarning = useBalanceWaning();

  const error = errors.chunks?.text || errors.fillDelay?.text || errors.duration?.text || errors.tradeSize?.text || errors.limitPrice?.text || balanceWarning;

  if (!error) return null;

  return <Message variant="error" title={error} />;
}
