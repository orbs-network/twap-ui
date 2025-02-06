import { SwapStatus } from "@orbs-network/swap-ui";
import { useWidgetContext } from "..";
import { useHasAllowance } from "./useAllowance";
import { useSwapModal } from "./useSwapModal";

export function useSubmitOrderButton() {
  const {
    translations: t,
    state: { swapStatus, disclaimerAccepted },
  } = useWidgetContext();
  const { onSubmit } = useSwapModal();
  const isLoading = swapStatus === SwapStatus.LOADING;
  const { isLoading: allowanceLoading } = useHasAllowance();
  const loading = isLoading || allowanceLoading;

  return {
    text: t.placeOrder,
    onClick: onSubmit,
    loading,
    disabled: loading || !disclaimerAccepted,
  };
}
