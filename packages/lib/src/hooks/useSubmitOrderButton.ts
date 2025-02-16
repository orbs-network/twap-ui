import { SwapStatus } from "@orbs-network/swap-ui";
import { useWidgetContext } from "..";
import { useHasAllowance } from "./useAllowance";
import { useConfirmation } from "./useConfirmation";

export function useSubmitOrderButton() {
  const {
    translations: t,
    state: { swapStatus, disclaimerAccepted },
  } = useWidgetContext();
  const { onCreateOrder } = useConfirmation();
  const isLoading = swapStatus === SwapStatus.LOADING;
  const { isLoading: allowanceLoading } = useHasAllowance();
  const loading = isLoading || allowanceLoading;

  return {
    text: t.placeOrder,
    onClick: onCreateOrder,
    loading,
    disabled: loading || !disclaimerAccepted,
  };
}
