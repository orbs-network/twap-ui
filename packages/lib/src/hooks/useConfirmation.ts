import { useCallback } from "react";
import { useWidgetContext } from "..";
import { useSubmitOrderFlow } from "./useSubmitOrderFlow";
import { useUsdAmount } from "./useUsdAmounts";
import { SwapStatus } from "@orbs-network/swap-ui";

export const useConfirmation = () => {
  const {
    state: { showConfirmation: isOpen, swapData, swapStatus, swapError, srcAmount, swapStep },
    srcToken,
    dstToken,
    twap: {
      actionHandlers,
      values: { destTokenAmountUI },
    },
    marketPrice,
  } = useWidgetContext();

  const { resetState, state, updateState, actions } = useWidgetContext();
  const { mutate: onSubmit } = useSubmitOrderFlow();
  const { dstUsd, srcUsd } = useUsdAmount();
  const { onSwitchFromNativeToWrapped } = actions;

  const onClose = useCallback(
    (closeDalay?: number) => {
      const success = state.swapStatus === SwapStatus.SUCCESS;
      const failure = state.swapStatus === SwapStatus.FAILED;
      updateState({ showConfirmation: false });
      if (success) {
        setTimeout(() => {
          resetState();
          actionHandlers.resetTwap();
        }, closeDalay || 300);
      }

      if (failure) {
        updateState({ swapStatus: undefined, swapStep: undefined });
      }
      if ((success || failure) && state.isWrapped) {
        onSwitchFromNativeToWrapped?.();
      }
    },
    [swapStatus, resetState, state, updateState, actionHandlers, onSwitchFromNativeToWrapped],
  );

  const onOpen = useCallback(() => {
    updateState({
      showConfirmation: true,
      swapData: {
        srcAmount,
        outAmount: destTokenAmountUI || "",
        srcAmountusd: srcUsd,
        outAmountusd: dstUsd,
        marketPrice,
      },
    });
  }, [updateState, destTokenAmountUI, dstUsd, srcAmount, srcUsd, marketPrice]);

  return {
    onClose,
    onOpen,
    isOpen,
    onCreateOrder: onSubmit,
    swapData,
    swapStatus,
    swapError,
    swapStep,
    marketPrice,
    srcToken,
    dstToken,
  };
};
