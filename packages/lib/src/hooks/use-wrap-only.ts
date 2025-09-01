import { useMutation } from "@tanstack/react-query";
import { useTwapStore } from "../useTwapStore";
import { useSrcAmount } from "./use-src-amount";
import { useWrapToken } from "./use-wrap";

export const useWrapOnly = () => {
  const { mutateAsync } = useWrapToken();
  const srcAmount = useSrcAmount().amountWei;
  const resetState = useTwapStore((s) => s.resetState);
  return useMutation(async () => {
    await mutateAsync({ amount: srcAmount });
    resetState();
  });
};
