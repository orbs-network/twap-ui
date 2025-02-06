import { useCallback } from "react";
import { useWidgetContext } from "..";
import { useSubmitOrderFlow } from "./useSubmitOrderFlow";
import { useUsdAmount } from "./useUsdAmounts";
import { SwapStatus } from "@orbs-network/swap-ui";

export const useSwitchNativeToWrapped = () => {
  const { onSrcTokenSelected } = useWidgetContext();

  return useCallback(() => {}, [onSrcTokenSelected]);
};

export const useSwapModal = () => {
  const {
    state: { showConfirmation: isOpen },
    twap: {
      values: { destTokenAmountUI },
    },
  } = useWidgetContext();
  const { resetState, state, updateState } = useWidgetContext();
  const nativeToWrapped = useSwitchNativeToWrapped();
  const { mutate: onSubmit } = useSubmitOrderFlow();
  const { dstUsd } = useUsdAmount();

  const { swapStatus } = state;
  const onClose = useCallback(
    (closeDalay?: number) => {
      updateState({ showConfirmation: false });
      if (state.wrapSuccess) {
        nativeToWrapped();
      }

      if (state.swapStatus === SwapStatus.SUCCESS || state.swapStatus === SwapStatus.FAILED) {
        setTimeout(() => {
          resetState();
        }, closeDalay || 300);
      }
    },
    [swapStatus, nativeToWrapped, resetState, state, updateState],
  );

  const onOpen = useCallback(() => {
    updateState({
      showConfirmation: true,
      confirmedData: {
        outAmount: destTokenAmountUI || "",
        outAmountusd: dstUsd,
      },
    });
  }, [updateState, destTokenAmountUI, dstUsd]);

  return {
    onClose,
    onOpen,
    isOpen,
    onSubmit,
  };
};
