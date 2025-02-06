import { useMemo } from "react";
import { useWidgetContext } from "..";

export const useOrderName = () => {
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
