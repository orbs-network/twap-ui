import { TimeDuration, TimeUnit } from "@orbs-network/twap-sdk";
import { useMemo, useCallback } from "react";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { DEFAULT_DURATION_OPTIONS, InputError, InputErrors, millisToDays, millisToMinutes } from "..";
import { useChunks } from "./use-chunks";

export const useFillDelayError = () => {
  const { twapSDK, translations: t } = useTwapContext();
  const { chunks } = useChunks();
  const fillDelay = useFillDelay().fillDelay;

  const maxFillDelayError = useMemo((): InputError | undefined => {
    const { isError, value } = twapSDK.getMaxFillDelayError(fillDelay, chunks);
    if (!isError) return undefined;
    return {
      type: InputErrors.MAX_FILL_DELAY,
      value: value,
      message: t.maxFillDelayError.replace("{fillDelay}", `${Math.floor(millisToDays(value)).toFixed(0)} ${t.days}`),
    };
  }, [fillDelay, twapSDK, chunks, t]);

  const minFillDelayError = useMemo((): InputError | undefined => {
    const { isError, value } = twapSDK.getMinFillDelayError(fillDelay);
    if (!isError) return undefined;
    return {
      type: InputErrors.MIN_FILL_DELAY,
      value: value,
      message: t.minFillDelayError.replace("{fillDelay}", `${millisToMinutes(value)} ${t.minutes}`),
    };
  }, [fillDelay, twapSDK, t]);

  return maxFillDelayError || minFillDelayError;
};

export const useFillDelay = () => {
  const { twapSDK } = useTwapContext();
  const typedFillDelay = useTwapStore((s) => s.state.typedFillDelay);
  const updateState = useTwapStore((s) => s.updateState);
  const fillDelay = useMemo(() => twapSDK.getFillDelay(typedFillDelay), [typedFillDelay, twapSDK]);

  return {
    fillDelay,
    setFillDelay: useCallback((typedFillDelay: TimeDuration) => updateState({ typedFillDelay }), [updateState]),
  };
};

export const useFillDelayPanel = () => {
  const { setFillDelay, fillDelay } = useFillDelay();
  const error = useFillDelayError();
  const { translations: t } = useTwapContext();

  const onInputChange = useCallback(
    (value: string) => {
      setFillDelay({ unit: fillDelay.unit, value: Number(value) });
    },
    [setFillDelay, fillDelay],
  );

  const onUnitSelect = useCallback(
    (unit: TimeUnit) => {
      setFillDelay({ unit, value: fillDelay.value });
    },
    [setFillDelay, fillDelay],
  );

  return {
    onInputChange,
    onUnitSelect,
    setFillDelay,
    milliseconds: fillDelay.unit * fillDelay.value,
    fillDelay,
    error,
    title: t.tradeIntervalTitle,
    tooltip: t.tradeIntervalTootlip,
    units: DEFAULT_DURATION_OPTIONS,
  };
};
