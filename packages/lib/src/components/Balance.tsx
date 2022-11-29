import React from "react";
import { useTwapContext } from "../context";
import NumberDisplay from "./NumberDisplay";
import SmallLabel from "./SmallLabel";

interface Props {
  isLoading: boolean;
  value?: string;
  className?: string;
}

function Balance({ isLoading, value, className = "" }: Props) {
  const translations = useTwapContext().translations;
  if (value == null) {
    return null;
  }
  return (
    <SmallLabel loading={isLoading} className={className}>
      {translations.balance}: <NumberDisplay value={value} />
    </SmallLabel>
  );
}

export default Balance;
