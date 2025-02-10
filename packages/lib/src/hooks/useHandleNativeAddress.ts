import { isNativeAddress } from "@defi.org/web3-candies";
import React, { useMemo } from "react";
import { useNetwork } from "./useNetwork";

export function useHandleNativeAddress(address?: string) {
  const wTokenAddress = useNetwork()?.wToken.address;
  return useMemo(() => {
    if (isNativeAddress(address || "")) {
      return wTokenAddress;
    }
    return address;
  }, [address, wTokenAddress]);
}
