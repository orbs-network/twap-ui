import { useTwapContext } from "../context";
import { Module } from "../types";
import { useTwapStore } from "../useTwapStore";
import { useLimitPrice } from "./use-limit-price";
import { useTriggerPrice } from "./use-trigger-price";

export const useTradePrice = () => {
  const { module, marketPrice } = useTwapContext();
  const limitPrice = useLimitPrice().amountWei;
  const triggerPrice = useTriggerPrice().amountWei;
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);

  if (module === Module.LIMIT || !isMarketOrder) {
    return limitPrice || "";
  }

  if (module === Module.STOP_LOSS) {
    return triggerPrice || "";
  }

  return marketPrice || "";
};
