import { useCallback } from "react";
import { useTwapContext } from "./context";

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
  const { updateState, state } = useTwapContext();
  const { swapState, wrapSuccess } = state;
  const onClose = useCallback(
    (closeDalay?: number) => {
      updateState({ showConfirmation: false });
      if (swapState === "loading") return;
      setTimeout(() => {
        updateState({
          swapSteps: undefined,
          swapState: undefined,
          swapStep: undefined,
          approveSuccess: undefined,
          wrapSuccess: undefined,
          wrapTxHash: undefined,
          unwrapTxHash: undefined,
          approveTxHash: undefined,
          createOrderSuccess: undefined,
          swapData: undefined,
        });
      }, closeDalay || 300);
    },
    [updateState, swapState, wrapSuccess],
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
