import React from "react";
import { useWidgetContext } from "../..";
import { Message } from "../../components/base";
import { useShouldWrapOrUnwrapOnly } from "../../hooks/useShouldWrapOrUnwrap";
import { useBalanceWaning, useFeeOnTransferError } from "../../hooks/useWarnings";

export function ErrorMessage() {
  const {
    twap: { errors },
    state: { srcAmount },
  } = useWidgetContext();
  const hide = useShouldWrapOrUnwrapOnly();

  const { feeError } = useFeeOnTransferError();

  const balanceWarning = useBalanceWaning();

  const error = !srcAmount
    ? ""
    : errors.chunks?.text || errors.fillDelay?.text || errors.duration?.text || errors.tradeSize?.text || errors.limitPrice?.text || balanceWarning || feeError;

  if (!error || hide) return null;

  return <Message variant="error" title={error} />;
}
