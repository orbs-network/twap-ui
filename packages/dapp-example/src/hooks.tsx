import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Token } from "@orbs-network/twap-ui";
import { useMediaQuery } from "@mui/material";
import BN from "bignumber.js";
import { amountBN, amountUi, eqIgnoreCase, erc20abi, getNetwork, isNativeAddress, zeroAddress } from "@orbs-network/twap-sdk";
import _ from "lodash";
import { useAccount, usePublicClient, useReadContracts } from "wagmi";
import { api } from "./api";
import { erc20Abi } from "viem";

type Balance = {
  ui: string;
  wei: string;
};

const useGetTokens = () => {
  const chainId = useAccount()?.chainId;
  const { address: account } = useAccount();

  return useQuery<Token[]>(
    ["useGetTokens", chainId],
    async ({ signal }) => {
      return api.getTokens(chainId!, signal);
    },
    { enabled: !!account, staleTime: Infinity }
  );
};

export const useTokenListBalances = () => {
  const { data: tokens } = useGetTokens();
  const client = usePublicClient();
  const account = useAccount().address;

  return useQuery({
    queryKey: ["useTokenListBalances", tokens?.length],
    queryFn: async () => {
      const addresses: string[] = tokens!.map((it) => it.address).filter((it) => !isNativeAddress(it));
      const nativeToken = tokens!.find((it) => isNativeAddress(it.address));
      const nativeBalanceReponse = await client?.getBalance({ address: account! });
      const nativeBalance = nativeBalanceReponse?.toString() || "0";
      const multicallResponse = await client?.multicall({
        contracts: addresses.map((address) => {
          return {
            abi: erc20abi as any,
            address: address as `0x${string}`,
            functionName: "balanceOf",
            args: [account as `0x${string}`],
          };
        }),
      });
      const balances = addresses.reduce((acc, address, index) => {
        const balance = multicallResponse?.[index]?.result?.toString();
        const token = tokens!.find((it) => eqIgnoreCase(it.address, address));
        return {
          ...acc,
          [address]: { ui: amountUi(token?.decimals, balance), wei: balance },
        };
      }, {}) as { [key: string]: Balance };

      balances[zeroAddress] = { ui: amountUi(nativeToken?.decimals, nativeBalance), wei: nativeBalance };

      return balances;
    },
    enabled: (tokens?.length || 0) > 0 && !!client && !!account,
    staleTime: Infinity,
  });
};

export const useRefetchBalances = () => {
  const { refetch } = useTokenListBalances();
  return useCallback(async () => {
    await refetch();
  }, [refetch]);
};

export const useTokenBalance = (token?: Token) => {
  const client = usePublicClient();
  const { address: account } = useAccount();
  const { data: balances, isLoading: balancesListLoading } = useTokenListBalances();
  const addressNotInList = Boolean(balances && token && !Object.keys(balances).some((it) => eqIgnoreCase(it, token.address)));

  const { data: balance, isLoading } = useQuery<Balance>({
    queryKey: ["useTokenBalance", token?.address],
    queryFn: async () => {
      const balance = await client?.readContract({
        address: token?.address as `0x${string}`,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [account as `0x${string}`],
      });

      return {
        ui: amountUi(token?.decimals, balance?.toString()),
        wei: balance?.toString() || "0",
      };
    },
    enabled: addressNotInList,
    staleTime: Infinity,
  });

  return {
    data: !token ? undefined : addressNotInList ? balance : balances?.[token.address],
    isLoading: addressNotInList ? isLoading : balancesListLoading,
  };
};

export const useTokenUsd = (address?: string) => {
  const { data } = useTokensWithBalancesUSD();

  return useMemo(() => {
    if (!address) return 0;
    return data?.[address.toLowerCase()] || 0;
  }, [data, address]);
};

