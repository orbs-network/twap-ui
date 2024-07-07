import { useMemo } from "react";
import { useTwapContext } from "../../context/context";
import { useConfirmationModal } from "../../hooks/useConfirmationModal";
import { useFormatNumberV2, useIsMarketOrder } from "../../hooks/hooks";

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
  const isLimitPanel = useTwapContext().dappProps.isLimitPanel;
  const isMarketOrder = useIsMarketOrder();
  return useMemo(() => {
    if (isLimitPanel) {
      return "Limit";
    }
    if (isMarketOrder) {
      return "dTWAP Market";
    }
    return "dTWAP Limit";
  }, [isLimitPanel, isMarketOrder]);
};
