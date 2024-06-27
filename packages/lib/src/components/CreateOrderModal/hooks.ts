import { useMemo } from "react";
import { useTwapContext } from "../../context";
import { useConfirmationModal, useFormatNumberV2 } from "../../hooks/hooks";
import { useTwapStore } from "../../store";

export const useTokenDisplay = (isSrc?: boolean) => {
  const { outAmount, srcAmount, srcToken, dstToken, srcUsd, dstUsd } = useConfirmationModal();
  const token = isSrc ? srcToken : dstToken;
  const amount = useFormatNumberV2({ value: isSrc ? srcAmount : outAmount, decimalScale: 4 });
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
  const isLimitPanel = useTwapContext().isLimitPanel;
  const isMarketOrder = useTwapStore((s) => s.isMarketOrder);
  return useMemo(() => {
    if (isLimitPanel) {
      return "limit";
    }
    if (isMarketOrder) {
      return "market";
    }
    return "twap";
  }, [isLimitPanel, isMarketOrder]);
};
