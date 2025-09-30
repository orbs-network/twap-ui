import { useMemo } from "react";
import { useNumericFormat } from "react-number-format";
import { formatDecimals } from "../utils";
import { useTwapContext } from "../context/twap-context";

export const useFormatDecimals = (value?: string | number, decimalPlaces?: number) => {
  return useMemo(() => formatDecimals(value?.toString(), decimalPlaces), [value, decimalPlaces]);
};

export const useFormatNumber = ({ value, decimalScale = 3, prefix, suffix }: { value?: string | number; decimalScale?: number; prefix?: string; suffix?: string }) => {
  const _value = useFormatDecimals(value, decimalScale);
  const { overrides } = useTwapContext();
  const numberFormat = overrides?.numberFormat;

  const result = useNumericFormat({
    allowLeadingZeros: true,
    thousandSeparator: ",",
    displayType: "text",
    value: _value || "",
    decimalScale: 18,
    prefix,
    suffix,
  });

  if (numberFormat) {
    return numberFormat(value || "");
  }

  return result.value?.toString();
};
