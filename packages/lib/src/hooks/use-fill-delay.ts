import { getFillDelay, getMinFillDelayError, TimeDuration } from "@orbs-network/twap-sdk";
import { useMemo, useCallback } from "react";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { InputError, InputErrors, millisToMinutes } from "..";

const useFillDelayError = (fillDelay: TimeDuration) => {
  const { translations: t } = useTwapContext();
  const minFillDelayError = useMemo((): InputError | undefined => {
    const { isError, value } = getMinFillDelayError(fillDelay);
    if (!isError) return undefined;
    return {
      type: InputErrors.MIN_FILL_DELAY,
      value: value,
      message: t.minFillDelayError.replace("{fillDelay}", `${millisToMinutes(value)} ${t.minutes}`),
    };
  }, [fillDelay, t]);

  return minFillDelayError;
};

export const useFillDelay = () => {
  const typedFillDelay = useTwapStore((s) => s.state.typedFillDelay);
  const updateState = useTwapStore((s) => s.updateState);
  const fillDelay = useMemo(() => getFillDelay(typedFillDelay), [typedFillDelay]);
  const error = useFillDelayError(fillDelay);

  return {
    fillDelay,
    onChange: useCallback((typedFillDelay: TimeDuration) => updateState({ typedFillDelay }), [updateState]),
    error,
  };
};
