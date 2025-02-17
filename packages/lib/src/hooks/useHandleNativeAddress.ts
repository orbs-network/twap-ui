import { isNativeAddress } from "@defi.org/web3-candies";
import { getNetwork } from "@orbs-network/twap-sdk";
import { useMemo } from "react";
import { useWidgetContext } from "../widget/widget-context";

export function useHandleNativeAddress(address?: string) {
  const { config } = useWidgetContext();
  return useMemo(() => {
    const wTokenAddress = getNetwork(config.chainId)?.wToken.address;

    if (isNativeAddress(address || "")) {
      return wTokenAddress;
    }
    return address;
  }, [address, config.chainId]);
}
