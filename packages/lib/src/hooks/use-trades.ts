import { useMemo, useCallback } from "react";
import { useTwapContext } from "../context/twap-context";
import { InputError, InputErrors } from "../types";
import { useTwapStore } from "../useTwapStore";
import { useMinChunkSizeUsd } from "./use-min-chunk-size-usd";
import { getChunks, getMaxChunksError, getMaxPossibleChunks, getSrcTokenChunkAmount, getMinTradeSizeError } from "@orbs-network/twap-sdk";
import { useFillDelay } from "./use-fill-delay";
import { useSrcAmount } from "./use-src-amount";
import { useAmountUi, useFormatNumber } from "./helper-hooks";
import BN from "bignumber.js";
import { useTranslations } from "./use-translations";

const useTradesError = (amount: number, maxAmount: number) => {
  const { module, srcUsd1Token, marketPrice } = useTwapContext();
  const t = useTranslations();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const minChunkSizeUsd = useMinChunkSizeUsd();

  return useMemo((): InputError | undefined => {
    if (BN(typedSrcAmount || "0").isZero() || !marketPrice) return;
    if (!amount) {
      return {
        type: InputErrors.MIN_CHUNKS,
        value: 1,
        message: `${t("minChunksError")} 1`,
      };
    }
    const { isError: maxChunksError } = getMaxChunksError(amount, maxAmount, module);
    if (maxChunksError) {
      return {
        type: InputErrors.MAX_CHUNKS,
        value: maxAmount,
        message: t("maxChunksError", { maxChunks: `${maxAmount}` }),
      };
    }
    const { isError: minTradeSizeError, value: minTradeSizeValue } = getMinTradeSizeError(typedSrcAmount || "", srcUsd1Token || "", minChunkSizeUsd || 0);

    if (minTradeSizeError) {
      return {
        type: InputErrors.MIN_TRADE_SIZE,
        value: minTradeSizeValue,
        message: t("minTradeSizeError", { minTradeSize: `${minTradeSizeValue} USD` }),
      };
    }
  }, [amount, maxAmount, module, typedSrcAmount, srcUsd1Token, minChunkSizeUsd, t, marketPrice]);
};

export const useTrades = () => {
  const { srcToken, srcUsd1Token, module } = useTwapContext();
  const typedChunks = useTwapStore((s) => s.state.typedChunks);
  const fillDelay = useFillDelay().fillDelay;
  const minChunkSizeUsd = useMinChunkSizeUsd();
  const updateState = useTwapStore((s) => s.updateState);
  const { amountWei: srcAmountWei, amountUI: srcAmountUI } = useSrcAmount();

  const maxTrades = useMemo(
    () => getMaxPossibleChunks(fillDelay, srcAmountUI || "", srcUsd1Token || "", minChunkSizeUsd || 0),
    [srcAmountUI, srcUsd1Token, minChunkSizeUsd, fillDelay],
  );

  const totalTrades = useMemo(() => getChunks(maxTrades, module, typedChunks), [maxTrades, typedChunks, module]);

  const onChange = useCallback(
    (typedChunks: number) =>
      updateState({
        typedChunks,
      }),
    [updateState],
  );

  const amountPerTrade = useMemo(() => getSrcTokenChunkAmount(srcAmountWei || "", totalTrades), [srcAmountWei, totalTrades]);
  const amountPerTradeUI = useAmountUi(srcToken?.decimals, amountPerTrade);

  const usd = useMemo(() => {
    if (!srcUsd1Token) return "0";
    return BN(amountPerTradeUI || "0")
      .times(srcUsd1Token || 0)
      .toString();
  }, [amountPerTradeUI, srcUsd1Token]);

  return {
    totalTrades,
    maxTrades,
    amountPerTradeUI,
    amountPerTradeWei: amountPerTrade,
    amountPerTradeUsd: usd,
    onChange,
    error: useTradesError(totalTrades, maxTrades),
  };
};

export const useTradesPanel = () => {
  const { srcToken, dstToken } = useTwapContext();
  const t = useTranslations();
  const { onChange, totalTrades, amountPerTradeUsd, amountPerTradeUI, error, maxTrades, amountPerTradeWei } = useTrades();
  const amountPerTradeUIF = useFormatNumber({ value: amountPerTradeUI });
  const usdF = useFormatNumber({ value: amountPerTradeUsd });
  return {
    error,
    maxTrades,
    totalTrades,
    amountPerTrade: amountPerTradeUIF,
    amountPerTradeWei,
    onChange,
    label: t("tradesAmountTitle"),
    tooltip: t("totalTradesTooltip"),
    amountPerTradeUsd: usdF,
    fromToken: srcToken,
    toToken: dstToken,
  };
};
