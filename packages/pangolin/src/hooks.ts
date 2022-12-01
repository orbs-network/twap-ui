import { zeroAddress, eqIgnoreCase } from "@defi.org/web3-candies";
import { TokenData } from "@orbs-network/twap";
import { hooks } from "@orbs-network/twap-ui";
import _ from "lodash";
import { useMemo, useEffect } from "react";

export const parseToken = (rawToken: any): TokenData => {
  if (!rawToken.tokenInfo) {
    return {
      address: zeroAddress,
      decimals: 18,
      symbol: "AVAX",
      logoUrl: "https://raw.githubusercontent.com/pangolindex/sdk/master/src/images/chains/avax.png",
    };
  }
  const { tokenInfo } = rawToken;
  return {
    address: tokenInfo.address,
    decimals: tokenInfo.decimals,
    symbol: tokenInfo.symbol,
    logoUrl: tokenInfo.logoURI,
  };
};
const nativeToken: TokenData = {
  decimals: 18,
  symbol: "AVAX",
  address: zeroAddress,
  logoUrl: "https://raw.githubusercontent.com/pangolindex/sdk/master/src/images/chains/avax.png",
};

export const useParseTokenList = (dappTokens?: any): TokenData[] => {
  return useMemo(() => {
    if (!dappTokens) return [];
    const result = _.map(dappTokens, (t) => parseToken(t));

    return result;
  }, [dappTokens]);
};

export const useTokensFromDapp = (srcTokenAddress?: string, dstTokenAddress?: string, dappTokens?: any) => {
  const tokenList = useParseTokenList(dappTokens);
  const setTokens = hooks.useSetTokens();

  const findToken = (address?: string) => {
    if (!address) return;
    const token = _.find(tokenList, (t: any) => eqIgnoreCase(t.address, address));
    return !token ? undefined : token;
  };

  useEffect(() => {
    if (!tokenList?.length) return;
    const srcToken = findToken(srcTokenAddress);
    const dstToken = findToken(dstTokenAddress);
    setTokens(srcToken, dstToken);
  }, [srcTokenAddress, dstTokenAddress, tokenList]);
};
