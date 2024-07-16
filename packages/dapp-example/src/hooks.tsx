import { InjectedConnector } from "@web3-react/injected-connector";
import { zeroAddress, zero, convertDecimals, isNativeAddress, networks, erc20s, eqIgnoreCase } from "@defi.org/web3-candies";
import _ from "lodash";
import { useWeb3React } from "@web3-react/core";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dapp } from "./Components";
import { PROVIDER_NAME } from ".";
import { dapps } from "./config";
import { TokenData } from "@orbs-network/twap";
import { amountUi } from "@orbs-network/twap-ui";
import { usePersistedStore } from "./store";
import { fetchPrice } from "./utils";
import BigNumber from "bignumber.js";
import { useMediaQuery } from "@mui/material";
import { useDappContext } from "./context";
import BN from "bignumber.js";
export const injectedConnector = new InjectedConnector({});

export const useAddedTokens = () => {
  const { tokens: persistedTokens } = usePersistedStore();
  const { chainId } = useWeb3React();

  return useMemo(() => persistedTokens[chainId!] || [], [chainId, persistedTokens]);
};

export const useGetTokens = ({
  url,
  parse,
  tokens,
  modifyList,
  modifyFetchResponse,
}: {
  url?: string;
  parse?: (t: any) => any;
  baseAssets?: any;
  tokens?: any;
  modifyList?: (list: any) => any;
  modifyFetchResponse?: (res: any) => any;
}) => {
  const chainId = useSelectedDappConfig()?.chainId;
  const baseAssets = useBaseAssets();

  const { account } = useWeb3React();
  const { isInValidNetwork } = useNetwork(chainId);

  const addedTokens = useAddedTokens();
  const lib = useDappContext().lib;
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
  const isSelected = useCallback((dapp: Dapp) => selected === dapp.path, [selected]);
  const selectedDapp = useMemo(() => dapps.find((dapp) => dapp.path === selected), [selected]);
  return { isSelected, selectedDapp };
};

export const useNetwork = (chainId?: number) => {
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
  const lib = useDappContext().lib;

  const query = useQuery(["useDappExampleBalance", lib?.maker, token?.address, lib?.config.chainId], () => lib!.makerBalance(token!), {
    enabled: !!lib && !!token,
    refetchInterval: 20_000,
    staleTime: Infinity,
  });
  return query;
};

export const useBalance = (token?: TokenData) => {
  const { data = zero, isLoading } = useBalanceQuery(token);

  return { balance: amountUi(token, data), isLoading };
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

export const useGetPriceUsdCallback = () => {
  const { chainId } = useWeb3React();
  return useCallback(
    (address: string) => {
      return fetchPrice(address, chainId);
    },
    [chainId]
  );
};

export const usePriceUSD = (address?: string) => {
  const lib = useDappContext().lib;

  const wToken = lib?.config.wToken.address;
  const { chainId } = useWeb3React();
  return useQuery<number>({
    queryKey: ["usePriceUSD", address, chainId],
    queryFn: async () => {
      await delay(1_000);

      const _address = isNativeAddress(address || "") ? wToken : address;
      return fetchPrice(_address!, chainId!);
    },
    refetchInterval: 10_000,
    enabled: !!address && !!chainId,
  }).data;
};
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const handleAddress = (address?: string) => {
  if (address === "BNB") return zeroAddress;
  return address;
};

export const useTrade = (fromToken?: string, toToken?: string, srcAmount?: string, tokens?: any) => {
  const fromTokenUsd = usePriceUSD(handleAddress(fromToken));
  const toTokenUsd = usePriceUSD(handleAddress(toToken));
  const { chainId } = useWeb3React();
  const { fromTokenDecimals, toTokenDecimals } = useMemo(() => {
    return {
      fromTokenDecimals: _.find(tokens, (it) => eqIgnoreCase(it.address, fromToken || ""))?.decimals,
      toTokenDecimals: _.find(tokens, (it) => eqIgnoreCase(it.address, toToken || ""))?.decimals,
    };
  }, [fromToken, toToken, tokens]);

  const query = useQuery({
    queryKey: ["useTrade", fromToken, toToken, srcAmount, chainId],
    queryFn: async () => {
      if (!fromTokenDecimals || !toTokenDecimals) return "0";
      await delay(2_000);
      const result = convertDecimals(
        BigNumber(srcAmount!)
          .times(fromTokenUsd || "0")
          .div(toTokenUsd || "0"),
        fromTokenDecimals,
        toTokenDecimals
      ).integerValue(BigNumber.ROUND_FLOOR);

      return result.toString();
    },
    refetchInterval: 30_000,
    enabled: !!fromToken && !!toToken && !!srcAmount && !!fromTokenUsd && !!toTokenUsd,
  });

  return {
    isLoading: query.isLoading,
    outAmount: query.data,
  };
};

export const useIsMobile = () => useMediaQuery("(max-width:600px)");

export const useSelectedDappConfig = () => {
  const { chainId } = useWeb3React();
  const configs = useSelectedDapp().selectedDapp?.configs;

  return _.find(configs, { chainId });
};

export const useBaseAssets = () => {
  const { chainId } = useWeb3React();
  return useMemo(() => {
    switch (chainId) {
      case networks.arb.id:
        return erc20s.arb;
      case networks.base.id:
        return erc20s.base;
      case networks.poly.id:
        return erc20s.poly;
      case networks.bsc.id:
        return erc20s.bsc;
      case networks.blast.id:
        return erc20s.blast;
      case networks.ftm.id:
        return erc20s.ftm;
      case networks.linea.id:
        return erc20s.linea;
      default:
        break;
    }
  }, [chainId]);
};
