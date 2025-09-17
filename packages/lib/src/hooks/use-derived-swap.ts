import { useMemo } from "react";
import { useTwapStore } from "../useTwapStore";
import { useTwapContext } from "../context";
import { useSrcAmount } from "./use-src-amount";
import { useDstAmount } from "./use-dst-amount";
import { useUsdAmount } from "./helper-hooks";

export function useDerivedSwap() {
  const { srcToken, dstToken, srcUsd1Token, dstUsd1Token } = useTwapContext();

  const srcAmount = useSrcAmount().amountUI;
  const dstAmount = useDstAmount().amountUI;
  const srcUsdAmount = useUsdAmount(srcAmount, srcUsd1Token);
  const dstUsdAmount = useUsdAmount(dstAmount, dstUsd1Token);
  const state = useTwapStore((s) => s.state);

  return useMemo(() => {
    return {
      status: state.swap.status,
      error: state.swap.error,
      step: state.swap.step,
      stepIndex: state.swap.stepIndex,
      approveTxHash: state.swap.approveTxHash,
      wrapTxHash: state.swap.wrapTxHash,
      totalSteps: state.swap.totalSteps,
      srcAmount: state.swap.srcAmount || srcAmount,
      dstAmount: state.swap.dstAmount || dstAmount,
      srcToken: state.swap.srcToken || srcToken,
      dstToken: state.swap.dstToken || dstToken,
      srcUsdAmount: state.swap.srcUsdAmount || srcUsdAmount,
      dstUsdAmount: state.swap.dstUsdAmount || dstUsdAmount,
      isSubmitted: Boolean(state.swap.status),
    };
  }, [state.swap, srcAmount, dstAmount, srcToken, dstToken, srcUsdAmount, dstUsdAmount]);
}
