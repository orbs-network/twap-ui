import { Abi, network, isNativeAddress } from "@defi.org/web3-candies";
import { TwapAbi } from "@orbs-network/twap-sdk";
import { useMemo } from "react";
import { useWidgetContext } from "..";

export const useContract = (abi?: Abi, address?: string) => {
  const { config } = useWidgetContext();
  const web3 = useWidgetContext().web3;

  const wTokenAddress = network(config.chainId)?.wToken.address;
  return useMemo(() => {
    if (!web3 || !address || !config || !abi) return;
    if (isNativeAddress(address)) {
      return new web3.eth.Contract(abi || [], wTokenAddress);
    }
    return new web3.eth.Contract(abi || [], address);
  }, [abi, address, config, web3, wTokenAddress]);
};

export const useTwapContract = () => {
  const { config } = useWidgetContext();
  return useContract(TwapAbi as Abi, config.twapAddress);
};
