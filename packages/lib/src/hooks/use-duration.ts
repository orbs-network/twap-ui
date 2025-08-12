import { getDuration, getMaxOrderDurationError, getMinOrderDurationError, Module, TimeDuration, TimeUnit } from "@orbs-network/twap-sdk";
import { useMemo, useCallback } from "react";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { useChunks } from "./use-chunks";
import { useFillDelay } from "./use-fill-delay";
import { InputError, InputErrors } from "../types";
import { millisToDays, millisToMinutes } from "../utils";
import { DEFAULT_DURATION_OPTIONS } from "../twap/consts";

export const useDurationError = () => {
  const { translations: t, module } = useTwapContext();
  const duration = useDuration().duration;

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
  const { chunks } = useChunks();
  const { fillDelay } = useFillDelay();
  const typedDuration = useTwapStore((s) => s.state.typedDuration);
  const updateState = useTwapStore((s) => s.updateState);
  const duration = useMemo(() => getDuration(module, chunks, fillDelay, typedDuration), [chunks, fillDelay, typedDuration, module]);

  return {
    duration,
    setDuration: useCallback((typedDuration: TimeDuration) => updateState({ typedDuration }), [updateState]),
  };
};

export const useDurationPanel = () => {
  const { translations: t, module } = useTwapContext();
  const { duration, setDuration } = useDuration();
  const error = useDurationError();

  const onInputChange = useCallback(
    (value: string) => {
      setDuration({ unit: duration.unit, value: Number(value) });
    },
    [setDuration, duration],
  );

  const onUnitSelect = useCallback(
    (unit: TimeUnit) => {
      setDuration({ unit, value: duration.value });
    },
    [setDuration, duration],
  );

  const tooltip = useMemo(() => {
    if (module === Module.STOP_LOSS) {
      return t.stopLossDurationTooltip;
    }
    return t.maxDurationTooltip;
  }, [t, module]);

  return {
    duration,
    setDuration,
    durationMillis: duration.unit * duration.value,
    onInputChange,
    onUnitSelect,
    title: t.expiry,
    tooltip,
    error,
    units: DEFAULT_DURATION_OPTIONS,
  };
};
