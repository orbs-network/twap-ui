import { stateActions } from "../context/actions";
import { useTwapContext } from "../context/context";
import { useDstAmountUsdUi, useOutAmount, useSrcAmount, useSrcAmountUsdUi } from "./hooks";

export const useSwapModal = () => {
  const state = useTwapContext().state;
  const { swapState, showConfirmation: isOpen, swapData } = state;
  const { onClose, onOpen } = stateActions.useSwapModalActions();
  const { srcAmountUi } = useSrcAmount();
  const srcUsd = useSrcAmountUsdUi();
  const dstUsd = useDstAmountUsdUi();
  const outAmount = useOutAmount().outAmountUi;  

  return {  
    onClose,
    onOpen,
    isOpen,
    swapState,
    srcAmount: swapData?.srcAmount || srcAmountUi,
    srcUsd: swapData?.srcAmountUsd || srcUsd,
    dstUsd: swapData?.dstAmountUsd || dstUsd,
    outAmount: swapData?.outAmount || outAmount,
    srcToken: swapData?.srcToken || state.srcToken,
    dstToken: swapData?.dstToken || state.dstToken,
  };
};
