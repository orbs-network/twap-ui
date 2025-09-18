import React, { createContext, useContext, useMemo } from "react";
import { useTradesPanel } from "./hooks/use-chunks";
import { useDurationPanel, useFillDelayPanel, useLimitPricePanel, useMarketPricePanel } from "./twap/twap";
import { useTwapContext } from "./context";
import { useAmountBN, useAmountUi, useUsdAmount } from "./hooks/helper-hooks";
import { useTwapStore } from "./useTwapStore";
import { getDestTokenAmount, getDestTokenMinAmountPerChunk, Module } from "@orbs-network/twap-sdk";
import { useLimitPrice } from "./hooks/use-limit-price";
import { useTriggerPrice } from "./hooks/use-trigger-price";

type Panels = {
  trades: ReturnType<typeof useTradesPanel>;
  fillDelay: ReturnType<typeof useFillDelayPanel>;
  duration: ReturnType<typeof useDurationPanel>;
  limitPrice: ReturnType<typeof useLimitPricePanel>;
  marketPrice: ReturnType<typeof useMarketPricePanel>;
};

type UserContextType = {
  panels: Panels;
  derivedSwap: ReturnType<typeof useDerivedSwap>;
};

const Context = createContext({} as UserContextType);

export function UserContext({ children }: { children: React.ReactNode }) {
  const trades = useTradesPanel();
  const limitPrice = useLimitPricePanel();
  const fillDelay = useFillDelayPanel(trades.value);
  const duration = useDurationPanel(trades.value, fillDelay.value);
  const tradePrice = useTradePrice();
  const marketPrice = useMarketPricePanel();
  const derivedSwap = useDerivedSwap(tradePrice);
  const dstMinAmountPerTrade = useDstMinAmountPerTrade(tradePrice, trades.amountPerTrade).amountUI;

  return <Context.Provider value={{ derivedSwap, panels: { trades, fillDelay, duration, limitPrice } }}>{children}</Context.Provider>;
}

export const useUserContext = () => {
  return useContext(Context);
};

const useTradePrice = () => {
  const { module, marketPrice } = useTwapContext();
  const limitPrice = useLimitPrice().amountWei;
  const triggerPrice = useTriggerPrice().amountWei;
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);

  if (module === Module.LIMIT || !isMarketOrder) {
    return limitPrice || "";
  }

  if (module === Module.STOP_LOSS || module === Module.TAKE_PROFIT) {
    return triggerPrice || "";
  }

  return marketPrice || "";
};

const useDstAmount = (price?: string) => {
  const { srcToken, dstToken } = useTwapContext();
  const srcAmountWei = useAmountBN(
    srcToken?.decimals,
    useTwapStore((s) => s.state.typedSrcAmount)
  );

  const amountWei = useMemo(() => getDestTokenAmount(srcAmountWei || "", price, srcToken?.decimals || 0), [srcAmountWei, price, srcToken?.decimals]);

  return {
    amountWei,
    amountUI: useAmountUi(dstToken?.decimals, amountWei),
  };
};
const useDstMinAmountPerTrade = (tradePrice?: string, chunkPerTrade?: string) => {
  const { srcToken, dstToken } = useTwapContext();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const amountWei = useMemo(
    () => getDestTokenMinAmountPerChunk(chunkPerTrade, tradePrice, Boolean(isMarketOrder), srcToken?.decimals || 0),
    [chunkPerTrade, tradePrice, isMarketOrder, srcToken?.decimals]
  );

  return {
    amountWei,
    amountUI: useAmountUi(dstToken?.decimals, amountWei),
  };
};

function useDerivedSwap(tradePrice?: string) {
  const { srcToken, dstToken, srcUsd1Token, dstUsd1Token } = useTwapContext();

  const srcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const srcUsdAmount = useUsdAmount(srcAmount, srcUsd1Token);
  const dstAmount = useDstAmount(tradePrice).amountUI;
  const dstUsdAmount = useUsdAmount(dstAmount, dstUsd1Token);
  const state = useTwapStore((s) => s.state);

  return useMemo(() => {
    return {
      status: state.swap.status,
      error: state.swap.error,
      step: state.swap.step,
      stepIndex: state.swap.stepIndex,
      approveTxHash: state.swap.approveTxHash,
      wrapTxHash: state.swap.wrapTxHash,
      totalSteps: state.swap.totalSteps,
      srcAmount: state.swap.srcAmount || srcAmount,
      dstAmount: state.swap.dstAmount || dstAmount,
      srcToken: state.swap.srcToken || srcToken,
      dstToken: state.swap.dstToken || dstToken,
      srcUsdAmount: state.swap.srcUsdAmount || srcUsdAmount,
      dstUsdAmount: state.swap.dstUsdAmount || dstUsdAmount,
      isSubmitted: Boolean(state.swap.status),
    };
  }, [state.swap, srcAmount, dstAmount, srcToken, dstToken, srcUsdAmount, dstUsdAmount]);
}
