import { getDuration, getMaxOrderDurationError, getMinOrderDurationError, TimeDuration } from "@orbs-network/twap-sdk";
import { useMemo, useCallback } from "react";
import { useTwapContext } from "../context/twap-context";
import { useTwapStore } from "../useTwapStore";
import { InputError, InputErrors } from "../types";
import { millisToDays, millisToMinutes } from "../utils";
import { useTrades } from "./use-trades";
import { useFillDelay } from "./use-fill-delay";

const useDurationError = (duration: TimeDuration) => {
  const { translations: t, module } = useTwapContext();

  return useMemo((): InputError | undefined => {
    const maxError = getMaxOrderDurationError(module, duration);
    const minError = getMinOrderDurationError(duration);

    if (maxError.isError) {
      return {
        type: InputErrors.MAX_ORDER_DURATION,
        value: maxError.value,
        message: t.maxDurationError.replace("{duration}", `${Math.floor(millisToDays(maxError.value)).toFixed(0)} ${t.days}`),
      };
    }
    if (minError.isError) {
      return {
        type: InputErrors.MIN_ORDER_DURATION,
        value: minError.value,
        message: t.minDurationError.replace("{duration}", `${Math.floor(millisToMinutes(minError.value)).toFixed(0)} ${t.minutes}`),
      };
    }
  }, [duration, t, module]);
};

export const useDuration = () => {
  const { module } = useTwapContext();
  const typedDuration = useTwapStore((s) => s.state.typedDuration);
  const updateState = useTwapStore((s) => s.updateState);
  const chunks = useTrades().trades;
  const fillDelay = useFillDelay().fillDelay;
  const duration = useMemo(() => getDuration(module, chunks, fillDelay, typedDuration), [chunks, fillDelay, typedDuration, module]);
  const error = useDurationError(duration);

  return {
    duration,
    setDuration: useCallback((typedDuration: TimeDuration) => updateState({ typedDuration }), [updateState]),
    error,
  };
};
