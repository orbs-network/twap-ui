import { useTriggerPrice } from "./use-trigger-price";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { useMemo } from "react";
import { useAmountUi } from "./helper-hooks";
import { getTriggerPricePerChunk } from "@orbs-network/twap-sdk";
import { useChunks } from "./use-chunks";

export const useTriggerAmountPerChunk = () => {
  const { srcToken, dstToken, module } = useTwapContext();
  const triggerPrice = useTriggerPrice().amountWei;
  const amountPerTrade = useChunks().amountPerTradeWei;
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);

  const result = useMemo(() => {
    return getTriggerPricePerChunk(module, amountPerTrade, triggerPrice, srcToken?.decimals || 0);
  }, [triggerPrice, amountPerTrade, isMarketOrder, srcToken?.decimals, module]);

  return {
    amountWei: result,
    amountUI: useAmountUi(dstToken?.decimals || 0, result),
  };
};
