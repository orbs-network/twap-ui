import { Abi, isNativeAddress, erc20abi, iwethabi } from "@defi.org/web3-candies";
import { TwapAbi } from "@orbs-network/twap-sdk";
import { useMemo } from "react";
import { useWidgetContext } from "..";
import { useNetwork } from "./useNetwork";

export const useContract = (abi?: Abi, address?: string) => {
  const { config } = useWidgetContext();
  const web3 = useWidgetContext().web3;
  const wTokenAddress = useNetwork()?.wToken.address;

  return useMemo(() => {
    const _address = isNativeAddress(address || "") ? wTokenAddress : address;

    if (!web3 || !_address || !config || !abi) return;
    return new web3.eth.Contract(abi || [], _address);
  }, [web3, address, wTokenAddress, config, abi]);
};

export const useERC20Contract = (address?: string) => {
  return useContract(erc20abi, address);
};

export const useIWETHContract = () => {
  const wTokenAddress = useNetwork()?.wToken.address;

  return useContract(iwethabi, wTokenAddress);
};

export const useTwapContract = () => {
  const { config } = useWidgetContext();
  return useContract(TwapAbi as Abi, config.twapAddress);
};
