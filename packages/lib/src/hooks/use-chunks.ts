import { useMemo, useCallback } from "react";
import { useTwapContext } from "../context";
import { InputError, InputErrors } from "../types";
import { useTwapStore } from "../useTwapStore";
import { useMinChunkSizeUsd } from "./use-min-chunk-size-usd";

const useChunksError = (chunks: number, maxChunks: number) => {
  const { twapSDK, module } = useTwapContext();
  const t = useTwapContext().translations;

  return useMemo((): InputError | undefined => {
    if (!chunks) {
      return {
        type: InputErrors.MIN_CHUNKS,
        value: 1,
        message: `${t.minChunksError} 1`,
      };
    }
    const { isError } = twapSDK.getMaxChunksError(chunks, maxChunks, module);
    if (isError) {
      return {
        type: InputErrors.MAX_CHUNKS,
        value: maxChunks,
        message: t.maxChunksError.replace("{maxChunks}", `${maxChunks}`),
      };
    }
  }, [chunks, twapSDK, maxChunks, module]);
};

export const useChunks = () => {
  const { twapSDK, module } = useTwapContext();
  const typedChunks = useTwapStore((s) => s.state.typedChunks);
  const updateState = useTwapStore((s) => s.updateState);
  const maxChunks = useMaxChunks();

  const chunks = useMemo(() => twapSDK.getChunks(maxChunks, module, typedChunks), [maxChunks, typedChunks, twapSDK]);
  const error = useChunksError(chunks, maxChunks);

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
    error,
  };
};

const useMaxChunks = () => {
  const { twapSDK, srcUsd1Token } = useTwapContext();
  const minChunkSizeUsd = useMinChunkSizeUsd();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);

  return useMemo(() => twapSDK.getMaxChunks(typedSrcAmount || "", srcUsd1Token || "", minChunkSizeUsd || 0), [typedSrcAmount, srcUsd1Token, twapSDK]);
};

export const useChunksPanel = () => {
  const { translations: t } = useTwapContext();
  const { setChunks, chunks, error } = useChunks();
  return {
    error,
    trades: chunks,
    onChange: setChunks,
    label: t.tradesAmountTitle,
    tooltip: t.totalTradesTooltip,
  };
};
