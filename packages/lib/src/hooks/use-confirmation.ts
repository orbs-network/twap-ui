import { SwapStatus } from "@orbs-network/swap-ui";
import { useCallback } from "react";
import { useTwapContext } from "../context";
import { useTradePrice } from "../twap/submit-order-modal/usePrice";
import { useTwapStore } from "../useTwapStore";
import { getOrderType } from "../utils";
import { useSubmitOrderCallback } from "./use-submit-order";
import { useOrderSubmissionArgs } from "./use-order-submission-args";
import { useDeadline } from "./use-deadline";
import { useSrcChunkAmount } from "./use-src-chunk-amount";
import { useFillDelay } from "./use-fill-delay";
import { useChunks } from "./use-chunks";
import { useUsdAmount } from "./helper-hooks";
import { useDstAmount } from "./use-dst-amount";
import { useFees } from "./use-fees";
import { useDstMinAmountPerChunk } from "./use-dst-min-amount-out-per-chunk";

export const useOnOpenConfirmationModal = () => {
  const swapStatus = useTwapStore((s) => s.state.swapStatus);
  const updateState = useTwapStore((s) => s.updateState);
  const dstAmount = useDstAmount().amountUI;
  return useCallback(() => {
    updateState({ showConfirmation: true });
    if (swapStatus === SwapStatus.LOADING) return;
    updateState({
      swapStatus: undefined,
      acceptedDstAmount: dstAmount,
    });
  }, [updateState, dstAmount, swapStatus]);
};

export const useOnCloseConfirmationModal = () => {
  const updateState = useTwapStore((s) => s.updateState);
  const swapStatus = useTwapStore((s) => s.state.swapStatus);
  const resetState = useTwapStore((s) => s.resetState);

  return useCallback(() => {
    updateState({ showConfirmation: false });
    if (swapStatus === SwapStatus.SUCCESS) {
      resetState();
    }

    if (swapStatus === SwapStatus.FAILED) {
      updateState({ swapStatus: undefined, activeStep: undefined, currentStepIndex: 0 });
    }
  }, [resetState, updateState, swapStatus]);
};

export const useConfirmationPanel = () => {
  const { dstUsd1Token, srcUsd1Token, account, srcToken, dstToken } = useTwapContext();
  const acceptedDstAmount = useTwapStore((s) => s.state.acceptedDstAmount);
  const onClose = useOnCloseConfirmationModal();
  const deadline = useDeadline();
  const srcChunkAmount = useSrcChunkAmount().amountUI;
  const chunks = useChunks().chunks;
  const { fillDelay } = useFillDelay();
  const destMinAmountOut = useDstMinAmountPerChunk().amountUI;
  const srcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const fee = useFees();
  const { mutateAsync, isLoading: mutationLoading } = useSubmitOrderCallback();
  const srcUsdAmount = useUsdAmount(srcAmount, srcUsd1Token);
  const dstUsdAmount = useUsdAmount(acceptedDstAmount, dstUsd1Token);
  const fetchingAllowance = useTwapStore((s) => s.state.fetchingAllowance);
  const currentStep = useTwapStore((s) => s.state.activeStep);
  const swapError = useTwapStore((s) => s.state.swapError);
  const swapStatus = useTwapStore((s) => s.state.swapStatus);
  const stepsCount = useTwapStore((s) => s.state.totalSteps);
  const currentStepIndex = useTwapStore((s) => s.state.currentStepIndex);
  const disclaimerAccepted = useTwapStore((s) => s.state.disclaimerAccepted);
  const showConfirmation = useTwapStore((s) => s.state.showConfirmation);
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const unwrapTxHash = useTwapStore((s) => s.state.unwrapTxHash);
  const wrapTxHash = useTwapStore((s) => s.state.wrapTxHash);
  const approveTxHash = useTwapStore((s) => s.state.approveTxHash);
  const createOrderTxHash = useTwapStore((s) => s.state.createOrderTxHash);
  const updateState = useTwapStore((s) => s.updateState);
  const isLoading = mutationLoading || swapStatus === SwapStatus.LOADING || fetchingAllowance;
  const tradePrice = useTradePrice();
  const orderSubmissionArgs = useOrderSubmissionArgs();

  const setDisclaimerAccepted = useCallback(
    (accepted: boolean) => {
      updateState({ disclaimerAccepted: accepted });
    },
    [updateState],
  );

  const submitOrder = useCallback(() => mutateAsync(), [mutateAsync]);

  return {
    onClose,
    isOpen: Boolean(showConfirmation),
    setDisclaimerAccepted,
    disclaimerAccepted,
    orderSubmissionArgs,
    orderDetails: {
      orderType: getOrderType(Boolean(isMarketOrder), chunks),
      srcToken,
      dstToken,
      srcAmount,
      dstAmount: acceptedDstAmount,
      srcChunkAmount,
      chunks,
      fillDelay,
      destMinAmountOut,
      orderDeadline: deadline,
      fee,
      srcUsdAmount,
      dstUsdAmount,
      recipient: account,
      tradePrice,
    },
    swap: {
      isLoading,
      disabled: !disclaimerAccepted || isLoading,
      onSubmit: submitOrder,
      currentStep: {
        type: currentStep,
        index: currentStepIndex,
      },
      error: swapError,
      status: swapStatus,
      stepsCount,
      submitted: Boolean(swapStatus),
      unwrapTxHash,
      wrapTxHash,
      approveTxHash,
      createOrderTxHash,
    },
  };
};
