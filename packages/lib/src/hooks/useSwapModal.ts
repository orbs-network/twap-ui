import { useCallback } from "react";
import { SwapStatus } from "@orbs-network/swap-ui";
import { useUsdAmount } from ".";
import { useWidgetContext } from "..";

export const useSwitchNativeToWrapped = () => {
  const { onSrcTokenSelected } = useWidgetContext();

  return useCallback(() => {}, [onSrcTokenSelected]);
};

export const useSwapModal = () => {
  const {
    state: { showConfirmation: isOpen },
  } = useWidgetContext();
  const { resetState, state, srcToken, dstToken, twap, updateState } = useWidgetContext();
  const nativeToWrapped = useSwitchNativeToWrapped();
  const srcAmount = twap.values.srcAmountUI;
  const outAmount = twap.values.destTokenAmountUI;
  const { srcUsd: srcAmountusd, dstUsd: outAmountusd } = useUsdAmount();
  const { swapStatus } = state;
  const onClose = useCallback(
    (closeDalay?: number) => {
      updateState({ showConfirmation: false });
      if (state.wrapSuccess) {
        nativeToWrapped();
      }

      if (state.swapStatus) {
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
      swapData: {
        srcToken,
        dstToken,
        srcAmount,
        outAmount,
        srcAmountusd,
        outAmountusd,
      },
    });
  }, [updateState, srcToken, dstToken, srcAmount, outAmount, srcAmountusd, outAmountusd]);

  return {
    onClose,
    onOpen,
    isOpen,
  };
};
