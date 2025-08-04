import { useTriggerPrice } from "./use-trigger-price";
import { useTwapContext } from "../context";
import { useSrcChunkAmount } from "./use-src-chunk-amount";
import { useTwapStore } from "../useTwapStore";
import { useMemo } from "react";
import { useAmountUi } from "./helper-hooks";

export const useTriggerAmountPerChunk = () => {
  const { twapSDK, srcToken, dstToken } = useTwapContext();
  const triggerPrice = useTriggerPrice().amountWei;
  const srcChunkAmount = useSrcChunkAmount().amountWei;
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);

  const result = useMemo(() => {
    return twapSDK.getTriggerPricePerChunk(srcChunkAmount, triggerPrice, srcToken?.decimals || 0);
  }, [triggerPrice, srcChunkAmount, isMarketOrder, srcToken?.decimals]);

  return {
    amountWei: result,
    amountUI: useAmountUi(dstToken?.decimals || 0, result),
  };
};
