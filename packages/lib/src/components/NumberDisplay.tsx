import { NumericFormat } from "react-number-format";
import Tooltip from "./Tooltip";

function NumberDisplay({
  value,
  decimalScale = 3,
  prefix,
  className = "",
  suffix,
}: {
  value?: string | number;
  decimalScale?: number;
  prefix?: string;
  className?: string;
  suffix?: string;
}) {
  return value ? (
    <Tooltip text={value}>
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
        suffix={suffix}
      />
    </Tooltip>
  ) : (
    <> -</>
  );
}

export default NumberDisplay;
