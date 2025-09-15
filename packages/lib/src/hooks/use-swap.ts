import { useCallback, useMemo } from "react";
import { Swap } from "../types";
import { useTwapStore } from "../useTwapStore";
import { useTwapContext } from "../context";
import { useUsdAmount } from "./helper-hooks";
import { useDstAmount } from "./use-dst-amount";
import { useSrcAmount } from "./use-src-amount";

export const useSwap = () => {
  const updateState = useTwapStore((s) => s.updateState);
  const { srcToken, dstToken, srcUsd1Token, dstUsd1Token } = useTwapContext();
  const srcAmount = useSrcAmount().amountUI;
  const dstAmount = useDstAmount().amountUI;
  const srcUsdAmount = useUsdAmount(srcAmount, srcUsd1Token);
  const dstUsdAmount = useUsdAmount(dstAmount, dstUsd1Token);

  const state = useTwapStore((s) => s.state);
  const resetSwap = useCallback(() => updateState({ swap: {} as Swap }), [updateState, state]);

  const updateSwap = useCallback((data: Partial<Swap>) => updateState({ swap: { ...state.swap, ...data } }), [updateState, state]);

  const initSwap = useCallback(() => {
    updateSwap({
      srcToken,
      dstToken,
      srcAmount,
      dstAmount,
      srcUsdAmount,
      dstUsdAmount,
    });
  }, [updateSwap, srcToken, dstToken, srcAmount, dstAmount, srcUsdAmount, dstUsdAmount]);

  const swap = useMemo((): Swap => {
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
    };
  }, [state.swap, srcAmount, dstAmount, srcToken, dstToken, srcUsdAmount, dstUsdAmount]);

  return { resetSwap, initSwap, updateSwap, swap };
};
