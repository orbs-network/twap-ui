import { useMemo } from "react";
import { useTwapContext } from "../context";
import BN from "bignumber.js";
import { useSwap } from "./use-swap";

export const useFees = () => {
  const { fees } = useTwapContext();

  const {
    swap: { dstAmount },
  } = useSwap();

  const amount = useMemo(() => {
    if (!fees || !dstAmount) return "";
    return BN(dstAmount).multipliedBy(fees).dividedBy(100).toFixed();
  }, [dstAmount]);

  return {
    amount,
    percent: fees,
  };
};
