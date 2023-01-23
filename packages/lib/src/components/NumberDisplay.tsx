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
      style={{
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
      allowLeadingZeros
      thousandSeparator=","
      className={`twap-number-display ${className}`}
      displayType="text"
      decimalScale={decimalScale}
      prefix={prefix}
      suffix={suffix}
    />
  );
 if (value === "0") {
   return <>0</>;
 }
  if (hideTooltip) return component;
 
    if (value) {
      return (
        <Tooltip childrenStyles={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} placement="bottom" text={value}>
          {component}
        </Tooltip>
      );
    }
  return <>-</>;
}

export default NumberDisplay;
