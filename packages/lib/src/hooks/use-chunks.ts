import { useMemo, useCallback } from "react";
import { useTwapContext } from "../context";
import { InputError, InputErrors } from "../types";
import { useTwapStore } from "../useTwapStore";
import { useMinChunkSizeUsd } from "./use-min-chunk-size-usd";
import { getChunks, getMaxChunksError, getMaxPossibleChunks, getSrcTokenChunkAmount, getMinTradeSizeError } from "@orbs-network/twap-sdk";
import { useFillDelay } from "./use-fill-delay";
import { useSrcAmount } from "./use-src-amount";
import { useAmountUi } from "./helper-hooks";
import BN from "bignumber.js";

export const useChunksError = (amount: number, maxAmount: number) => {
  const { module, srcUsd1Token } = useTwapContext();
  const t = useTwapContext().translations;
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const minChunkSizeUsd = useMinChunkSizeUsd();


  return useMemo((): InputError | undefined => {
    if (!amount) {
      return {
        type: InputErrors.MIN_CHUNKS,
        value: 1,
        message: `${t.minChunksError} 1`,
      };
    }
    const { isError: maxChunksError } = getMaxChunksError(amount, maxAmount, module);
    if (maxChunksError) {
      return {
        type: InputErrors.MAX_CHUNKS,
        value: maxAmount,
        message: t.maxChunksError.replace("{maxChunks}", `${maxAmount}`),
      };
    }
    const { isError: minTradeSizeError, value: minTradeSizeValue } = getMinTradeSizeError(typedSrcAmount || "", srcUsd1Token || "", minChunkSizeUsd || 0);

    if (minTradeSizeError) {
      return {
        type: InputErrors.MIN_TRADE_SIZE,
        value: minTradeSizeValue,
        message: t.minTradeSizeError.replace("{minTradeSize}", `${minTradeSizeValue} USD`),
      };
    }
  }, [amount, maxAmount, module, typedSrcAmount, srcUsd1Token, minChunkSizeUsd, t]);
};

export const useChunks = () => {
  const { module, srcToken, srcUsd1Token } = useTwapContext();
  const typedChunks = useTwapStore((s) => s.state.typedChunks);
  const updateState = useTwapStore((s) => s.updateState);
  const maxAmount = useMaxChunks();
  const srcAmountWei = useSrcAmount().amountWei;

  const amount = useMemo(() => getChunks(maxAmount, module, typedChunks), [maxAmount, typedChunks]);

  const onChange = useCallback(
    (typedChunks: number) => {
      updateState({
        typedChunks,
      });
    },
    [updateState],
  );

  const amountPerTrade = useMemo(() => getSrcTokenChunkAmount(srcAmountWei || "", amount), [srcAmountWei, amount]);
  const amountPerTradeUI = useAmountUi(srcToken?.decimals, amountPerTrade);

  const usd = useMemo(() => {
    if (!srcUsd1Token) return "0";
    return BN(amountPerTradeUI || "0")
      .times(srcUsd1Token || 0)
      .toString();
  }, [amountPerTradeUI, srcUsd1Token]);

  return {
    amount,
    maxAmount,
    amountPerTrade: amountPerTradeUI,
    amountPerTradeWei: amountPerTrade,
    amountPerTradeUsd: usd,
    onChange,
    error: useChunksError(amount, maxAmount),
  };
};

const useMaxChunks = () => {
  const { srcUsd1Token } = useTwapContext();
  const minChunkSizeUsd = useMinChunkSizeUsd();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const fillDelay = useFillDelay().fillDelay;

  return useMemo(() => getMaxPossibleChunks(fillDelay, typedSrcAmount || "", srcUsd1Token || "", minChunkSizeUsd || 0), [typedSrcAmount, srcUsd1Token, minChunkSizeUsd, fillDelay]);
};


