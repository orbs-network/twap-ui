import { DEFAULT_FILL_DELAY, getMinFillDelayError, TimeDuration } from "@orbs-network/twap-sdk";
import { useMemo, useCallback } from "react";
import { useTwapStore } from "../useTwapStore";
import BN from "bignumber.js";
import { InputError, InputErrors, millisToMinutes } from "..";
import { useTranslations } from "./use-translations";

const useFillDelayError = (fillDelay: TimeDuration) => {
  const t = useTranslations();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const minFillDelayError = useMemo((): InputError | undefined => {
    const { isError, value } = getMinFillDelayError(fillDelay);
    if (!isError || BN(typedSrcAmount || "0").isZero()) return undefined;
    return {
      type: InputErrors.MIN_FILL_DELAY,
      value: value,
      message: t("minFillDelayError", { fillDelay: `${millisToMinutes(value)} ${t("minutes")}` }),
    };
  }, [fillDelay, t, typedSrcAmount]);

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
