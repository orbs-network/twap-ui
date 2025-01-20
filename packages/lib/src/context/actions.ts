import { useCallback } from "react";
import { useTwapContext as useTwapContextUI } from "@orbs-network/twap-ui-sdk";
import { useTwapContext } from "../context/context";
import { SwapStatus } from "@orbs-network/swap-ui";

export const useSetQueryParams = () => {
  const enableQueryParams = useTwapContext().enableQueryParams;
  return useCallback(
    (name: string, value?: string) => {
      if (!enableQueryParams) return;
    },
    [enableQueryParams],
  );
};

export const useSwitchNativeToWrapped = () => {
  const { onSrcTokenSelected, dappWToken } = useTwapContext();
  return useCallback(() => {
    if (dappWToken) {
      onSrcTokenSelected?.(dappWToken);
    }
  }, [onSrcTokenSelected, dappWToken]);
};

// Hook for handling modal close
const useSwapModalActions = () => {
  const { actionHandlers } = useTwapContextUI();
  const { updateState, state } = useTwapContext();
  const nativeToWrapped = useSwitchNativeToWrapped();

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
    [actionHandlers, swapStatus, updateState, nativeToWrapped],
  );

  const onOpen = useCallback(() => {
    updateState({ showConfirmation: true });
  }, [updateState]);

  return {
    onClose,
    onOpen,
  };
};

export const stateActions = {
  useSwapModalActions,
};
