import { useCallback } from "react";
import { useTwapStore } from "../useTwapStore";

export const useTogglePricePanel = () => {
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const updateState = useTwapStore((s) => s.updateState);
  const togglePrice = useCallback(() => {
    updateState({ isMarketOrder: !isMarketOrder });
  }, [updateState, isMarketOrder]);
  return {
    isMarketPrice: !isMarketOrder,
    togglePrice,
  };
};
