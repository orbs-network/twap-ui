import { useMemo } from "react";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { useUsdAmount } from "./helper-hooks";
import { useDstMinAmountPerTrade, useDstTokenAmount } from "./use-dst-amount";
import { useSrcAmount } from "./use-src-amount";
import { useTriggerPrice } from "./use-trigger-price";
import { useTrades } from "./use-trades";

export function useDerivedSwap() {
  const { srcToken, dstToken, srcUsd1Token, dstUsd1Token } = useTwapContext();
  const state = useTwapStore((s) => s.state);

  const srcAmount = useSrcAmount().amountUI;
  const dstAmount = useDstTokenAmount().amountUI;
  const dstUsdAmount = useUsdAmount(dstAmount, dstUsd1Token);
  const srcUsdAmount = useUsdAmount(srcAmount, srcUsd1Token);

  const dstMinAmountPerTrade = useDstMinAmountPerTrade().amountUI;
  const triggerPricePerTrade = useTriggerPrice().amountPerTradeUI;
  const { amountPerTradeUI } = useTrades();

  return useMemo(() => {
    return {
      srcAmount: state.swap.srcAmount || srcAmount,
      dstAmount: state.swap.dstAmount || dstAmount,
      srcToken: state.swap.srcToken || srcToken,
      dstToken: state.swap.dstToken || dstToken,
      srcUsdAmount: state.swap.srcUsdAmount || srcUsdAmount,
      dstUsdAmount: state.swap.dstUsdAmount || dstUsdAmount,
      dstMinAmountPerTrade: dstMinAmountPerTrade,
      triggerPricePerTrade: triggerPricePerTrade,
      srcAmountPerTrade: amountPerTradeUI,
    };
  }, [state.swap, srcAmount, dstAmount, srcToken, dstToken, srcUsdAmount, dstUsdAmount, dstMinAmountPerTrade, triggerPricePerTrade, amountPerTradeUI]);
}
