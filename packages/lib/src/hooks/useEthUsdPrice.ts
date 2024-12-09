import { useQuery } from "@tanstack/react-query";
import { TX_GAS_COST, useGasPrice, useGasPriceCallback, useTwapContext } from "..";
import BN from "bignumber.js";
import { analytics } from "../analytics";

const abi = [{ inputs: [], name: "latestAnswer", outputs: [{ internalType: "int256", name: "", type: "int256" }], stateMutability: "view", type: "function" }];

const address = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";

export const useEthMinChunkSizeUsd = () => {
  const { mutateAsync } = useGasPriceCallback();
  const { config, web3 } = useTwapContext();

  return useQuery(
    ["useEthMinChunkSizeUsd", config.chainId],
    async () => {
      const contract = new web3!.eth.Contract(abi as any, address);
      const result = await contract.methods.latestAnswer().call();
      const ethUsdPrice = BN(result).div(1e8).toNumber();
      const maxFeePerGas = (await mutateAsync()).maxFeePerGas;
      const minChunkSizeUsd = BN(TX_GAS_COST)
        .multipliedBy(maxFeePerGas)
        .multipliedBy(ethUsdPrice || "0")
        .dividedBy(1e18)
        .dividedBy(0.05)
        .decimalPlaces(0)
        .toNumber();
      analytics.onEthMinChunkSizeUsd(minChunkSizeUsd);
      return minChunkSizeUsd;
    },
    {
      enabled: config.chainId === 1 && !!web3,
      staleTime: Infinity,
    },
  );
};
