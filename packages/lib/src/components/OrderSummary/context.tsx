import { createContext, useContext } from "react";
import { Token } from "../../types";

export interface OrderSummaryContextArgs {
  srcUsd?: string;
  dstUsd?: string;
  srcAmount?: string;
  outAmount?: string;
  deadline?: number;
  srcToken?: Token;
  dstToken?: Token;
  srcChunkAmount?: string;
  isMarketOrder?: boolean;
  dstMinAmountOut?: string;
  chunks?: number;
  fillDelayMillis?: number;
}

export const OrderSummaryContext = createContext({} as OrderSummaryContextArgs);

export const useOrderSummaryContext = () => useContext(OrderSummaryContext);
