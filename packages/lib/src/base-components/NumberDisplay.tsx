import { NumericFormat } from "react-number-format";

function NumberDisplay({ value, decimalScale = 6, prefix }: { value?: string | number; decimalScale?: number; prefix?: string }) {
  return value ? (
    <NumericFormat
      type="text"
      valueIsNumericString={true}
      value={value}
      allowLeadingZeros
      thousandSeparator=","
      className="twap-number-display"
      displayType="text"
      decimalScale={decimalScale}
      prefix={prefix}
    />
  ) : (
    <> -</>
  );
}

export default NumberDisplay;
