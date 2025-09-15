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
import { useFees } from "./use-fees";
import { useDstMinAmountPerChunk } from "./use-dst-min-amount-out-per-chunk";
import { useSubmitOrder } from "./use-submit-order";
import { useTriggerAmountPerChunk } from "./use-trigger-amount-per-chunk";
import { useSwap } from "./use-swap";

const useOrderDetails = () => {
  const { account } = useTwapContext();
  const {
    swap: { dstAmount, srcAmount, srcUsdAmount, dstUsdAmount, srcToken, dstToken },
  } = useSwap();
  const deadline = useDeadline();
  const srcChunkAmount = useSrcChunkAmount().amountUI;
  const chunks = useChunks().chunks;
  const { fillDelay } = useFillDelay();
  const destMinAmountOutPerChunk = useDstMinAmountPerChunk().amountUI;
  const triggerPricePerChunk = useTriggerAmountPerChunk().amountUI;
  const { amount: feeAmount, percent: feePercent } = useFees();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const tradePrice = useTradePrice();

  const orderType = useMemo(() => {
    return getOrderType(Boolean(isMarketOrder), chunks);
  }, [isMarketOrder, chunks]);

  return {
    orderType,
    srcToken,
    dstToken,
    srcAmount: srcAmount || "",
    dstAmount: dstAmount || "",
    srcChunkAmount,
    chunks,
    fillDelay: fillDelay.value * fillDelay.unit,
    destMinAmountOutPerChunk,
    triggerPricePerChunk,
    deadline,
    feeAmount,
    feePercent,
    srcUsdAmount,
    dstUsdAmount,
    recipient: account,
    tradePrice,
  };
};

export const useOrderExecutionFlow = () => {
  const { mutateAsync: onSubmitOrder, isLoading: mutationLoading } = useSubmitOrder();
  const resetState = useTwapStore((s) => s.resetState);
  const fetchingAllowance = useTwapStore((s) => s.state.fetchingAllowance);
  const {
    swap: { status, error, step, stepIndex, approveTxHash, wrapTxHash, totalSteps },
  } = useSwap();
  const disclaimerAccepted = useTwapStore((s) => s.state.disclaimerAccepted);
  const unwrapTxHash = useTwapStore((s) => s.state.unwrapTxHash);
  const updateState = useTwapStore((s) => s.updateState);
  const isLoading = mutationLoading || status === SwapStatus.LOADING || fetchingAllowance;
  const isOpen = useTwapStore((s) => s.state.showConfirmation);
  const orderDetails = useOrderDetails();

  const setDisclaimerAccepted = useCallback(
    (accepted: boolean) => {
      updateState({ disclaimerAccepted: accepted });
    },
    [updateState],
  );

  const onClose = useCallback(() => {
    updateState({ showConfirmation: false });
    if (status === SwapStatus.SUCCESS) {
      resetState();
    }
  }, [updateState, status, resetState]);

  const onReset = useCallback(() => {
    resetState();
  }, [resetState]);

  return {
    disclaimerAccepted,
    onDisclaimerChange: setDisclaimerAccepted,
    isLoading,
    onSubmitOrder,
    currentStep: step,
    currentStepIndex: stepIndex,
    error: error,
    status: status,
    totalSteps: totalSteps,
    submitted: Boolean(status),
    unwrapTxHash,
    wrapTxHash,
    approveTxHash,
    onClose,
    isOpen: Boolean(isOpen),
    onReset,
    orderDetails,
  };
};
