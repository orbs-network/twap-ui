import React, { ReactNode } from "react";
import { ChunkSelector, Labels } from "../../components";
import { useShouldWrapOrUnwrapOnly } from "../../hooks/lib";

export const TradesAmountSelect = ({ children }: { children: ReactNode }) => {
  const shouldWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();
  if (shouldWrapOrUnwrapOnly) return null;

  return <>{children}</>;
};

TradesAmountSelect.Label = Labels.TotalTradesLabel;
TradesAmountSelect.Input = ChunkSelector.Input;