export const useTokensWithBalancesUSD = () => {
  const { data: balances } = useTokenListBalances();
  const { chainId } = useAccount();
  const key = useMemo(() => Object.keys(balances || {}).join(","), [balances]);

  return useQuery({
    queryKey: ["useTokensWithBalancesUSD", key],
    queryFn: async () => {
      const balancesWithValues = Object.entries(balances!)
        .filter(([, it]) => it.ui !== "0")
        .map((it) => it[0]);

      const usdValues = await Promise.all(
        balancesWithValues.map(async (address) => {
          const result = await fetchLLMAPrice(address, chainId!);
          const balance = balances![address].ui;
          return {
            [address]: BN(result.priceUsd).multipliedBy(balance).toNumber(),
          };
        })
      );

      return usdValues.reduce((acc, it) => {
        return { ...acc, ...it };
      }, {}) as { [key: string]: number };
    },
    enabled: !!balances,
    staleTime: Infinity,
  });
};

export const useTokenList = () => {
  const tokens = useGetTokens().data;
  const { data: usdValues } = useTokensWithBalancesUSD();

  return useMemo((): Token[] => {
    if (!tokens || !usdValues) return [];
    const sorted = _.sortBy(tokens, (it) => {
      const usd = usdValues?.[it.address.toLowerCase()] || 0;
      return -usd;
    });
    const nativeTokenIndex = sorted.findIndex((it) => isNativeAddress(it.address));
    const nativeToken = sorted.splice(nativeTokenIndex, 1)[0];

    return nativeTokenIndex ? [nativeToken, ...sorted] : sorted;
  }, [tokens, usdValues]);
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

export const usePriceUSD = (address?: string) => {
  const { chainId } = useAccount();
  const wToken = getNetwork(chainId)?.wToken.address;

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
      token = getNetwork(parseInt(chainId as any))!.wToken.address;
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

const useHandleNativeToken = (token?: Token) => {
  const { chainId } = useAccount();
  return useMemo(() => {
    const network = getNetwork(chainId);

    if (isNativeAddress(token?.address || "")) {
      return network?.wToken;
    }
    return token;
  }, [token, chainId]);
};

export const useMarketPrice = (_fromToken?: Token, _toToken?: Token) => {
  const fromToken = useHandleNativeToken(_fromToken);
  const toToken = useHandleNativeToken(_toToken);
  const fromTokenUsd = usePriceUSD(fromToken?.address);
  const toTokenUsd = usePriceUSD(toToken?.address);

  const marketPrice = useMemo(() => {
    if (!fromTokenUsd || !toTokenUsd) return;
    return amountBN(toToken?.decimals, (fromTokenUsd / toTokenUsd).toString());
  }, [fromTokenUsd, toTokenUsd, toToken]);

  return {
    isLoading: fromTokenUsd === undefined || toTokenUsd === undefined,
    outAmount: marketPrice,
  };
};

export const useIsMobile = () => useMediaQuery("(max-width:600px)");

export const ten = BN(10);

export function convertDecimals(n: BN.Value, sourceDecimals: number, targetDecimals: number): BN {
  if (sourceDecimals === targetDecimals) return BN(n);
  else if (sourceDecimals > targetDecimals) return BN(n).idiv(ten.pow(sourceDecimals - targetDecimals));
  else return BN(n).times(ten.pow(targetDecimals - sourceDecimals));
}

export const useToken = (address?: string) => {
  const { data, isLoading } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: address as `0x${string}`,
        abi: erc20Abi,
        functionName: "decimals",
      },
      {
        address: address as `0x${string}`,
        abi: erc20Abi,
        functionName: "name",
      },
      {
        address: address as `0x${string}`,
        abi: erc20Abi,
        functionName: "symbol",
      },
      {
        address: address as `0x${string}`,
        abi: erc20Abi,
        functionName: "totalSupply",
      },
    ],
  });

  const token = useMemo((): Token | undefined => {
    if (!data) return undefined;
    return {
      symbol: data[2].toString(),
      address: address!,
      decimals: data[0],
      logoUrl: "",
    };
  }, [data]);

  return {
    token,
    isLoading,
  };
};
