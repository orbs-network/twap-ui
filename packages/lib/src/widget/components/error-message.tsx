import React from "react";
import { useWidgetContext } from "../..";
import { Message } from "../../components/base";
import { useBalanceWaning } from "../../hooks";

export function ErrorMessage() {
  const {
    twap: { errors },
    state:{srcAmount}
  } = useWidgetContext();

  const balanceWarning = useBalanceWaning();
  
  const error =!srcAmount ? '' :  errors.chunks?.text || errors.fillDelay?.text || errors.duration?.text || errors.tradeSize?.text || errors.limitPrice?.text || balanceWarning;

  if (!error) return null;

  return <Message variant="error" title={error} />;
}
