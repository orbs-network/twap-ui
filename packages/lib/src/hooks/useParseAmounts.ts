import { useMemo } from "react";
import { amountBNV2, amountUiV2 } from "../utils";

export const useAmountBN = (decimals?: number, value?: string) => {
  return useMemo(() => amountBNV2(decimals, value), [decimals, value]);
};

export const useAmountUi = (decimals?: number, value?: string) => {
  return useMemo(() => amountUiV2(decimals, value), [decimals, value]);
};
