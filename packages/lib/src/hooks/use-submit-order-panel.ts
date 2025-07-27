import { SwapStatus } from "@orbs-network/swap-ui";
import { useCallback } from "react";
import { useTwapContext } from "../context";
import { useTradePrice } from "../twap/submit-order-modal/usePrice";
import { useTwapStore } from "../useTwapStore";
import { useOnCloseConfirmationModal, useOrderDeadline, useSrcTokenChunkAmount, useChunks, useFillDelay, useDestTokenMinAmount, useUsdAmount } from "./logic-hooks";
import { useFee } from "./ui-hooks";
import { getOrderType } from "../utils";
import { useSubmitOrderCallback } from "./use-submit-order";
import { useOrderSubmissionArgs } from "./use-order-submission-args";

export const useSubmitOrderPanel = () => {
  const { dstUsd1Token, srcUsd1Token, account, srcToken, dstToken } = useTwapContext();
  const acceptedDstAmount = useTwapStore((s) => s.state.acceptedDstAmount);
  const onClose = useOnCloseConfirmationModal();
  const deadline = useOrderDeadline();
  const srcChunkAmount = useSrcTokenChunkAmount().amountUI;
  const chunks = useChunks().chunks;
  const { fillDelay } = useFillDelay();
  const destMinAmountOut = useDestTokenMinAmount().amountUI;
  const srcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const fee = useFee();
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
