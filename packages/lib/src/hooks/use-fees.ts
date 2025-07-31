import { useMemo } from "react";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { useDstAmount } from "./use-dst-amount";
import BN from "bignumber.js";

export const useFees = () => {
  const { fee } = useTwapContext();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const destTokenAmount = useDstAmount().amountUI;

  const amountUI = useMemo(() => {
    if (!fee || !destTokenAmount) return "";
    return BN(destTokenAmount).multipliedBy(fee).dividedBy(100).toFixed();
  }, [fee, destTokenAmount, isMarketOrder]);

  return {
    amountUI,
    percent: fee,
  };
};
