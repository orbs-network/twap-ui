import React from "react";
import NumberDisplay from "./NumberDisplay";
import SmallLabel from "./SmallLabel";

const USD = ({ isLoading = false, value, className = "" }: { isLoading?: boolean; value?: string | number; className?: string }) => {
  if (value == null) return null;
  return (
    <SmallLabel loading={isLoading}>
      ~$ <NumberDisplay value={value} />
    </SmallLabel>
  );
};

export default USD;
