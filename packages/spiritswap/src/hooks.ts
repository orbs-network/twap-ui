import { Configs, isNativeAddress, TokenData } from "@orbs-network/twap";
import { createContext, useContext, useMemo } from "react";
import { SpiritSwapTWAPProps } from ".";
import Web3 from "web3";
import { configureStyles } from "./styles";
export const config = Configs.SpiritSwap;

export const useGetProvider = (getProvider: () => any, account?: string) => {
  return useMemo(() => getProvider(), [account]);
};

export const parseToken = (rawToken: any, getTokenImageUrl: (symbol: string) => string): TokenData | undefined => {
  if (!rawToken.address || !rawToken.symbol) {
    console.error("Invalid token", rawToken);

    return;
  }
  if (isNativeAddress(rawToken.address)) {
    return config.nativeToken;
  }

  return {
    address: Web3.utils.toChecksumAddress(rawToken.address),
    decimals: rawToken.decimals,
    symbol: rawToken.symbol,
    logoUrl: getTokenImageUrl(rawToken.symbol),
  };
};

const AdapterContext = createContext({} as SpiritSwapTWAPProps);

export const AdapterContextProvider = AdapterContext.Provider;

export const useAdapterContext = () => useContext(AdapterContext);

export const useGlobalStyles = () => {
  return configureStyles();
};
