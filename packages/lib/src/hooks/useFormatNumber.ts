import { useMemo } from "react";
import { useNumericFormat } from "react-number-format";
import { useWidgetContext } from "..";
import { formatDecimals } from "../utils";
import BN from "bignumber.js";

export const useFormatDecimals = (value?: string | BN | number, decimalPlaces?: number) => {
  return useMemo(() => formatDecimals(value, decimalPlaces), [value, decimalPlaces]);
};

export const useFormatNumber = ({ value, decimalScale = 3, prefix, suffix }: { value?: string | number; decimalScale?: number; prefix?: string; suffix?: string }) => {
  const { input } = useWidgetContext().uiPreferences;
  const _value = useFormatDecimals(value, decimalScale);
  const result = useNumericFormat({
    allowLeadingZeros: true,
    thousandSeparator: input?.disableThousandSeparator ? "" : ",",
    displayType: "text",
    value: _value || "",
    decimalScale: 18,
    prefix,
    suffix,
  });

  return result.value?.toString();
};
