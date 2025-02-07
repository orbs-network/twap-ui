import { useCallback, useMemo } from "react";
import { useWidgetContext } from "..";

export const useGetOrderNameCallback = () => {
  const { translations: t } = useWidgetContext();
  return useCallback(
    (isMarketOrder?: boolean, chunks = 1) => {
      if (isMarketOrder) {
        return t.twapMarket;
      }
      if (chunks === 1) {
        return t.limit;
      }
      return t.twapLimit;
    },
    [t],
  );
};

export const useOrderName = () => {
  const { twap } = useWidgetContext();
  const {
    values: { isMarketOrder },
  } = twap;

  const getName = useGetOrderNameCallback();

  return useMemo(() => {
    return getName(isMarketOrder, twap.values.chunks);
  }, [getName, isMarketOrder, twap.values.chunks]);
};
