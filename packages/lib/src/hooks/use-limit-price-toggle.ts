import { useCallback } from "react";
import { useTwapStore } from "../useTwapStore";
import { useTwapContext } from "../context";
import { Module } from "@orbs-network/twap-sdk";

export const useLimitPriceToggle = () => {
  const { module } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const triggerPricePercent = useTwapStore((s) => s.state.triggerPricePercent) || 0;

  const setIsMarketOrder = useCallback(
    (value: boolean) => {
      if (!value && module === Module.STOP_LOSS) {
        updateState({ limitPricePercent: triggerPricePercent - 5 });
      }

      updateState({ isMarketOrder: value });
    },
    [updateState, triggerPricePercent, module],
  );

  return {
    isMarketOrder,
    setIsMarketOrder,
  };
};
