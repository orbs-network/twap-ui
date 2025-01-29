import { useCallback } from "react";
import { useWidgetContext } from "../context/context";
import { SwapStatus } from "@orbs-network/swap-ui";
import { useUsdAmount } from ".";

export const useSwitchNativeToWrapped = () => {
  const { onSrcTokenSelected } = useWidgetContext();

  return useCallback(() => {}, [onSrcTokenSelected]);
};

export const useSwapModal = () => {
  const {
    state: { showConfirmation: isOpen },
  } = useWidgetContext();
  const { updateState, state, srcToken, dstToken, twap } = useWidgetContext();
  const nativeToWrapped = useSwitchNativeToWrapped();
  const srcAmount = twap.values.srcAmountUI;
  const outAmount = twap.values.destTokenAmountUI;
  const { srcUsd: srcAmountusd, dstUsd: outAmountusd } = useUsdAmount();
  const { swapStatus } = state;
  const onClose = useCallback(
    (closeDalay?: number) => {
      updateState({ showConfirmation: false });
      if (swapStatus === SwapStatus.FAILED) return;
      setTimeout(() => {
        updateState({
          swapSteps: undefined,
          swapStatus: undefined,
          swapStep: undefined,
          approveSuccess: undefined,
          wrapSuccess: undefined,
          wrapTxHash: undefined,
          unwrapTxHash: undefined,
          approveTxHash: undefined,
          createOrderSuccess: undefined,
        });
        if (state.wrapSuccess) {
          nativeToWrapped();
        }
      }, closeDalay || 300);
    },
    [swapStatus, updateState, nativeToWrapped],
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
