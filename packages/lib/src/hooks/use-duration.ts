import { getDuration, getMaxFillDelayError, getMaxOrderDurationError, getMinOrderDurationError, Module, TimeDuration, TimeUnit } from "@orbs-network/twap-sdk";
import { useMemo, useCallback } from "react";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { InputError, InputErrors } from "../types";
import { millisToDays, millisToMinutes } from "../utils";

export const useDurationError = (duration: TimeDuration) => {
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

export const useDuration = (chunks: number, fillDelay: TimeDuration) => {
  const { module } = useTwapContext();
  const typedDuration = useTwapStore((s) => s.state.typedDuration);
  const updateState = useTwapStore((s) => s.updateState);
  const duration = useMemo(() => getDuration(module, chunks, fillDelay, typedDuration), [chunks, fillDelay, typedDuration, module]);

  return {
    duration,
    setDuration: useCallback((typedDuration: TimeDuration) => updateState({ typedDuration }), [updateState]),
  };
};

export const useDurationPanel = (chunks: number, fillDelay: TimeDuration) => {
  const { translations: t, module } = useTwapContext();
  const { duration, setDuration } = useDuration(chunks, fillDelay);
  const error = useDurationError(duration);

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
    value: duration,
    onChange: setDuration,
    milliseconds: duration.unit * duration.value,
    onInputChange,
    onUnitSelect,
    label: t.expiry,
    tooltip,
    error,
  };
};
