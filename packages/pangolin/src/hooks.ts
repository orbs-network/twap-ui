import { zeroAddress } from "@defi.org/web3-candies";
import { TokenData } from "@orbs-network/twap";
import { store } from "@orbs-network/twap-ui";
import _ from "lodash";
import { useMemo, useEffect } from "react";
import Web3 from "web3";
import { configureStyles } from "./styles";
import { isNativeAddress, Configs } from "@orbs-network/twap";

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
  const dappTokensLength = !dappTokens ? 0 : _.size(dappTokens);

  return useMemo(() => {
    if (dappTokensLength === 0) return [];
    const result = _.map(dappTokens, (t) => parseToken(t));

    return [nativeToken, ...result];
  }, [dappTokensLength]);
};

const findToken = (address: string, tokenList: any) => {
  const token = tokenList[address];
  return !token ? undefined : parseToken(token);
};

export const useTokensFromDapp = (srcTokenAddress?: string, dstTokenAddress?: string, dappTokens?: any) => {
  const setSrcToken = store.useTwapStore((state) => state.setSrcToken);
  const setDstToken = store.useTwapStore((state) => state.setDstToken);
  const tokensReady = !!dappTokens && _.size(dappTokens) > 0;
  const wrongNetwork = store.useTwapStore((store) => store.wrongNetwork);

  useEffect(() => {
    if (!tokensReady || wrongNetwork || wrongNetwork == null) return;

    if (srcTokenAddress) {
      const srcToken = findToken(srcTokenAddress, dappTokens);

      setSrcToken(srcToken);
    }
    if (dstTokenAddress) {
      const dstToken = findToken(dstTokenAddress, dappTokens);
      setDstToken(dstToken);
    }
  }, [srcTokenAddress, dstTokenAddress, tokensReady, wrongNetwork]);
};

export const useGlobalStyles = (theme: any) => {
  return configureStyles(theme);
};

export const handlePartnerDaas = (partnerDaas?: string) => {
  const _partnerDaas = partnerDaas && !isNativeAddress(partnerDaas) ? partnerDaas : undefined;
  const config = _partnerDaas ? Configs.PangolinDaas : Configs.Pangolin;

  return {
    partnerDaas: _partnerDaas,
    config,
  };
};
