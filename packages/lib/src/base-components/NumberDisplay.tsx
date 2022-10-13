import React from "react";
import { NumericFormat } from "react-number-format";

function NumberDisplay({ value}: { value?: string | number}) {
  return <NumericFormat value={value} allowLeadingZeros thousandSeparator="," className="twap-number-display" displayType="text" />;
}

export default NumberDisplay;
