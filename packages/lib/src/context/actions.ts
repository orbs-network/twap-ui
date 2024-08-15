import { useCallback } from "react";
import { useTwapContext } from "./context";
import BN from "bignumber.js";
import * as SDK from "@orbs-network/twap-ui-sdk";
import { SwapState, SwapStep } from "@orbs-network/twap-ui-sdk";

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

// Hook for handling swap reset
const useSwapReset = () => {
  const { updateState } = useTwapContext();

  return useCallback(() => {
    updateState({
      srcAmountUi: "",
    });
    SDK.useResetStore();
  }, [updateState, SDK.useResetStore]);
};

const useHandleDisclaimer = () => {
  const { updateState, state } = useTwapContext();
  return useCallback(() => {
    updateState({ disclaimerAccepted: !state.disclaimerAccepted });
  }, [updateState, state.disclaimerAccepted]);
};

// Hook for selecting orders tab
const useSelectOrdersTab = () => {
  const { updateState } = useTwapContext();

  return useCallback((value: number) => updateState({ selectedOrdersTab: value }), [updateState]);
};

// Hook for showing/hiding orders

const useOnTxHash = () => {
  const { updateState } = useTwapContext();

  const onCreateOrderTxHash = useCallback(
    (createOrdertxHash: string) => {
      updateState({ createOrdertxHash });
    },
    [updateState],
  );

  const onWrapTxHash = useCallback(
    (wrapTxHash: string) => {
      updateState({ wrapTxHash });
    },
    [updateState],
  );

  const onUnwrapTxHash = useCallback(
    (unwrapTxHash: string) => {
      updateState({ unwrapTxHash });
    },
    [updateState],
  );

  const onApproveTxHash = useCallback(
    (approveTxHash: string) => {
      updateState({ approveTxHash });
    },
    [updateState],
  );

  return {
    onCreateOrderTxHash,
    onWrapTxHash,
    onUnwrapTxHash,
    onApproveTxHash,
  };
};

const useUpdateSwapStep = () => {
  const { updateState } = useTwapContext();

  return useCallback(
    (swapStep: SwapStep) => {
      updateState({ swapStep });
    },
    [updateState],
  );
};

const useUpdateSwapState = () => {
  const { updateState } = useTwapContext();

  return useCallback(
    (swapState: SwapState) => {
      updateState({ swapState });
    },
    [updateState],
  );
};

export const useSetSrcAmount = () => {
  const { updateState } = useTwapContext();
  return useCallback(
    (srcAmountUi: string) => {
      updateState({
        srcAmountUi,
      });
    },
    [updateState],
  );
};

const useOnOrderCreated = () => {
  const { updateState } = useTwapContext();

  return useCallback(() => {
    updateState({ swapState: "success", createOrderSuccess: true, selectedOrdersTab: 0 });
  }, [updateState]);
};

export const stateActions = {
  useSwapModalActions,
  useSwapReset,
  useSelectOrdersTab,
  useOnTxHash,
  useUpdateSwapStep,
  useUpdateSwapState,
  useSetSrcAmount,
  useHandleDisclaimer,
  useOnOrderCreated,
};
