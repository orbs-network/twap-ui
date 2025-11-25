import { useCallback } from "react";
import { useTwapStore } from "./useTwapStore";
export * from "./twap/twap";
export * from "./types";
export * from "./utils";
export { Configs, PRICE_PROTECTION_SETTINGS } from "./consts";
export { useFormatNumber } from "./hooks/helper-hooks";
export const useTypedSrcAmount = () => {
  const updateState = useTwapStore((s) => s.updateState);

  return {
    amount: useTwapStore((s) => s.state.typedSrcAmount),
    reset: useCallback(() => updateState({ typedSrcAmount: "" }), [updateState]),
  };
};
