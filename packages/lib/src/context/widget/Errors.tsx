import React from "react";
import { useWidgetContext } from "../..";
import { Message } from "../../components/base";
import { useBalanceWaning } from "../../hooks";

export const useErrros = () => {
  const errors = useWidgetContext().twap.errors;
  const balanceWrning = useBalanceWaning();

  return {
    fillDelay: errors.fillDelay?.text,
    tradeSize: errors.tradeSize?.text,
    balance: balanceWrning,
  };
};

const TradeSizeWarning = () => {
  const { tradeSize } = useErrros();
  if (!tradeSize) return null;
  return <Message variant="warning" title={tradeSize} />;
};

const fillDelayWarning = () => {
  const { fillDelay } = useErrros();
  if (!fillDelay) return null;
  return <Message variant="warning" title={fillDelay} />;
};

const balanceWarning = () => {
  const { balance } = useErrros();
  if (!balance) return null;
  return <Message variant="warning" title={balance} />;
};

export const Warnings = {
  TradeSize: TradeSizeWarning,
  fillDelay: fillDelayWarning,
  Balance: balanceWarning,
};
