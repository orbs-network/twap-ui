import { stateActions } from "../context/actions";
import { useOutAmount, useUsdAmount } from "./lib";
import { useTwapContext as useTwapContextUI } from "@orbs-network/twap-ui-sdk";

export const useSwapModal = () => {
  const { state, parsedSrcToken, parsedDstToken } = useTwapContextUI();
  const { swapStatus, showConfirmation: isOpen, typedSrcAmount } = state;
  const { onClose, onOpen } = stateActions.useSwapModalActions();
  const { srcUsd, dstUsd } = useUsdAmount();
  const outAmount = useOutAmount().amountUi;

  return {
    onClose,
    onOpen,
    isOpen,
    swapState: swapStatus,
    srcAmount: typedSrcAmount,
    srcUsd: srcUsd,
    dstUsd: dstUsd,
    outAmount: outAmount,
    srcToken: parsedSrcToken,
    dstToken: parsedDstToken,
  };
};
