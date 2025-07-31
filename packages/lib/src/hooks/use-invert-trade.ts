import { useCallback } from "react";
import { useTwapStore } from "../useTwapStore";
import BN from "bignumber.js";

export const useInvertTrade = () => {
  const updateState = useTwapStore((s) => s.updateState);
  const isInverted = useTwapStore((s) => s.state.isInvertedTrade);
  const typedTriggerPrice = useTwapStore((s) => s.state.typedTriggerPrice);
  const typedLimitPrice = useTwapStore((s) => s.state.typedLimitPrice);

  const onInvert = useCallback(() => {
    if (typedTriggerPrice !== undefined) {
      updateState({ typedTriggerPrice: BN(1).div(typedTriggerPrice).toFixed() });
    }
    if (typedLimitPrice !== undefined) {
      updateState({ typedLimitPrice: BN(1).div(typedLimitPrice).toFixed() });
    }
    updateState({ isInvertedTrade: !isInverted });
  }, [updateState, isInverted, typedTriggerPrice, typedLimitPrice]);

  return {
    onInvert,
    isInverted,
  };
};
