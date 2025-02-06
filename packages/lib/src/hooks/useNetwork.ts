import { networks } from "@defi.org/web3-candies";
import { useMemo } from "react";
import { useWidgetContext } from "..";

export const useNetwork = () => {
  const { config } = useWidgetContext();

  return useMemo(() => {
    return Object.values(networks).find((network) => network.id === config.chainId);
  }, [config]);
};
