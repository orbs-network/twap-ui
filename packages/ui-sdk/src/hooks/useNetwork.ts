import { network } from "@defi.org/web3-candies";
import { useMemo } from "react";
import { useTwapContext } from "../context";

export function useNetwork() {
  const { sdk } = useTwapContext();
  return useMemo(() => {
    return network(sdk.config.chainId);
  }, [sdk.config.chainId]);
}
