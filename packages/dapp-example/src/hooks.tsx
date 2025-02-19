import { InjectedConnector } from "@web3-react/injected-connector";
import { zeroAddress, convertDecimals, isNativeAddress, networks, erc20s, eqIgnoreCase, network, erc20abi } from "@defi.org/web3-candies";
import { useWeb3React } from "@web3-react/core";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Dapp } from "./Components";
import { PROVIDER_NAME } from ".";
import { dapps } from "./config";
import { Configs, Token } from "@orbs-network/twap-ui";
import BigNumber from "bignumber.js";
import { useMediaQuery } from "@mui/material";
import { useDappContext } from "./context";
import BN from "bignumber.js";
import { getNetwork } from "@orbs-network/twap-sdk";
import { size, sortBy } from "lodash";
export const injectedConnector = new InjectedConnector({});

export const useAddedTokens = () => {
  // const { tokens: persistedTokens } = usePersistedStore();
  // const { chainId } = useWeb3React();

  // return useMemo(() => persistedTokens[chainId!] || [], [chainId, persistedTokens]);
  return [];
};

const getLineaTokens = async (signal?: AbortSignal): Promise<Token[]> => {
  const tokens = await fetch(`https://prod-api.lynex.fi/tracking/assets`, { signal }).then((res) => res.json());

  const result = Object.values(tokens).map((token: any) => {
    return {
      address: token.address,
      symbol: token.symbol,
      decimals: token.decimals,
      logoUrl: token.logoURI,
    };
  });
  return [networks.eth.native, ...result];
};

const getZircuitTokens = async (signal?: AbortSignal): Promise<Token[]> => {
  const tokens = await fetch(`https://api.ocelex.fi/tracking/assets`, { signal }).then((res) => res.json());
  const result = Object.values(tokens).map((token: any) => {
    return {
      address: token.address,
      symbol: token.symbol,
      decimals: token.decimals,
      logoUrl: token.logoURI,
    };
  });

  return [networks.eth.native, ...result];
};

const getDefaultTokens = async (chainId: number, signal?: AbortSignal): Promise<Token[]> => {
  const tokens = await fetch("https://token-list.sushi.com/", { signal }).then((res) => res.json().then((it) => it.tokens.filter((it: any) => it.chainId === chainId)));

  const result = Object.values(tokens).map((token: any) => {
    return {
      address: token.address,
      symbol: token.symbol,
      decimals: token.decimals,
      logoUrl: token.logoURI,
    };
  });

  const native = getNetwork(chainId)?.native as Token;

  return [native, ...result];
};

const getTokens = async (chainId: number, signal?: AbortSignal): Promise<Token[]> => {
  switch (chainId) {
    case networks.linea.id:
      return getLineaTokens(signal);
    case Configs.Ocelex.chainId:
      return getZircuitTokens(signal);

    default:
      return getDefaultTokens(chainId, signal);
  }
};

