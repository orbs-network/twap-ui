import { useCallback } from "react";
import { useWidgetContext } from "..";
import { useSubmitOrderFlow } from "./useSubmitOrderFlow";
import { useUsdAmount } from "./useUsdAmounts";
import { SwapStatus } from "@orbs-network/swap-ui";

export const useSwapModal = () => {
  const {
    state: { showConfirmation: isOpen },
    twap: {
      actionHandlers,
      values: { destTokenAmountUI },
    },
    srcToken,
    dstToken,
  } = useWidgetContext();
  const { resetState, state, updateState } = useWidgetContext();
  const { mutate: onSubmit } = useSubmitOrderFlow();
  const { dstUsd } = useUsdAmount();

  const { swapStatus } = state;
  const onClose = useCallback(
    (closeDalay?: number) => {
      updateState({ showConfirmation: false });
      if (state.swapStatus === SwapStatus.SUCCESS) {
        setTimeout(() => {
          resetState();
          actionHandlers.resetTwap();
        }, closeDalay || 300);
      }

      if (state.swapStatus === SwapStatus.FAILED) {
        updateState({ swapStatus: undefined, swapStep: undefined });
      }
    },
    [swapStatus, resetState, state, updateState, actionHandlers],
  );

  const onOpen = useCallback(() => {
    updateState({
      showConfirmation: true,
      confirmedData: {
        outAmount: destTokenAmountUI || "",
        outAmountusd: dstUsd,
        srcToken,
        dstToken,
      },
    });
  }, [updateState, destTokenAmountUI, dstUsd, srcToken, dstToken]);

  return {
    onClose,
    onOpen,
    isOpen,
    onSubmit,
  };
};
