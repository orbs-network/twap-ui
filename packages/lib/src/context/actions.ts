import { useCallback } from "react";
import { useTwapContext } from "./context";
import { useTwapContext as useTwapContextUI } from "@orbs-network/twap-ui-sdk";

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
  const { state, actionHandlers } = useTwapContextUI();
  const { swapStatus } = state;
  const onClose = useCallback(
    (closeDalay?: number) => {
      actionHandlers.setShowConfirmation(false);
      if (swapStatus === "loading") return;
      setTimeout(() => {
        actionHandlers.setSwapSteps(undefined);
        actionHandlers.setSwapStatus(undefined);
        actionHandlers.setSwapStep(undefined);
        actionHandlers.setCreatedOrderSuccess(false);
        actionHandlers.setWrapSuccess(false);
      }, closeDalay || 300);
    },
    [actionHandlers, swapStatus],
  );

  const onOpen = useCallback(() => {
    actionHandlers.setShowConfirmation(true);
  }, [actionHandlers]);

  return {
    onClose,
    onOpen,
  };
};

export const stateActions = {
  useSwapModalActions,
};
