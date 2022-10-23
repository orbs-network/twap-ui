import { NumericFormat } from "react-number-format";

function NumberDisplay({ value }: { value?: string | number }) {
  return value ? (
    <NumericFormat
      type="text"
      valueIsNumericString={true}
      value={value}
      allowLeadingZeros
      thousandSeparator=","
      className="twap-number-display"
      displayType="text"
      decimalScale={6}
    />
  ) : (
    <> -</>
  );
}

export default NumberDisplay;
