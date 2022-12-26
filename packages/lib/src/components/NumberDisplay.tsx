import { NumericFormat } from "react-number-format";
import Tooltip from "./Tooltip";

function NumberDisplay({
  value,
  decimalScale = 3,
  prefix,
  className = "",
  suffix,
  hideTooltip = false,
}: {
  value?: string | number;
  decimalScale?: number;
  prefix?: string;
  className?: string;
  suffix?: string;
  hideTooltip?: boolean;
}) {
  const component = (
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
  );

  if (hideTooltip) return component;
  if (value) {
    return <Tooltip text={value}>{component}</Tooltip>;
  }
  return <>-</>;
}

export default NumberDisplay;
