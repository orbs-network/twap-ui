import { useMemo } from "react";
import { useTwapContext } from "../../context/context";
import { useSwapModal } from "../../hooks/useSwapModal";
import { useFormatNumberV2 } from "../../hooks/hooks";
import { useIsMarketOrder } from "../../hooks";

export const useTokenDisplay = (isSrc?: boolean) => {
  const { outAmount, srcAmount, srcToken, dstToken, srcUsd, dstUsd } = useSwapModal();
  const token = isSrc ? srcToken : dstToken;
  const amount = useFormatNumberV2({ value: isSrc ? srcAmount : outAmount, decimalScale: 3 });
  const usd = useFormatNumberV2({ value: isSrc ? srcUsd : dstUsd, decimalScale: 2 });
  const title = isSrc ? "From" : "To";
  return {
    token,
    amount,
    usd,
    title,
  };
};

export const useOrderType = () => {
  const { isLimitPanel, translations: t } = useTwapContext();
  const isMarketOrder = useIsMarketOrder();

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
