import { ReactNode } from "react";
import { TradeInterval } from "../components";
import { useShouldWrapOrUnwrapOnly } from "../hooks";

export const FillDelaySelector = ({ children }: { children: ReactNode }) => {
  const shouldWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();
  if (shouldWrapOrUnwrapOnly) return null;

  return <>{children}</>;
};

FillDelaySelector.Label = TradeInterval.Label;
FillDelaySelector.Input = TradeInterval.Input;
FillDelaySelector.Resolution = TradeInterval.Resolution;
