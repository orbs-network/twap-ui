import { useMemo } from "react";
import { useTwapContext } from "../context/twap-context";
import {
  DEFAULT_STOP_LOSS_LIMIT_PERCENTAGE,
  DEFAULT_STOP_LOSS_PERCENTAGE,
  DEFAULT_TAKE_PROFIT_LIMIT_PERCENTAGE,
  DEFAULT_TAKE_PROFIT_PERCENTAGE,
  Module,
} from "@orbs-network/twap-sdk";
import { useTwapStore } from "../useTwapStore";

export const useDefaultTriggerPricePercent = () => {
  const { module } = useTwapContext();
  return useMemo(() => {
    return module === Module.STOP_LOSS ? DEFAULT_STOP_LOSS_PERCENTAGE : DEFAULT_TAKE_PROFIT_PERCENTAGE;
  }, [module]);
};

export const useDefaultLimitPricePercent = () => {
  const { module } = useTwapContext();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  return useMemo(() => {
    if ((module !== Module.STOP_LOSS && module !== Module.TAKE_PROFIT) || isMarketOrder) {
      return undefined;
    }
    const result = module === Module.STOP_LOSS ? DEFAULT_STOP_LOSS_LIMIT_PERCENTAGE : DEFAULT_TAKE_PROFIT_LIMIT_PERCENTAGE;
    return result;
  }, [module, isMarketOrder]);
};
