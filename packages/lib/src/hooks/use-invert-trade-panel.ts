import { useCallback } from "react";
import { useTwapStore } from "../useTwapStore";
import BN from "bignumber.js";
import { useTwapContext } from "../context/twap-context";

export const useInvertTradePanel = () => {
  const { srcToken, dstToken, marketPriceLoading } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);
  const isInverted = useTwapStore((s) => s.state.isInvertedTrade);
  const typedTriggerPrice = useTwapStore((s) => s.state.typedTriggerPrice);
  const typedLimitPrice = useTwapStore((s) => s.state.typedLimitPrice);
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const onInvert = useCallback(() => {
    if (marketPriceLoading) return;
    if (typedTriggerPrice !== undefined) {
      updateState({ typedTriggerPrice: BN(1).div(typedTriggerPrice).toFixed() });
    }
    if (typedLimitPrice !== undefined) {
      updateState({ typedLimitPrice: BN(1).div(typedLimitPrice).toFixed() });
    }
    updateState({ isInvertedTrade: !isInverted });
  }, [updateState, isInverted, typedTriggerPrice, typedLimitPrice, marketPriceLoading]);

  return {
    onInvert,
    isInverted,
    fromToken: isInverted ? dstToken : srcToken,
    toToken: isInverted ? srcToken : dstToken,
    isMarketPrice: isMarketOrder,
  };
};
