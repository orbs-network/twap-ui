import { getFillDelay, getMaxFillDelayError, getMinFillDelayError, TimeDuration } from "@orbs-network/twap-sdk";
import { useMemo, useCallback } from "react";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { InputError, InputErrors, millisToDays, millisToMinutes } from "..";

const useFillDelayError = (chunks: number, fillDelay: TimeDuration) => {
  const { translations: t } = useTwapContext();

  const maxFillDelayError = useMemo((): InputError | undefined => {
    const { isError, value } = getMaxFillDelayError(fillDelay, chunks);
    if (!isError) return undefined;
    return {
      type: InputErrors.MAX_FILL_DELAY,
      value: value,
      message: t.maxFillDelayError.replace("{fillDelay}", `${Math.floor(millisToDays(value)).toFixed(0)} ${t.days}`),
    };
  }, [fillDelay, chunks, t]);

  const minFillDelayError = useMemo((): InputError | undefined => {
    const { isError, value } = getMinFillDelayError(fillDelay);
    if (!isError) return undefined;
    return {
      type: InputErrors.MIN_FILL_DELAY,
      value: value,
      message: t.minFillDelayError.replace("{fillDelay}", `${millisToMinutes(value)} ${t.minutes}`),
    };
  }, [fillDelay, t]);

  return maxFillDelayError || minFillDelayError;
};

export const useFillDelay = (chunks: number) => {
  const typedFillDelay = useTwapStore((s) => s.state.typedFillDelay);
  const updateState = useTwapStore((s) => s.updateState);
  const fillDelay = useMemo(() => getFillDelay(typedFillDelay), [typedFillDelay]);
  const error = useFillDelayError(chunks, fillDelay);

  return {
    fillDelay,
    onChange: useCallback((typedFillDelay: TimeDuration) => updateState({ typedFillDelay }), [updateState]),
    error,
  };
};
