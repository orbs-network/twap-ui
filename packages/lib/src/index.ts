import { useCallback } from "react";
import { useTwapStore } from "./useTwapStore";
export * from "./twap/twap";
export * from "./types";
export * from "./utils";
export { Configs } from "./consts";
export { useFormatNumber } from "./hooks/helper-hooks";
export const useTypedSrcAmount = () => {
  return {
    amount: useTwapStore((s) => s.state.typedSrcAmount),
    reset: useCallback(() => useTwapStore((s) => s.updateState({ typedSrcAmount: "" })), []),
  };
};
