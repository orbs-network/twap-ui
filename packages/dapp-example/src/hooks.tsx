import { InjectedConnector } from "@web3-react/injected-connector";
import { erc20s, networks, zeroAddress } from "@defi.org/web3-candies";
import _ from "lodash";

import { TokenData } from "@orbs-network/twap";
import { useWeb3React } from "@web3-react/core";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { useCallback } from "react";
import { Dapp } from "./Components";
export const injectedConnector = new InjectedConnector({});

const tokenlistsNetworkNames = {
  [networks.eth.id]: "ethereum",
  [networks.ftm.id]: "ftm",
  [networks.poly.id]: "polygon",
  [networks.avax.id]: "avax",
  [networks.bsc.id]: "bsc",
  [networks.arb.id]: "arbitrum",
  [networks.oeth.id]: "optimism",
};

export const useGetTokens = (chainId: number, parseToken: (token: any) => TokenData) => {
  const { account } = useWeb3React();

  return useQuery(
    ["useGetTokens", chainId],
    async () => {
      const name = tokenlistsNetworkNames[chainId!];
      if (!name) return;
      const response = await fetch(`https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/${name}.json`);
      const tokenList = await response.json();
      const parsed = tokenList.map((t: any) => parseToken(t));
      const networkShortName = _.find(networks, (n) => n.id === chainId)!.shortname;
      const topTokens = [
        zeroAddress,
        ..._.chain(erc20s)
          .find((it: any, k) => k === networkShortName)
          .map((t: any) => t().address)
          .value(),
      ];

      const _tokens = _.sortBy(parsed, (t: any) => {
        const index = topTokens.indexOf(t.address);
        return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
      });
      return _tokens;
    },
    { enabled: !!account }
  );
};

export const useConnectWallet = () => {
  const { activate } = useWeb3React();
  return () => activate(injectedConnector);
};

export const useSelectedDapp = () => {
  const location = useLocation();
  const selected = location.pathname.split("/")[1];
  const isSelected = useCallback((dapp: Dapp) => selected === dapp.path, [selected]);
  return isSelected;
};
