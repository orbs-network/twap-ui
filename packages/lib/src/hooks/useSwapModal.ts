import { stateActions } from "../context/actions";
import { useTwapContext } from "../context/context";
import { useOutAmount, useSrcAmount, useUsdAmount } from "./lib";

export const useSwapModal = () => {
  const { state, srcToken, dstToken } = useTwapContext();
  const { swapState, showConfirmation: isOpen, swapData } = state;
  const { onClose, onOpen } = stateActions.useSwapModalActions();
  const srcAmountUi = useSrcAmount().amountUi;
  const {srcUsd, dstUsd} = useUsdAmount();
  const outAmount = useOutAmount().amountUi;

  return {
    onClose,
    onOpen,
    isOpen,
    swapState,
    srcAmount: swapData?.srcAmount || srcAmountUi,
    srcUsd: swapData?.amountUsd.srcUsd || srcUsd,
    dstUsd: swapData?.amountUsd.dstUsd || dstUsd,
    outAmount: swapData?.outAmount || outAmount,
    srcToken: swapData?.srcToken || srcToken,
    dstToken: swapData?.dstToken || dstToken,
  };
};
