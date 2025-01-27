import { stateActions } from "../context/actions";
import { useWidgetContext } from "../context/context";

export const useSwapModal = () => {
  const {
    state: { showConfirmation: isOpen },
  } = useWidgetContext();
  const { onClose, onOpen } = stateActions.useSwapModalActions();

  return {
    onClose,
    onOpen,
    isOpen,
  };
};
