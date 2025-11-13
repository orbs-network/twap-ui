import { getDuration, getMaxOrderDurationError, getMinOrderDurationError, Module, TimeDuration, TimeUnit } from "@orbs-network/twap-sdk";
import { useMemo, useCallback } from "react";
import { useTwapContext } from "../context/twap-context";
import { useTwapStore } from "../useTwapStore";
import { InputError, InputErrors } from "../types";
import { millisToDays, millisToMinutes } from "../utils";
import { useTrades } from "./use-trades";
import { useFillDelay } from "./use-fill-delay";
import { useTranslations } from "./use-translations";

const useDurationError = (duration: TimeDuration) => {
  const { module, marketPrice } = useTwapContext();
  const t = useTranslations();

  return useMemo((): InputError | undefined => {
    const maxError = getMaxOrderDurationError(module, duration);
    const minError = getMinOrderDurationError(duration);
    if (!marketPrice) return undefined;

    if (maxError.isError) {
      return {
        type: InputErrors.MAX_ORDER_DURATION,
        value: maxError.value,
        message: t("maxDurationError", { duration: `${Math.floor(millisToDays(maxError.value)).toFixed(0)} ${t("days")}` }),
      };
    }
    if (minError.isError) {
      return {
        type: InputErrors.MIN_ORDER_DURATION,
        value: minError.value,
        message: t("minDurationError", { duration: `${Math.floor(millisToMinutes(minError.value)).toFixed(0)} ${t("minutes")}` }),
      };
    }
  }, [duration, t, module, marketPrice]);
};

export const useDuration = () => {
  const { module } = useTwapContext();
  const typedDuration = useTwapStore((s) => s.state.typedDuration);
  const updateState = useTwapStore((s) => s.updateState);
  const totalTrades = useTrades().totalTrades;
  const fillDelay = useFillDelay().fillDelay;
  const duration = useMemo(() => getDuration(module, totalTrades, fillDelay, typedDuration), [totalTrades, fillDelay, typedDuration, module]);
  const error = useDurationError(duration);

  return {
    duration,
    setDuration: useCallback((typedDuration: TimeDuration) => updateState({ typedDuration }), [updateState]),
    error,
  };
};

export const useDurationPanel = () => {
  const { module } = useTwapContext();
  const t = useTranslations();
  const { duration, setDuration, error } = useDuration();

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
      return t("stopLossDurationTooltip");
    }
    return t("maxDurationTooltip");
  }, [t, module]);

  return {
    duration,
    onChange: setDuration,
    milliseconds: duration.unit * duration.value,
    onInputChange,
    onUnitSelect,
    label: t("expiry"),
    tooltip,
    error,
  };
};
