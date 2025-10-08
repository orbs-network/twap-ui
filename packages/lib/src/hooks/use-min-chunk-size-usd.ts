import { networks } from "@orbs-network/twap-sdk";
import { useQuery } from "@tanstack/react-query";
import { TX_GAS_COST } from "../consts";
import { useTwapContext } from "../context/twap-context";
import BN from "bignumber.js";

const abi = [{ inputs: [], name: "latestAnswer", outputs: [{ internalType: "int256", name: "", type: "int256" }], stateMutability: "view", type: "function" }];

const addressMap = {
  [networks.eth.id]: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
};

export const useMinChunkSizeUsd = () => {
  const { publicClient, overrides, chainId, config } = useTwapContext();
  const customMinChunkSizeUsd = overrides?.minChunkSizeUsd;
  const address = chainId ? (addressMap[chainId] as `0x${string}`) : undefined;
  const query = useQuery({
    queryKey: ["useMinChunkSizeUsd", chainId],
    queryFn: async () => {
      if (!address) return null;
      const latestAnswer = await publicClient!.readContract({
        address,
        abi,
        functionName: "latestAnswer",
      });

      const ethUsdPrice = BN(latestAnswer as string)
        .div(1e8)
        .toNumber();
      const result = await publicClient!.estimateFeesPerGas();
      const maxFeePerGas = result.maxFeePerGas;
      const minChunkSizeUsd = BN(TX_GAS_COST)
        .multipliedBy(maxFeePerGas.toString())
        .multipliedBy(ethUsdPrice || "0")
        .dividedBy(1e18)
        .dividedBy(0.05)
        .decimalPlaces(0)
        .toNumber();
      return minChunkSizeUsd;
    },
    enabled: !!publicClient && !!config?.twapConfig,
    staleTime: 60_000,
  });

  if (customMinChunkSizeUsd) {
    return customMinChunkSizeUsd;
  }

  if (!address) {
    return config?.twapConfig?.minChunkSizeUsd;
  }

  if (query.isLoading) return 0;

  return query.data || config?.twapConfig?.minChunkSizeUsd || 0;
};
