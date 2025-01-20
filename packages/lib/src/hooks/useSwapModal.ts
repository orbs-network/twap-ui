import { stateActions } from "../context/actions";
import { useTwapContext } from "../context/context";

export const useSwapModal = () => {
  const {
    state: { showConfirmation: isOpen },
  } = useTwapContext();
  const { onClose, onOpen } = stateActions.useSwapModalActions();

  return {
    onClose,
    onOpen,
    isOpen,
  };
};
