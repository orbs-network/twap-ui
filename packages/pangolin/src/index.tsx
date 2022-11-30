import Twap from "./Twap";
import Orders from "./Orders";
import { AdapterProps, hooks, TwapAdapter, TWAPProps } from "@orbs-network/twap-ui";
import { useMemo } from "react";
import translations from "./i18n/en.json";
import { Configs, TokenData } from "@orbs-network/twap";
import _ from "lodash";
import { eqIgnoreCase, zeroAddress } from "@defi.org/web3-candies";

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

const useParseTokenList = (tokenList?: any): TokenData[] => {
  return useMemo(() => {
    if (!tokenList) return [];
    return _.map(tokenList, (t) => parseToken(t));
  }, [tokenList]);
};

const useTokensFromDapp = (srcTokenAddress?: string, dstTokenAddress?: string, tokenList?: TokenData[]) => {
  const findToken = (address?: string) => {
    if (!address) return;
    const token = _.find(tokenList, (t: any) => eqIgnoreCase(t.address, address));

    return !token ? undefined : parseToken(token);
  };
  return useMemo(() => {
    if (!tokenList?.length) return { srcToken: undefined, dstToken: undefined };

    return {
      srcToken: findToken(srcTokenAddress),
      dstToken: findToken(dstTokenAddress),
    };
  }, [srcTokenAddress, dstTokenAddress, tokenList]);
};

export const PangolinAdapter = (props: AdapterProps) => {
  const { children, twapProps } = props;
  const tokenList = useParseTokenList(twapProps.dappTokens);
  const { srcToken, dstToken } = useTokensFromDapp(twapProps.srcToken, twapProps.dstToken, tokenList);
  hooks.useTokens(srcToken, dstToken);

  return (
    <TwapAdapter twapProps={{ ...twapProps, tokenList }} config={Configs.Pangolin} translations={translations}>
      {children}
    </TwapAdapter>
  );
};

export { Twap, Orders };
