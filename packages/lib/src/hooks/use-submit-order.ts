import { useMutation } from "@tanstack/react-query";
import { useSubmitOnChainOrder } from "./use-submit-on-chain-order";

export const useSubmitOrderCallback = () => {
  const { mutateAsync: submitOnChainOrder } = useSubmitOnChainOrder();
  return useMutation({
    mutationFn: async () => {
      return submitOnChainOrder();
    },
  });
};
