import { useMemo, useCallback } from "react";
import { useTwapContext } from "../context";
import { InputError, InputErrors } from "../types";
import { useTwapStore } from "../useTwapStore";
import { useMinChunkSizeUsd } from "./use-min-chunk-size-usd";
import { getChunks, getMaxChunksError, getMaxPossibleChunks } from "@orbs-network/twap-sdk";
import { useFillDelay } from "./use-fill-delay";

export const useChunksError = () => {
  const { module } = useTwapContext();
  const t = useTwapContext().translations;
  const { amount, maxAmount } = useChunks();

  return useMemo((): InputError | undefined => {
    if (!amount) {
      return {
        type: InputErrors.MIN_CHUNKS,
        value: 1,
        message: `${t.minChunksError} 1`,
      };
    }
    const { isError } = getMaxChunksError(amount, maxAmount, module);
    if (isError) {
      return {
        type: InputErrors.MAX_CHUNKS,
        value: maxAmount,
        message: t.maxChunksError.replace("{maxChunks}", `${maxAmount}`),
      };
    }
  }, [amount, maxAmount, module]);
};

export const useChunks = () => {
  const { module } = useTwapContext();
  const typedChunks = useTwapStore((s) => s.state.typedChunks);
  const updateState = useTwapStore((s) => s.updateState);
  const maxAmount = useMaxChunks();

  const amount = useMemo(() => getChunks(maxAmount, module, typedChunks), [maxAmount, typedChunks]);

  const onChange = useCallback(
    (typedChunks: number) => {
      updateState({
        typedChunks,
      });
    },
    [updateState],
  );

  return {
    amount,
    maxAmount,
    onChange,
  };
};

const useMaxChunks = () => {
  const { srcUsd1Token } = useTwapContext();
  const minChunkSizeUsd = useMinChunkSizeUsd();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const fillDelay = useFillDelay().fillDelay;

  return useMemo(() => getMaxPossibleChunks(fillDelay, typedSrcAmount || "", srcUsd1Token || "", minChunkSizeUsd || 0), [typedSrcAmount, srcUsd1Token, minChunkSizeUsd, fillDelay]);
};

export const useChunksPanel = () => {
  const { translations: t } = useTwapContext();
  const { onChange, amount } = useChunks();
  const error = useChunksError();

  return {
    error,
    amount,
    onChange,
    label: t.tradesAmountTitle,
    tooltip: t.totalTradesTooltip,
  };
};
