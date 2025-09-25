import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTwapContext } from "../context";
import { ensureWrappedTokenAddress } from "../utils";
import { erc20Abi } from "viem";
import { useCallback, useMemo } from "react";

const useAllowanceCallback = () => {
  const { account, publicClient, chainId, spotConfig } = useTwapContext();

  return useMutation({
    mutationFn: async (tokenAddress: string) => {
      if (!publicClient || !chainId || !account || !spotConfig) throw new Error("missing required parameters");

      const allowance = await publicClient
        .readContract({
          address: ensureWrappedTokenAddress(tokenAddress, chainId) as `0x${string}`,
          abi: erc20Abi,
          functionName: "allowance",
          args: [account as `0x${string}`, spotConfig.repermit],
        })
        .then((res) => res.toString());

      return allowance;
    },
  });
};

const useQueryKey = () => {
  const { srcToken, account, chainId } = useTwapContext();
  return useMemo(() => ["allowance", srcToken?.address, account, chainId], [srcToken?.address, account, chainId]);
};

const useQueryFn = () => {
  const { srcToken } = useTwapContext();
  const { mutateAsync: getAllowance } = useAllowanceCallback();
  return useCallback(async () => {
    if (!srcToken) throw new Error("srcToken is not defined");
    return getAllowance(srcToken.address);
  }, [getAllowance, srcToken]);
};

const useAllowanceQuery = () => {
  const queryKey = useQueryKey();
  const queryFn = useQueryFn();
  const { srcToken } = useTwapContext();
  return useQuery({
    queryKey,
    queryFn,
    refetchInterval: 60_000,
    staleTime: 60_000,
    enabled: Boolean(srcToken?.address),
  });
};

export const useAllowanceListener = () => {
  return useAllowanceQuery();
};

export function useEnsureAllowanceCallback() {
  const { account, srcToken, chainId } = useTwapContext();
  const queryClient = useQueryClient();
  const enabled = Boolean(srcToken && account && chainId);
  const queryKey = useQueryKey();
  const queryFn = useQueryFn();

  const query = useAllowanceQuery();

  const ensure = useCallback(async () => {
    if (!enabled) throw new Error("Allowance check not ready (missing deps)");
    if (!query.isStale && query.data !== undefined) return query.data;
    return queryClient.ensureQueryData({ queryKey, queryFn, staleTime: 60_000 });
  }, [enabled, query, queryClient, queryKey, queryFn]);

  const refetch = useCallback(async () => {
    const result = await query.refetch();
    return result.data || "0";
  }, [query]);

  return {
    ensure,
    refetch,
  };
}
