import { useMemo } from "react";
import { useWidgetContext } from "../widget-context";

export const useOrderType = () => {
    const { translations: t, isLimitPanel, twap } = useWidgetContext();
    const {
      values: { isMarketOrder },
    } = twap;
  
    return useMemo(() => {
      if (isLimitPanel) {
        return t.limit;
      }
      if (isMarketOrder) {
        return t.twapMarket;
      }
      return t.twapLimit;
    }, [isLimitPanel, isMarketOrder, t]);
  };
  