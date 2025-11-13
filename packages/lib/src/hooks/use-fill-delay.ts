import { DEFAULT_FILL_DELAY, getMinFillDelayError, TimeDuration, TimeUnit } from "@orbs-network/twap-sdk";
import { useMemo, useCallback } from "react";
import { useTwapStore } from "../useTwapStore";
import BN from "bignumber.js";
import { InputError, InputErrors, millisToMinutes } from "..";
import { useTranslations } from "./use-translations";
import { useTwapContext } from "../context/twap-context";

const useFillDelayError = (fillDelay: TimeDuration) => {
  const t = useTranslations();
  const { marketPrice } = useTwapContext();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const minFillDelayError = useMemo((): InputError | undefined => {
    const { isError, value } = getMinFillDelayError(fillDelay);
    if (!isError || BN(typedSrcAmount || "0").isZero() || !marketPrice) return undefined;
    return {
      type: InputErrors.MIN_FILL_DELAY,
      value: value,
      message: t("minFillDelayError", { fillDelay: `${millisToMinutes(value)} ${t("minutes")}` }),
    };
  }, [fillDelay, t, typedSrcAmount, marketPrice]);

  return minFillDelayError;
};

export const useFillDelay = () => {
  const typedFillDelay = useTwapStore((s) => s.state.typedFillDelay);
  const updateState = useTwapStore((s) => s.updateState);
  const fillDelay = useMemo(() => typedFillDelay || DEFAULT_FILL_DELAY, [typedFillDelay]);
  const error = useFillDelayError(fillDelay);

  return {
    fillDelay,
    onChange: useCallback((typedFillDelay: TimeDuration) => updateState({ typedFillDelay }), [updateState]),
    error,
  };
};

export const useFillDelayPanel = () => {
  const { onChange, fillDelay, error } = useFillDelay();
  const t = useTranslations();
  const onInputChange = useCallback((value: string) => onChange({ unit: fillDelay.unit, value: Number(value) }), [onChange, fillDelay]);
  const onUnitSelect = useCallback((unit: TimeUnit) => onChange({ unit, value: fillDelay.value }), [onChange, fillDelay]);

  return {
    onInputChange,
    onUnitSelect,
    onChange,
    milliseconds: fillDelay.unit * fillDelay.value,
    fillDelay,
    error,
    label: t("tradeIntervalTitle"),
    tooltip: t("tradeIntervalTootlip"),
  };
};
