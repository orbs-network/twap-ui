import { Configs, isNativeAddress, TokenData } from "@orbs-network/twap";
import { createContext, useContext, useMemo } from "react";
import _ from "lodash";
import Web3 from "web3";
import { configureStyles } from "./styles";
import { QuickSwapRawToken, QuickSwapTWAPProps } from "./types";

export const config = Configs.QuickSwap;

export const useParseTokens = (dappTokens: any, getTokenLogoURL: (address: string) => string): TokenData[] => {
  const listLength = _.size(dappTokens);
  return useMemo(() => _.compact(_.map(dappTokens, (t) => parseToken(getTokenLogoURL, t))), [listLength]);
};

export const parseToken = (getTokenLogoURL: (address: string) => string, rawToken: QuickSwapRawToken): TokenData | undefined => {
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
    logoUrl: rawToken.tokenInfo?.logoURI || getTokenLogoURL(rawToken.address),
  };
};

const AdapterContext = createContext({} as QuickSwapTWAPProps);

export const AdapterContextProvider = AdapterContext.Provider;

export const useAdapterContext = () => useContext(AdapterContext);

export const useGlobalStyles = (isProMode?: boolean) => {
  return configureStyles(isProMode);
};
