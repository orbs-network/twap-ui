import { TimeUnit } from "@orbs-network/twap-sdk";
import { useCallback } from "react";
import { useTwapContext } from "../context";
import { useFillDelay } from "./use-fill-delay";

export const useFillDelayPanel = (chunks: number) => {
  const { onChange, fillDelay, error } = useFillDelay(chunks);
  const { translations: t } = useTwapContext();
  const onInputChange = useCallback((value: string) => onChange({ unit: fillDelay.unit, value: Number(value) }), [onChange, fillDelay]);
  const onUnitSelect = useCallback((unit: TimeUnit) => onChange({ unit, value: fillDelay.value }), [onChange, fillDelay]);

  return {
    onInputChange,
    onUnitSelect,
    onChange,
    milliseconds: fillDelay.unit * fillDelay.value,
    value: fillDelay,
    error,
    label: t.tradeIntervalTitle,
    tooltip: t.tradeIntervalTootlip,
  };
};
