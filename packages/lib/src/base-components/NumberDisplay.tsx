import { NumericFormat } from "react-number-format";

function NumberDisplay({ value, decimalScale = 6, prefix, className = "" }: { value?: string | number; decimalScale?: number; prefix?: string; className?: string }) {
  return value ? (
    <NumericFormat
      type="text"
      valueIsNumericString={true}
      value={value}
      allowLeadingZeros
      thousandSeparator=","
      className={`twap-number-display ${className}`}
      displayType="text"
      decimalScale={decimalScale}
      prefix={prefix}
    />
  ) : (
    <> -</>
  );
}

export default NumberDisplay;
