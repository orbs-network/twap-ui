import { InjectedConnector } from "@web3-react/injected-connector";
import { zeroAddress, zero } from "@defi.org/web3-candies";
import _ from "lodash";
import { useWeb3React } from "@web3-react/core";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Dapp } from "./Components";
import { PROVIDER_NAME } from ".";
import { dapps } from "./config";
import { TokenData } from "@orbs-network/twap";
import { store } from "@orbs-network/twap-ui";
import { usePersistedStore } from "./store";

export const injectedConnector = new InjectedConnector({});

export const useAddedTokens = () => {
  const { tokens: persistedTokens } = usePersistedStore();
  const { chainId } = useWeb3React();

  return useMemo(() => persistedTokens[chainId!] || [], [chainId, persistedTokens]);
};

export const useGetTokens = ({
  chainId,
  url,
  parse,
  baseAssets,
  tokens,
  modifyList,
  modifyFetchResponse,
}: {
  chainId: number;
  url?: string;
  parse?: (t: any) => any;
  baseAssets?: any;
  tokens?: any;
  modifyList?: (list: any) => any;
  modifyFetchResponse?: (res: any) => any;
}) => {
  const { account } = useWeb3React();
  const { isInValidNetwork } = useNetwork(chainId);
  const addedTokens = useAddedTokens();
  const lib = store.useTwapStore((s) => s.lib);
  return useQuery(
    ["useGetTokens", chainId, _.size(addedTokens)],
    async () => {
      let tokenList;
      if (url) {
        const response = await fetch(url);
        const _tokenList = await response.json();

        tokenList = modifyFetchResponse ? modifyFetchResponse(_tokenList) : _tokenList;
      } else if (tokens) {
        tokenList = tokens;
      }

      const candiesAddresses = [zeroAddress, ..._.map(baseAssets, (t) => t().address)];
      const parsed = parse ? parse(tokenList) : tokenList;
      let _tokens = _.sortBy(parsed, (t: any) => {
        const index = candiesAddresses.indexOf(t.address);
        return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
      });

      _tokens = [...addedTokens, ..._tokens];

      return modifyList ? modifyList(_tokens) : _tokens;
    },
    { enabled: !!account && !isInValidNetwork && !!lib, staleTime: Infinity }
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
  const isSelected = useCallback((dapp: Dapp) => selected === dapp.config.name.toLowerCase(), [selected]);
  const selectedDapp = useMemo(() => dapps.find((dapp) => dapp.config.name.toLowerCase() === selected), [selected]);
  return { isSelected, selectedDapp };
};

export const useNetwork = (chainId: number) => {
  const { chainId: connectedChainId } = useWeb3React();

  const isInValidNetwork = !!(connectedChainId && connectedChainId !== chainId);

  return { isInValidNetwork };
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

export const useTheme = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentTheme = searchParams.get("theme") || "dark";

  const setTheme = (value: "dark" | "light") => {
    setSearchParams({ theme: value });
  };

  return {
    isDarkTheme: currentTheme === "dark",
    setTheme,
  };
};

export const useBalanceQuery = (token?: TokenData) => {
  const lib = store.useTwapStore().lib;

  const query = useQuery(["useDappExampleBalance", lib?.maker, token?.address, lib?.config.chainId], () => lib!.makerBalance(token!), {
    enabled: !!lib && !!token,
    refetchInterval: 20_000,
    staleTime: Infinity,
  });
  return query;
};

export const useBalance = (token?: TokenData) => {
  const { data = zero, isLoading } = useBalanceQuery(token);

  return { balance: store.amountUi(token, data), isLoading };
};

export function useDebounce(value: string, delay: number) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );
  return debouncedValue;
}
