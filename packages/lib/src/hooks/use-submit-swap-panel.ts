import { useCallback, useMemo } from "react";
import { Swap, SwapCallbacks, SwapData, SwapStatus } from "../types";
import { useTwapStore } from "../useTwapStore";
import { useTwapContext } from "../context";
import { useUsdAmount } from "./helper-hooks";
import { useDstAmount } from "./use-dst-amount";
import { useSrcAmount } from "./use-src-amount";
import { useSubmitOrder } from "./use-submit-order";
import { useDerivedSwap } from "./use-derived-swap";
import { useMutation } from "@tanstack/react-query";

export const useSubmitSwapPanel = (callbacks?: SwapCallbacks) => {
  const updateSwap = useTwapStore((s) => s.updateSwap);
  const { srcToken, dstToken, srcUsd1Token, dstUsd1Token } = useTwapContext();
  const submitOrderMutation = useSubmitOrder();

  const srcAmount = useSrcAmount().amountUI;
  const dstAmount = useDstAmount().amountUI;
  const srcUsdAmount = useUsdAmount(srcAmount, srcUsd1Token);
  const dstUsdAmount = useUsdAmount(dstAmount, dstUsd1Token);
  const state = useTwapStore((s) => s.state);
  const resetSwap = useTwapStore((s) => s.resetState);

  const swap = useDerivedSwap();
  const onCloseModal = useCallback(() => {
    if (state.swap.status === SwapStatus.SUCCESS) {
      resetSwap();
    }
  }, [state.swap.status, resetSwap]);

  const onOpenModal = useCallback(() => {
    if (swap?.status !== SwapStatus.LOADING) {
      updateSwap({} as Swap);
    }
  }, [swap, updateSwap]);

  const { mutateAsync: onSubmitOrder } = useMutation(async () => {
    const data: SwapData = {
      srcToken: srcToken!,
      dstToken: dstToken!,
      srcAmount: srcAmount!,
      dstAmount,
      srcUsdAmount,
      dstUsdAmount,
    };
    updateSwap(data);

    callbacks?.createOrder?.onRequest?.(data);
    const result = await submitOrderMutation.mutateAsync(callbacks);
    callbacks?.createOrder?.onSuccess?.({
      ...data,
      receipt: result?.receipt,
    });
    return result;
  });

  return useMemo(() => {
    return {
      resetSwap,
      updateSwap,
      onCloseModal,
      onOpenModal,
      onSubmitOrder,
      ...swap,
      isLoading: swap.status === SwapStatus.LOADING,
    };
  }, [resetSwap, updateSwap, onCloseModal, onSubmitOrder, swap]);
};
