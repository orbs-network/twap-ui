import { useMemo } from "react";
import BN from "bignumber.js";
import { useTwapContext } from "../context/twap-context";
import { Module } from "@orbs-network/twap-sdk";
import { LIMIT_TRIGGER_PRICE_DELTA_PERCENTAGE, SLIPPAGE_MULTIPLIER } from "../consts";
import { useTwapStore } from "../useTwapStore";

export const useDefaultTriggerPricePercent = () => {
  const { slippage, module } = useTwapContext();

  return useMemo(() => {
    let result = BN(slippage).multipliedBy(SLIPPAGE_MULTIPLIER);
    result = module === Module.STOP_LOSS ? result.multipliedBy(-1) : result;
    return result.decimalPlaces(0).toNumber();
  }, [slippage, module]);
};

export const useDefaultLimitPricePercent = () => {
  const { slippage, module } = useTwapContext();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  return useMemo(() => {
    if ((module !== Module.STOP_LOSS && module !== Module.TAKE_PROFIT) || isMarketOrder) {
      return undefined;
    }
    const result = BN(slippage).multipliedBy(LIMIT_TRIGGER_PRICE_DELTA_PERCENTAGE);
    if (module === Module.STOP_LOSS) {
      return result.multipliedBy(-1).decimalPlaces(0).toNumber();
    } else {
      return Math.max(result.minus(LIMIT_TRIGGER_PRICE_DELTA_PERCENTAGE).decimalPlaces(0).toNumber(), 2);
    }
  }, [slippage, module, isMarketOrder]);
};
