import { Configs, TokenData } from "@orbs-network/twap";
import { isNativeAddress } from "@defi.org/web3-candies";
import { createContext, useContext, useMemo } from "react";
import _ from "lodash";
import Web3 from "web3";
import { ChronosRawToken, ChronosTWAPProps } from "./types";

export const config = Configs.Chronos;

export const useParseTokens = (dappTokens: any, getTokenLogoURL: (address: string) => string): TokenData[] => {
  const listLength = _.size(dappTokens);
  return useMemo(() => _.compact(_.map(dappTokens, (t) => parseToken(getTokenLogoURL, t))), [listLength]);
};

export const parseToken = (getTokenLogoURL: (symbol: string) => string, rawToken: ChronosRawToken): TokenData | undefined => {
  if (!rawToken.symbol) {
    console.error("Invalid token", rawToken);
    return;
  }
  if (!rawToken.address || isNativeAddress(rawToken.address)) {
    return config.nativeToken;
  }
  return {
    address: Web3.utils.toChecksumAddress(rawToken.address),
    decimals: rawToken.decimals,
    symbol: rawToken.symbol,
    logoUrl: getTokenLogoURL(rawToken.symbol),
  };
};

const AdapterContext = createContext({} as ChronosTWAPProps);

export const AdapterContextProvider = AdapterContext.Provider;

export const useAdapterContext = () => useContext(AdapterContext);
