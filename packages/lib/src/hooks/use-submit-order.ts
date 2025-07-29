import { useMutation } from "@tanstack/react-query";
import { useSubmitOnChainOrder } from "./use-submit-on-chain-order";
import { useSubmitStopLossOrder } from "./use-submit-stop-loss-order";

export const useSubmitOrderCallback = () => {
  const { mutateAsync: submitOnChainOrder } = useSubmitOnChainOrder();
  const { mutateAsync: submitStopLossOrder } = useSubmitStopLossOrder();
  return useMutation({
    mutationFn: async () => {
      //   if (panel === Panel.STOP_LOSS) {
      //     return submitStopLossOrder();
      //   }
      return submitOnChainOrder();
    },
  });
};
