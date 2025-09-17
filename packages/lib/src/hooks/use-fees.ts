import { useMemo } from "react";
import { useTwapContext } from "../context";
import BN from "bignumber.js";
import { useDerivedSwap } from "./use-derived-swap";

export const useFees = () => {
  const { fees } = useTwapContext();

  const { dstAmount } = useDerivedSwap();

  const amount = useMemo(() => {
    if (!fees || !dstAmount) return "";
    return BN(dstAmount).multipliedBy(fees).dividedBy(100).toFixed();
  }, [dstAmount]);

  return {
    amount,
    percent: fees,
  };
};
