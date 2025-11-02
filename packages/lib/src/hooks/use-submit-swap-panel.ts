import { SwapStatus } from "@orbs-network/swap-ui";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import { useTwapContext } from "../context/twap-context";
import { InputErrors, SwapExecution } from "../types";
import { useTwapStore } from "../useTwapStore";
import { useCurrentOrderDetails } from "./use-current-order";
import { useInputErrors } from "./use-input-errors";
import { useMinChunkSizeUsd } from "./use-min-chunk-size-usd";
import { useSrcAmount } from "./use-src-amount";
import { useSubmitOrderMutation } from "./use-submit-order";
import { useTranslations } from "./use-translations";
import BN from "bignumber.js";

export const useSubmitSwapPanel = () => {
  const { marketPrice, srcToken, dstToken, marketPriceLoading, srcBalance, srcUsd1Token, noLiquidity } = useTwapContext();
  const t = useTranslations();
  const submitOrderMutation = useSubmitOrderMutation();
  const updateState = useTwapStore((s) => s.updateState);
  const { amountUI: srcAmountUI, amountWei: srcAmountWei } = useSrcAmount();
  const resetSwap = useTwapStore((s) => s.resetState);
  const swapExecution = useTwapStore((s) => s.state.swapExecution);
  const fetchingAllowance = useTwapStore((s) => s.state.fetchingAllowance);
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const minChunkSizeUsd = useMinChunkSizeUsd();
  const isPropsLoading = marketPriceLoading || BN(srcUsd1Token || "0").isZero() || srcBalance === undefined || !minChunkSizeUsd || BN(marketPrice || "0").isZero();
  const buttonLoading = Boolean(srcToken && dstToken && typedSrcAmount && isPropsLoading);
  const inputsError = useInputErrors();

  const buttonText = useMemo(() => {
    if (noLiquidity) return t("noLiquidity");
    if (BN(typedSrcAmount || "0").isZero()) return t("enterAmount");
    if (inputsError?.type === InputErrors.INSUFFICIENT_BALANCE) return t("insufficientFunds");
    return t("placeOrder");
  }, [inputsError, t, typedSrcAmount, noLiquidity]);

  const onCloseModal = useCallback(() => {
    if (swapExecution?.status === SwapStatus.SUCCESS) {
      updateState({ typedSrcAmount: "" });
      setTimeout(() => {
        resetSwap();
      }, 1_000);
    }
  }, [swapExecution?.status, resetSwap, updateState]);

  const onOpenModal = useCallback(() => {
    if (swapExecution?.status !== SwapStatus.LOADING) {
      updateState({ acceptedSrcAmount: undefined, acceptedMarketPrice: undefined, swapExecution: { srcToken, dstToken } as SwapExecution });
    }
  }, [updateState, srcToken, dstToken]);

  const submitSwapMutation = useMutation(async () => {
    updateState({ acceptedSrcAmount: srcAmountUI, acceptedMarketPrice: marketPrice });

    // callbacks?.createOrder?.onRequest?.(data);
    const result = await submitOrderMutation.mutateAsync();
    // callbacks?.createOrder?.onSuccess?.({
    //   ...data,
    //   receipt: " " ,
    // });
    return result;
  });

  const onSubmitOrder = useCallback(() => submitSwapMutation.mutateAsync(), [submitSwapMutation]);
  const order = useCurrentOrderDetails();

  return useMemo(() => {
    return {
      resetSwap,
      onCloseModal,
      onOpenModal,
      onSubmitOrder,
      ...swapExecution,
      swapLoading: swapExecution?.status === SwapStatus.LOADING || fetchingAllowance,
      swapSubmitted: Boolean(swapExecution?.status),
      order,
      srcAmountWei,
      srcAmount: srcAmountWei,
      openSubmitModalButton: {
        disabled: Boolean(inputsError || noLiquidity || buttonLoading || BN(typedSrcAmount || "0").isZero() || !srcToken || !dstToken),
        text: buttonText,
        loading: buttonLoading,
      },
    };
  }, [
    swapExecution,
    fetchingAllowance,
    srcToken,
    dstToken,
    order,
    resetSwap,
    onCloseModal,
    onOpenModal,
    onSubmitOrder,
    buttonText,
    buttonLoading,
    inputsError,
    noLiquidity,
    typedSrcAmount,
  ]);
};
