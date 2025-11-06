import { getDestTokenAmount, getDestTokenMinAmountPerChunk } from "@orbs-network/twap-sdk";
import { useMemo } from "react";
import { useTwapContext } from "../context/twap-context";
import { useTwapStore } from "../useTwapStore";
import { useAmountUi, useUsdAmount } from "./helper-hooks";
import { useTradePrice } from "./use-trade-price";
import { useTrades } from "./use-trades";
import { useSrcAmount } from "./use-src-amount";

export const useDstTokenAmount = () => {
  const { srcToken, dstToken } = useTwapContext();
  const tradePrice = useTradePrice();
  const srcAmountWei = useSrcAmount().amountWei;

  const amountWei = useMemo(() => getDestTokenAmount(srcAmountWei || "", tradePrice, srcToken?.decimals || 0), [srcAmountWei, tradePrice, srcToken?.decimals]);

  return {
    amountWei,
    amountUI: useAmountUi(dstToken?.decimals, amountWei),
  };
};

export const useDstMinAmountPerTrade = () => {
  const { srcToken, dstToken, dstUsd1Token } = useTwapContext();
  const tradePrice = useTradePrice();
  const chunkPerTrade = useTrades().amountPerTradeWei;
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);

  const amountWei = useMemo(
    () => getDestTokenMinAmountPerChunk(chunkPerTrade, tradePrice, Boolean(isMarketOrder), srcToken?.decimals || 0),
    [chunkPerTrade, tradePrice, isMarketOrder, srcToken?.decimals],
  );
const amountUI = useAmountUi(dstToken?.decimals, amountWei);
  return {
    amountWei,
    amountUI,
    usd: useUsdAmount(amountUI, dstUsd1Token),
  };
};
