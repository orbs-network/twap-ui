import { useMemo } from "react";
import { useWidgetContext } from "..";
import { getNetwork } from "@orbs-network/twap-sdk";

export const useNetwork = () => {
  const { config } = useWidgetContext();

  return useMemo(() => {
    return getNetwork(config.chainId);
  }, [config]);
};
