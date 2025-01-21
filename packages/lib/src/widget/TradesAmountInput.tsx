import { ReactNode } from "react";
import { ChunkSelector, Labels } from "../components";
import { useShouldWrapOrUnwrapOnly } from "../hooks";

export const TradesAmountInput = ({ children }: { children: ReactNode }) => {
  const shouldWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();
  if (shouldWrapOrUnwrapOnly) return null;

  return <>{children}</>;
};

TradesAmountInput.Label = Labels.TotalTradesLabel;
TradesAmountInput.Input = ChunkSelector.Input;
