import { SwapStatus } from "@orbs-network/swap-ui";
import { useCallback, useMemo } from "react";
import { useTwapContext } from "../context";
import { useTradePrice } from "../twap/submit-order-modal/usePrice";
import { useTwapStore } from "../useTwapStore";
import { getOrderType } from "../utils";
import { useDeadline } from "./use-deadline";
import { useSrcChunkAmount } from "./use-src-chunk-amount";
import { useFillDelay } from "./use-fill-delay";
import { useChunks } from "./use-chunks";
import { useExplorerLink, useUsdAmount } from "./helper-hooks";
import { useFees } from "./use-fees";
import { useDstMinAmountPerChunk } from "./use-dst-min-amount-out-per-chunk";
import { useSubmitOrder } from "./use-submit-order";
import { useTriggerAmountPerChunk } from "./use-trigger-amount-per-chunk";

const useOrderDetails = () => {
  const { dstUsd1Token, srcUsd1Token, account, srcToken, dstToken } = useTwapContext();
  const acceptedDstAmount = useTwapStore((s) => s.state.acceptedDstAmount);
  const deadline = useDeadline();
  const srcChunkAmount = useSrcChunkAmount().amountUI;
  const chunks = useChunks().chunks;
  const { fillDelay } = useFillDelay();
  const destMinAmountOutPerChunk = useDstMinAmountPerChunk().amountUI;
  const triggerPricePerChunk = useTriggerAmountPerChunk().amountUI;
  const srcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const _fee = useFees();
  const srcUsdAmount = useUsdAmount(srcAmount, srcUsd1Token);
  const dstUsdAmount = useUsdAmount(acceptedDstAmount, dstUsd1Token);
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const tradePrice = useTradePrice();

  const fee = useMemo(() => {
    if (!_fee) return "";
    return {
      amount: _fee.amountUI,
      percent: _fee,
    };
  }, [_fee, acceptedDstAmount]);

  const orderType = useMemo(() => {
    return getOrderType(Boolean(isMarketOrder), chunks);
  }, [isMarketOrder, chunks]);

  return {
    orderType,
    srcToken,
    dstToken,
    srcAmount: srcAmount || "",
    dstAmount: acceptedDstAmount || "",
    srcChunkAmount,
    chunks,
    fillDelay: fillDelay.value * fillDelay.unit,
    destMinAmountOutPerChunk,
    triggerPricePerChunk,
    deadline,
    fee,
    srcUsdAmount,
    dstUsdAmount,
    recipient: account,
    tradePrice,
  };
};

export const useOrderExecutionFlow = () => {
  const { mutateAsync, isLoading: mutationLoading } = useSubmitOrder();
  const resetState = useTwapStore((s) => s.resetState);
  const fetchingAllowance = useTwapStore((s) => s.state.fetchingAllowance);
  const currentStep = useTwapStore((s) => s.state.activeStep);
  const swapError = useTwapStore((s) => s.state.swapError);
  const swapStatus = useTwapStore((s) => s.state.swapStatus);
  const totalSteps = useTwapStore((s) => s.state.totalSteps);
  const currentStepIndex = useTwapStore((s) => s.state.currentStepIndex);
  const disclaimerAccepted = useTwapStore((s) => s.state.disclaimerAccepted);
  const unwrapTxHash = useTwapStore((s) => s.state.unwrapTxHash);
  const wrapTxHash = useTwapStore((s) => s.state.wrapTxHash);
  const approveTxHash = useTwapStore((s) => s.state.approveTxHash);
  const createOrderTxHash = useTwapStore((s) => s.state.createOrderTxHash);
  const updateState = useTwapStore((s) => s.updateState);
  const isLoading = mutationLoading || swapStatus === SwapStatus.LOADING || fetchingAllowance;
  const isOpen = useTwapStore((s) => s.state.showConfirmation);
  const explorerUrl = useExplorerLink(createOrderTxHash);
  const orderDetails = useOrderDetails();

  const setDisclaimerAccepted = useCallback(
    (accepted: boolean) => {
      updateState({ disclaimerAccepted: accepted });
    },
    [updateState],
  );

  const onSubmitOrder = useCallback(() => mutateAsync(), [mutateAsync]);

  const onClose = useCallback(() => {
    updateState({ showConfirmation: false });
    if (swapStatus === SwapStatus.SUCCESS) {
      resetState();
    }
  }, [updateState, swapStatus, resetState]);

  const onReset = useCallback(() => {
    resetState();
  }, [resetState]);

  return {
    disclaimerAccepted,
    onDisclaimerChange: setDisclaimerAccepted,
    isLoading,
    onSubmitOrder,
    currentStep,
    currentStepIndex,
    error: swapError,
    status: swapStatus,
    totalSteps,
    submitted: Boolean(swapStatus),
    unwrapTxHash,
    wrapTxHash,
    approveTxHash,
    createOrderTxHash,
    onClose,
    isFlowOpen: isOpen,
    onReset,
    explorerUrl,
    orderDetails,
  };
};
