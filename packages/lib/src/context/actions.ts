import { useCallback } from "react";
import { useTwapContext } from "@orbs-network/twap-ui-sdk";
import { useWidgetContext } from "../context/context";
import { SwapStatus } from "@orbs-network/swap-ui";
import { useOutAmount, useSrcAmount, useUsdAmount } from "../hooks";
import { network } from "@defi.org/web3-candies";

export const useSetQueryParams = () => {
  const enableQueryParams = useWidgetContext().enableQueryParams;
  return useCallback(
    (name: string, value?: string) => {
      if (!enableQueryParams) return;
    },
    [enableQueryParams],
  );
};

export const useSwitchNativeToWrapped = () => {
  const { onSrcTokenSelected } = useWidgetContext();
  const { config } = useTwapContext();
  return useCallback(() => {}, [onSrcTokenSelected]);
};

// Hook for handling modal close
const useSwapModalActions = () => {
  const {
    actionHandlers,
    state: { srcToken, destToken },
  } = useTwapContext();
  const { updateState, state } = useWidgetContext();
  const nativeToWrapped = useSwitchNativeToWrapped();
  const srcAmount = useSrcAmount().amountUi;
  const outAmount = useOutAmount().amountUi;
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
    [actionHandlers, swapStatus, updateState, nativeToWrapped],
  );

  const onOpen = useCallback(() => {
    updateState({
      showConfirmation: true,
      swapData: {
        srcToken,
        dstToken: destToken,
        srcAmount: srcAmount,
        outAmount: outAmount,
        srcAmountusd,
        outAmountusd,
      },
    });
  }, [updateState, srcToken, destToken, srcAmount, outAmount, srcAmountusd, outAmountusd]);

  return {
    onClose,
    onOpen,
  };
};

export const stateActions = {
  useSwapModalActions,
};
