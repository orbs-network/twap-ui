import { useMemo } from "react";
import { useLimitPriceStore, useTwapStore } from "./store";
import BN from "bignumber.js";

export const useAmountOut = (amount?: string, limitPriceDecrease?: number) => {
  const inverted = useLimitPriceStore().inverted;
  const isLimitOrder = useTwapStore((s) => s.isLimitOrder);
  return useMemo(() => {
    if (!amount) return;
    if (!limitPriceDecrease) return amount;
    const amountBN = BN(amount);
    if (inverted) {
      return amountBN.multipliedBy(1 + limitPriceDecrease).toString();
    }
    if (isLimitOrder) {
      return amountBN.multipliedBy(1 - limitPriceDecrease).toString();
    }
    return amount;
  }, [amount, isLimitOrder, inverted, limitPriceDecrease]);
};
