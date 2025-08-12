import { useMemo, useCallback } from "react";
import { useTwapContext } from "../context";
import { InputError, InputErrors } from "../types";
import { useTwapStore } from "../useTwapStore";
import { useMinChunkSizeUsd } from "./use-min-chunk-size-usd";
import { getChunks, getMaxChunksError, getMaxPossibleChunks } from "@orbs-network/twap-sdk";

export const useChunksError = () => {
  const { module } = useTwapContext();
  const t = useTwapContext().translations;
  const { chunks, maxChunks } = useChunks();

  return useMemo((): InputError | undefined => {
    if (!chunks) {
      return {
        type: InputErrors.MIN_CHUNKS,
        value: 1,
        message: `${t.minChunksError} 1`,
      };
    }
    const { isError } = getMaxChunksError(chunks, maxChunks, module);
    if (isError) {
      return {
        type: InputErrors.MAX_CHUNKS,
        value: maxChunks,
        message: t.maxChunksError.replace("{maxChunks}", `${maxChunks}`),
      };
    }
  }, [chunks, maxChunks, module]);
};

export const useChunks = () => {
  const { module } = useTwapContext();
  const typedChunks = useTwapStore((s) => s.state.typedChunks);
  const updateState = useTwapStore((s) => s.updateState);
  const maxChunks = useMaxChunks();

  const chunks = useMemo(() => getChunks(maxChunks, module, typedChunks), [maxChunks, typedChunks]);

  const setChunks = useCallback(
    (typedChunks: number) => {
      updateState({
        typedChunks,
      });
    },
    [updateState],
  );

  return {
    chunks,
    maxChunks,
    setChunks,
  };
};

const useMaxChunks = () => {
  const { srcUsd1Token } = useTwapContext();
  const minChunkSizeUsd = useMinChunkSizeUsd();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);

  return useMemo(() => getMaxPossibleChunks(typedSrcAmount || "", srcUsd1Token || "", minChunkSizeUsd || 0), [typedSrcAmount, srcUsd1Token, minChunkSizeUsd]);
};

export const useChunksPanel = () => {
  const { translations: t } = useTwapContext();
  const { setChunks, chunks } = useChunks();
  const error = useChunksError();

  return {
    error,
    trades: chunks,
    onChange: setChunks,
    label: t.tradesAmountTitle,
    tooltip: t.totalTradesTooltip,
  };
};
