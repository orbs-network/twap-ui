import { TokenData } from "@orbs-network/twap";
import { store } from "@orbs-network/twap-ui";
import { createContext, useContext, useEffect, useMemo } from "react";
import _ from "lodash";
import Web3 from "web3";
import { configureStyles } from "./styles";
import { QuickSwapRawToken, QuickSwapTWAPProps } from "./types";

export const parseToken = (getTokenLogoURL: (address: string) => string, rawToken: QuickSwapRawToken): TokenData => {
  return {
    address: Web3.utils.toChecksumAddress(rawToken.address),
    decimals: rawToken.decimals,
    symbol: rawToken.symbol,
    logoUrl: getTokenLogoURL(rawToken.address ?? rawToken.tokenInfo.address),
  };
};

export const useParseTokenList = (getTokenLogoURL: (address: string) => string, dappTokens?: { [key: string]: QuickSwapRawToken }): TokenData[] => {
  const dappTokensLength = !dappTokens ? 0 : _.size(dappTokens);

  return useMemo(() => {
    return _.map(dappTokens, (t) => parseToken(getTokenLogoURL, t));
  }, [dappTokensLength]);
};

const findAndParseToken = (getTokenLogoURL: (address: string) => string, address: string, tokenList?: { [key: string]: QuickSwapRawToken }) => {
  const token = tokenList ? tokenList[address as any] : undefined;
  return !token ? undefined : parseToken(getTokenLogoURL, token);
};

export const useSetTokensFromDapp = (
  getTokenLogoURL: (address: string) => string,
  srcTokenAddress?: string,
  dstTokenAddress?: string,
  dappTokens?: { [key: string]: QuickSwapRawToken }
) => {
  const setSrcToken = store.useTwapStore((state) => state.setSrcToken);
  const setDstToken = store.useTwapStore((state) => state.setDstToken);
  const tokensReady = !!dappTokens && _.size(dappTokens) > 0;
  const wrongNetwork = store.useTwapStore((store) => store.wrongNetwork);

  useEffect(() => {
    if (!tokensReady || wrongNetwork || wrongNetwork == null) return;

    if (srcTokenAddress) {
      const srcToken = findAndParseToken(getTokenLogoURL, srcTokenAddress, dappTokens);
      setSrcToken(srcToken);
    }
    if (dstTokenAddress) {
      const dstToken = findAndParseToken(getTokenLogoURL, dstTokenAddress, dappTokens);
      setDstToken(dstToken);
    }
  }, [srcTokenAddress, dstTokenAddress, tokensReady, wrongNetwork]);
};

const AdapterContext = createContext({} as QuickSwapTWAPProps);

export const AdapterContextProvider = AdapterContext.Provider;

export const useAdapterContext = () => useContext(AdapterContext);

export const useGlobalStyles = () => {
  return configureStyles();
};
