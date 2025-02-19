import { useQuery } from "@tanstack/react-query";
import { Config, networks } from "@orbs-network/twap-sdk";
import BN from "bignumber.js";
import { TX_GAS_COST } from "../consts";
const addressMap = {
  [networks.eth.id]: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
};

const abi = [{ inputs: [], name: "latestAnswer", outputs: [{ internalType: "int256", name: "", type: "int256" }], stateMutability: "view", type: "function" }];

export const useMinChunkSizeUsd = (config: Config, publicClient?: any) => {
  const address = addressMap[config.chainId];
  const query = useQuery({
    queryKey: ["useMinChunkSizeUsd", config.chainId],
    queryFn: async () => {
      if (!address) return null;
      const latestAnswer = await publicClient!.readContract({
        address,
        abi,
        functionName: "latestAnswer",
      });

      const ethUsdPrice = BN(latestAnswer).div(1e8).toNumber();
      const result = await publicClient!.estimateFeesPerGas();
      const maxFeePerGas = result.maxFeePerGas;
      const minChunkSizeUsd = BN(TX_GAS_COST)
        .multipliedBy(maxFeePerGas)
        .multipliedBy(ethUsdPrice || "0")
        .dividedBy(1e18)
        .dividedBy(0.05)
        .decimalPlaces(0)
        .toNumber();
      return minChunkSizeUsd;
    },
    enabled: !!publicClient && !!config,
    staleTime: 60_000,
  });

  if (!address) {
    return config.minChunkSizeUsd;
  }

  if (query.isLoading) return 0;

  return query.data || config.minChunkSizeUsd;
};
