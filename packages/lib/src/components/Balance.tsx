import React from "react";
import { useTwapTranslations } from "../hooks";
import NumberDisplay from "./NumberDisplay";
import SmallLabel from "./SmallLabel";

interface Props {
  isLoading: boolean;
  value?: string;
  className?: string;
}

function Balance({ isLoading, value, className = "" }: Props) {
  const translations = useTwapTranslations();
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
