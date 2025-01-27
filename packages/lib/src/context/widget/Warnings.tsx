import React from "react";
import { Message } from "../../components/base";
import { useBalanceWarning, useFillDelay, useTradeSizeWarning } from "../../hooks";

export const useWarnings = () => {
  const fillDelay = useFillDelay().warning;
  const tradeSize = useTradeSizeWarning();
  const balance = useBalanceWarning();

  return {
    fillDelay,
    tradeSize,
    balance,
  };
};

const TradeSizeWarning = () => {
  const { tradeSize } = useWarnings();
  if (!tradeSize) return null;
  return <Message variant="warning" title={tradeSize} />;
};

const fillDelayWarning = () => {
  const { fillDelay } = useWarnings();
  if (!fillDelay) return null;
  return <Message variant="warning" title={fillDelay} />;
};

const balanceWarning = () => {
  const { balance } = useWarnings();
  if (!balance) return null;
  return <Message variant="warning" title={balance} />;
};

export const Warnings = {
  TradeSize: TradeSizeWarning,
  fillDelay: fillDelayWarning,
  Balance: balanceWarning,
};
