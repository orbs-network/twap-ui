import { useMemo } from "react";
import { stateActions } from "../context/actions";
import { useTwapContext } from "../context/context";
import { useDstAmountUsdUi, useOutAmount, useSrcAmount, useSrcAmountUsdUi } from "./hooks";

export const useConfirmationModal = () => {
  const state = useTwapContext().state;
  const { swapState, showConfirmation } = state;

  const { onClose, onOpen } = stateActions.useSwapModalActions();
  const { srcAmountUi, srcAmountBN } = useSrcAmount();
  const srcUsd = useSrcAmountUsdUi();
  const dstUsd = useDstAmountUsdUi();
  const outAmount = useOutAmount().outAmountUi;
  const title = useMemo(() => {
    if (!swapState) {
      return "Review order";
    }
  }, [swapState]);

  return {
    onClose,
    onOpen,
    isOpen: showConfirmation,
    title,
    swapState,
    ...state,
    srcAmount: srcAmountUi,
    srcAmountBN: srcAmountBN.toString(),
    srcUsd,
    dstUsd,
    outAmount,
  };
};
