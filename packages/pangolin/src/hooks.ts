import { zeroAddress, eqIgnoreCase } from "@defi.org/web3-candies";
import { TokenData } from "@orbs-network/twap";
import { store } from "@orbs-network/twap-ui";
import _ from "lodash";
import { useMemo, useEffect, useRef } from "react";
import Web3 from "web3";
import { configureStyles } from "./styles";

const nativeToken: TokenData = {
  decimals: 18,
  symbol: "AVAX",
  address: zeroAddress,
  logoUrl: "https://raw.githubusercontent.com/pangolindex/sdk/master/src/images/chains/avax.png",
};

export const parseToken = (rawToken: any): TokenData => {
  if (!rawToken.tokenInfo) {
    return {
      address: Web3.utils.toChecksumAddress(zeroAddress),
      decimals: 18,
      symbol: "AVAX",
      logoUrl: "https://raw.githubusercontent.com/pangolindex/sdk/master/src/images/chains/avax.png",
    };
  }
  const { tokenInfo } = rawToken;
  return {
    address: Web3.utils.toChecksumAddress(tokenInfo.address),
    decimals: tokenInfo.decimals,
    symbol: tokenInfo.symbol,
    logoUrl: tokenInfo.logoURI,
  };
};

export const useParseTokenList = (dappTokens?: any): TokenData[] => {
  return useMemo(() => {
    if (!dappTokens) return [];
    const result = _.map(dappTokens, (t) => parseToken(t));

    return [nativeToken, ...result];
  }, [dappTokens]);
};

const findToken = (tokenList?: TokenData[], address?: string) => {
  if (!address || !tokenList || !tokenList.length) return;
  const token = _.find(tokenList, (t: any) => eqIgnoreCase(t.address, address));
  return !token ? undefined : token;
};

export const useTokensFromDapp = (srcTokenAddress?: string, dstTokenAddress?: string, tokenList?: TokenData[]) => {
  const setTokens = store.useTwapStore((state) => state.setTokens);
  const tokenListRef = useRef<TokenData[] | undefined>(undefined);
  tokenListRef.current = tokenList;
  const tokensLength = tokenList?.length || 0;

  useEffect(() => {
    if (!tokensLength) return;

    const srcToken = findToken(tokenListRef.current, srcTokenAddress);
    const dstToken = findToken(tokenListRef.current, dstTokenAddress);

    setTokens(srcToken, dstToken);
  }, [srcTokenAddress, dstTokenAddress, tokensLength]);
};

export const useGlobalStyles = (theme: any) => {
  return configureStyles(theme);
};
