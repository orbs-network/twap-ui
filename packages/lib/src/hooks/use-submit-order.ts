import { useMutation } from "@tanstack/react-query";
import { useTwapContext } from "../context";
import { useSubmitOnChainOrder } from "./use-submit-on-chain-order";
import { useSubmitStopLossOrder } from "./use-submit-stop-loss-order";
import { Panel } from "../types";

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
