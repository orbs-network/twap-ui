import Twap from "./Twap";
import Orders from "./Orders";
import { AdapterProps, TwapAdapter } from "@orbs-network/twap-ui";
import { useMemo } from "react";
import translations from "./i18n/en.json";
import { Configs, TokenData } from "@orbs-network/twap";
import _ from "lodash";

export const parseToken = (rawToken: any): TokenData => {
  const { tokenInfo } = rawToken;
  return {
    address: tokenInfo.address,
    decimals: tokenInfo.decimals,
    symbol: tokenInfo.symbol,
    logoUrl: tokenInfo.logoURI,
  };
};

const useTokenList = (tokenList?: any): TokenData[] => {
  return useMemo(() => {
    if (!tokenList) return [];
    return _.map(tokenList, (t) => {
      return parseToken(t);
    });
  }, [tokenList]);
};

export const PangolinAdapter = (props: AdapterProps) => {
  const { children, twapProps } = props;
  const tokensList = useTokenList(twapProps.tokensList);

  return (
    <TwapAdapter twapProps={{ ...twapProps, tokensList }} config={Configs.Pangolin} translations={translations}>
      {children}
    </TwapAdapter>
  );
};

export { Twap, Orders };
