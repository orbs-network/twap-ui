import { Configs, isNativeAddress, TokenData } from "@orbs-network/twap";
import { createContext, useContext, useMemo } from "react";
import _ from "lodash";
import Web3 from "web3";
import { ThenaRawToken, ThenaTWAPProps } from "./types";

export const config = Configs.QuickSwap;

export const useParseTokens = (dappTokens: ThenaRawToken[]): TokenData[] => {
  const listLength = _.size(dappTokens);
  return useMemo(() => _.compact(_.map(dappTokens, parseToken)), [listLength]);
};

export const parseToken = (rawToken: ThenaRawToken): TokenData | undefined => {
  const { address, decimals, symbol, logoURI } = rawToken;
  if (!symbol) {
    console.error("Invalid token", rawToken);
    return;
  }
  if (!address || isNativeAddress(address) || address === "BNB") {
    return config.nativeToken;
  }
  return {
    address: Web3.utils.toChecksumAddress(address),
    decimals,
    symbol,
    logoUrl: logoURI,
  };
};

const AdapterContext = createContext({} as ThenaTWAPProps);

export const AdapterContextProvider = AdapterContext.Provider;

export const useAdapterContext = () => useContext(AdapterContext);
