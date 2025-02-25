import { SwapStatus } from "@orbs-network/swap-ui";
import { useWidgetContext } from "..";
import { useHasAllowance } from "./useAllowance";
import { useConfirmationModal } from "./useConfirmationModal";

export function useSubmitOrderButton() {
  const {
    translations: t,
    state: { swapStatus, disclaimerAccepted },
  } = useWidgetContext();
  const { onSubmitOrder } = useConfirmationModal();
  const isLoading = swapStatus === SwapStatus.LOADING;
  const { isLoading: allowanceLoading } = useHasAllowance();
  const loading = isLoading || allowanceLoading;

  return {
    text: t.placeOrder,
    onClick: onSubmitOrder,
    loading,
    disabled: loading || !disclaimerAccepted,
  };
}
