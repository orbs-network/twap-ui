import { useMemo } from "react";
import { useWidgetContext } from "../../context/context";
import { useFormatNumberV2 } from "../../hooks/hooks";
import { useTwapContext } from "@orbs-network/twap-ui-sdk";

export const useTokenDisplay = (isSrc?: boolean) => {
  const {
    state: { swapData },
  } = useWidgetContext();
  const token = isSrc ? swapData.srcToken : swapData.dstToken;
  const amount = useFormatNumberV2({ value: isSrc ? swapData.srcAmount : swapData.outAmount, decimalScale: 3 });
  const usd = useFormatNumberV2({ value: isSrc ? swapData.srcAmountusd : swapData.outAmountusd, decimalScale: 2 });
  const title = isSrc ? "From" : "To";
  return {
    token,
    amount,
    usd,
    title,
  };
};

export const useOrderType = () => {
  const { translations: t } = useWidgetContext();
  const {
    isLimitPanel,
    derivedValues: { isMarketOrder },
  } = useTwapContext();

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
