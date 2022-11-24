import React from "react";
import NumberDisplay from "./NumberDisplay";
import SmallLabel from "./SmallLabel";

interface Props {
  isLoading: boolean;
  value?: string;
}

function Balance({ isLoading, value }: Props) {
  if (value == null) {
    return null;
  }
  return (
    <SmallLabel loading={isLoading}>
      Balance: <NumberDisplay value={value} />
    </SmallLabel>
  );
}

export default Balance;