export const useGetTokens = (getCustomTokens?: () => Promise<Token[]>) => {
  const chainId = useSelectedDappConfig()?.chainId;
  const baseAssets = useBaseAssets();
  const { account } = useWeb3React();
  const addedTokens = useAddedTokens();

  return useQuery<Token[]>(
    ["useGetTokens", chainId, size(addedTokens)],
    async ({ signal }) => {
      let tokenList: Token[];
      if (getCustomTokens) {
        tokenList = await getCustomTokens();
      } else {
        tokenList = await getTokens(chainId!, signal);
      }

      const base = baseAssets && Object.values(baseAssets).map((t: any) => t().address);

      const candiesAddresses = base ? [zeroAddress, ...base] : [zeroAddress];
      let _tokens: any = [];
      try {
        _tokens = sortBy(tokenList, (t: any) => {
          const index = candiesAddresses.indexOf(t.address);
          return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
        });
      } catch (error) {
        console.log(error);
      }

      return [...addedTokens, ..._tokens];
    },
    { enabled: !!account, staleTime: Infinity },
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

export const useIsValidChain = (chainId?: number) => {
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

export const useBalanceQuery = (address?: string) => {
  const config = useDappContext().config;
  const { account, library } = useWeb3React();

  return useQuery(
    ["useDappExampleBalance", account, address, config.chainId],
    () => {
      if (isNativeAddress(address!)) return library!.eth.getBalance(account!).then(BN);
      const contract = new library!.eth.Contract(erc20abi, address);
      return contract.methods.balanceOf(account!).call().then(BN);
    },
    {
      enabled: !!library && !!account && !!address,
      refetchInterval: 20_000,
      staleTime: Infinity,
    },
  );
};

export const useRefetchBalances = (srcAddress?: string, dstAddress?: string) => {
  const { refetch: refetchSrc } = useBalanceQuery(srcAddress);
  const { refetch: refetchDst } = useBalanceQuery(dstAddress);

  return useCallback(async () => {
    await Promise.all([refetchSrc(), refetchDst()]);
  }, [refetchSrc, refetchDst]);
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
    [value, delay], // Only re-call effect if value or delay changes
  );
  return debouncedValue;
}

export const usePriceUSD = (address?: string) => {
  const { config } = useDappContext();
  const wToken = network(config.chainId)?.wToken.address;

  const { chainId } = useWeb3React();
  return useQuery<number>({
    queryKey: ["usePriceUSD", address, chainId],
    queryFn: async () => {
      await delay(1_000);

      const _address = isNativeAddress(address || "") ? wToken : address;
      return (await fetchLLMAPrice(_address!, chainId!)).priceUsd;
    },
    refetchInterval: 10_000,
    enabled: !!address && !!chainId,
  }).data;
};

const chainIdToName: { [key: number]: string } = {
  56: "bsc",
  137: "polygon",
  8453: "base", // Assuming this ID is another identifier for Polygon as per the user's mapping
  250: "fantom",
  1: "ethereum",
  1101: "zkevm",
  81457: "blast",
  59144: "linea",
  42161: "arbitrum",
  1329: "sei",
  48900: "zircuit",
};

export async function fetchLLMAPrice(token: string, chainId: number | string) {
  const nullPrice = {
    priceUsd: 0,
    priceNative: 0,
    timestamp: Date.now(),
  };
  try {
    const chainName = chainIdToName[chainId as any] || "Unknown Chain";

    if (isNativeAddress(token)) {
      token = network(parseInt(chainId as any)).wToken.address;
    }
    const tokenAddressWithChainId = `${chainName}:${token}`;
    const url = `https://coins.llama.fi/prices/current/${tokenAddressWithChainId}`;
    const response = await fetch(url);
    if (!response.ok) {
      return nullPrice;
    }
    const data = await response.json();
    const coin = data.coins[tokenAddressWithChainId];
    return {
      priceUsd: coin.price,
      priceNative: coin.price,
      timestamp: Date.now(),
    };
  } catch (error) {
    return nullPrice;
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const useHandleAddress = (address?: string) => {
  const { chainId } = useWeb3React();
  return useMemo(() => {
    const network = getNetwork(chainId);

    if (isNativeAddress(address || "")) {
      return network?.wToken.address;
    }
    return address;
  }, [address, network]);
};

export const useTrade = (fromToken?: string, toToken?: string, srcAmount?: string, tokens?: any) => {
  const srcAddress = useHandleAddress(fromToken);
  const dstAddress = useHandleAddress(toToken);

  const fromTokenUsd = usePriceUSD(srcAddress);
  const toTokenUsd = usePriceUSD(dstAddress);

  const { chainId } = useWeb3React();

  const { fromTokenDecimals, toTokenDecimals } = useMemo(() => {
    return {
      fromTokenDecimals: tokens?.find((it: any) => eqIgnoreCase(it.address || "", fromToken || ""))?.decimals,
      toTokenDecimals: tokens?.find((it: any) => eqIgnoreCase(it.address || "", toToken || ""))?.decimals,
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
        toTokenDecimals,
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

  return configs?.find((it) => it.chainId === chainId);
};

export const useBaseAssets = () => {
  const { chainId } = useWeb3React();
  return useMemo(() => {
    switch (chainId) {
      case networks.eth.id:
        return erc20s.eth;
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
