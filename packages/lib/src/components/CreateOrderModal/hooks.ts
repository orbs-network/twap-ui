import { useMemo } from "react";
import { useWidgetContext } from "../../context/context";
import { useFormatNumber } from "../../hooks/hooks";

export const useTokenDisplay = (isSrc?: boolean) => {
  const {
    state: { swapData },
  } = useWidgetContext();
  const token = isSrc ? swapData.srcToken : swapData.dstToken;
  const amount = useFormatNumber({ value: isSrc ? swapData.srcAmount : swapData.outAmount, decimalScale: 3 });
  const usd = useFormatNumber({ value: isSrc ? swapData.srcAmountusd : swapData.outAmountusd, decimalScale: 2 });
  const title = isSrc ? "From" : "To";
  return {
    token,
    amount,
    usd,
    title,
  };
};

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
