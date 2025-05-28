import { eqIgnoreCase } from "@orbs-network/twap-sdk";
import { useTokenList } from "../hooks";
import { useCallback } from "react";

export const useGetToken = () => {
  const tokens = useTokenList();

  return useCallback(
    (addressOrSymbol?: string) => {
      return tokens?.find((it: any) => eqIgnoreCase(it.address || "", addressOrSymbol || "") || eqIgnoreCase(it.symbol || "", addressOrSymbol || ""));
    },
    [tokens],
  );
};
