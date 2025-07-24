import { SwapStatus } from "@orbs-network/swap-ui";
import { useCallback } from "react";
import { useTwapContext } from "../context";
import { useTradePrice } from "../twap/submit-order-modal/usePrice";
import { useSwap, useTwapStore } from "../useTwapStore";
import { useOnCloseConfirmationModal, useOrderDeadline, useSrcTokenChunkAmount, useChunks, useFillDelay, useDestTokenMinAmount, useUsdAmount } from "./logic-hooks";
import { useOrderSubmissionArgs, useSubmitOrderCallback } from "./send-transactions-hooks";
import { useFee } from "./ui-hooks";
import { getOrderType } from "../utils";

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
  const { mutateAsync, checkingApproval: loadingApproval, isLoading: mutationLoading } = useSubmitOrderCallback();
  const srcUsdAmount = useUsdAmount(srcAmount, srcUsd1Token);
  const dstUsdAmount = useUsdAmount(acceptedDstAmount, dstUsd1Token);
  const { state: swapState } = useSwap();
  const currentStep = swapState?.activeStep;
  const swapError = swapState?.swapError;
  const swapStatus = swapState?.swapStatus;
  const stepsCount = swapState?.totalSteps;
  const currentStepIndex = swapState?.currentStepIndex;
  const disclaimerAccepted = useTwapStore((s) => s.state.disclaimerAccepted);
  const showConfirmation = useTwapStore((s) => s.state.showConfirmation);
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const unwrapTxHash = swapState?.unwrapTxHash;
  const wrapTxHash = swapState?.wrapTxHash;
  const approveTxHash = swapState?.approveTxHash;
  const createOrderTxHash = swapState?.createOrderTxHash;
  const updateState = useTwapStore((s) => s.updateState);
  const isLoading = mutationLoading || swapStatus === SwapStatus.LOADING || loadingApproval;
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
