import { getDuration, getMaxOrderDurationError, getMinOrderDurationError, TimeDuration } from "@orbs-network/twap-sdk";
import { useMemo, useCallback } from "react";
import { useTwapContext } from "../context/twap-context";
import { useTwapStore } from "../useTwapStore";
import { InputError, InputErrors } from "../types";
import { millisToDays, millisToMinutes } from "../utils";
import { useTrades } from "./use-trades";
import { useFillDelay } from "./use-fill-delay";
import { useTranslations } from "./use-translations";

const useDurationError = (duration: TimeDuration) => {
  const { module } = useTwapContext();
  const t = useTranslations();

  return useMemo((): InputError | undefined => {
    const maxError = getMaxOrderDurationError(module, duration);
    const minError = getMinOrderDurationError(duration);

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
  }, [duration, t, module]);
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
