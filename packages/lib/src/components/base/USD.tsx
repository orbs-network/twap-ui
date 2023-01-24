import React from "react";
import NumberDisplay from "./NumberDisplay";
import SmallLabel from "./SmallLabel";

const USD = ({ isLoading = false, value, className = "", prefix = "" }: { prefix?: string; isLoading?: boolean; value?: string | number; className?: string }) => {
  if (value == null) return null;
  return (
    <SmallLabel loading={isLoading} className={`twap-usd ${className}`}>
      {prefix} ~ $ <NumberDisplay value={value} />
    </SmallLabel>
  );
};

export default USD;
