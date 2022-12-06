import { InjectedConnector } from "@web3-react/injected-connector";
import { erc20s, networks, zeroAddress } from "@defi.org/web3-candies";
import _ from "lodash";
import Web3 from "web3";
import { TokenData } from "@orbs-network/twap";
import { useWeb3React } from "@web3-react/core";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { useCallback, useEffect, useMemo } from "react";
import { Dapp } from "./Components";
import { PROVIDER_NAME } from ".";
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
  const { isInValidNetwork } = useNetwork(chainId);

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
    { enabled: !!account && !isInValidNetwork }
  );
};

export const useConnectWallet = () => {
  const { activate } = useWeb3React();
  return () => {
    activate(injectedConnector);
    window.localStorage.setItem(PROVIDER_NAME, "1");
  };
};

export const useDisconnectWallet = () => {
  const { deactivate } = useWeb3React();
  return () => {
    deactivate();
    window.localStorage.removeItem(PROVIDER_NAME);
  };
};

export const useSelectedDapp = () => {
  const location = useLocation();
  const selected = location.pathname.split("/")[1];
  const isSelected = useCallback((dapp: Dapp) => selected === dapp.config.partner.toLowerCase(), [selected]);
  return isSelected;
};

export const useNetwork = (chainId: number) => {
  const { chainId: connectedChainId } = useWeb3React();

  const isInValidNetwork = !!(connectedChainId && connectedChainId !== chainId);

  return { isInValidNetwork };
};

export const useChangeNetwork = () => {
  const { library } = useWeb3React();

  return async (chain: number) => {
    const web3 = new Web3(library);
    const provider = web3 ? web3.givenProvider : undefined;

    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: Web3.utils.toHex(chain) }],
      });
    } catch (error: any) {
      // if unknown chain, add chain
      if (error.code === 4902) {
        const response = await fetch("https://chainid.network/chains.json");
        const list = await response.json();
        const chainArgs = list.find((it: any) => it.chainId === chain);
        if (!chainArgs) {
          return;
        }

        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainName: chainArgs.name,
              nativeCurrency: chainArgs.nativeCurrency,
              rpcUrls: chainArgs.rpc,
              chainId: Web3.utils.toHex(chain),
              blockExplorerUrls: [_.get(chainArgs, ["explorers", 0, "url"])],
              iconUrls: [`https://defillama.com/chain-icons/rsz_${chainArgs.chain}.jpg`],
            },
          ],
        });
      }
    }
  };
};

export const useEagerlyConnect = () => {
  const connect = useConnectWallet();

  useEffect(() => {
    const wasConnected = window.localStorage.getItem(PROVIDER_NAME);
    if (wasConnected) {
      connect();
    }
  }, []);
};
