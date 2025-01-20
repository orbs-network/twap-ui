import { stateActions } from "../context/actions";
import { useOutAmount, useUsdAmount } from "./lib";
import { useTwapContext as useTwapContextUI } from "@orbs-network/twap-ui-sdk";
import { useTwapContext } from "../context/context";

export const useSwapModal = () => {
  const {
    parsedSrcToken,
    parsedDstToken,
    state: { typedSrcAmount },
  } = useTwapContextUI();
  const {
    state: { swapStatus, showConfirmation: isOpen },
  } = useTwapContext();
  const { onClose, onOpen } = stateActions.useSwapModalActions();
  const { srcUsd, dstUsd } = useUsdAmount();
  const outAmount = useOutAmount().amountUi;

  return {
    onClose,
    onOpen,
    isOpen,
    swapStatus,
    srcAmount: typedSrcAmount,
    srcUsd: srcUsd,
    dstUsd: dstUsd,
    outAmount: outAmount,
    srcToken: parsedSrcToken,
    dstToken: parsedDstToken,
  };
};
