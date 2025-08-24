import { useMemo } from "react";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { useDstAmount } from "./use-dst-amount";
import BN from "bignumber.js";
import { FEES } from "@orbs-network/twap-sdk";

export const useFees = () => {
  const { overrides } = useTwapContext();
  const feesDisabled = overrides?.feesDisabled;
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const destTokenAmount = useDstAmount().amountUI;

  const amountUI = useMemo(() => {
    if (feesDisabled || !destTokenAmount) return "";
    return BN(destTokenAmount).multipliedBy(FEES).dividedBy(100).toFixed();
  }, [destTokenAmount, isMarketOrder]);

  return {
    amountUI,
    percent: FEES,
  };
};
