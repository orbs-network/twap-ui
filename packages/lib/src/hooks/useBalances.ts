import { isNativeAddress, erc20abi } from "@defi.org/web3-candies";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { Token, useWidgetContext } from "..";
import { REFETCH_BALANCE } from "../consts";
import { QueryKeys } from "../enums";
import BN from "bignumber.js";
import { readContract } from "viem/actions";

export const useBalance = (token?: Token, onSuccess?: (value: BN) => void, staleTime?: number) => {
  const { account, publicClient } = useWidgetContext();

  const query = useQuery(
    [QueryKeys.GET_BALANCE, account, token?.address],
    async () => {
      if (isNativeAddress(token!.address)) {
        const res = await (publicClient as any).getBalance({ address: account });
        return res.toString();
      } else {
        const balance = await (readContract as any)(publicClient, {
          address: token?.address,
          abi: erc20abi,
          functionName: "balanceOf",
          args: [account],
        });

        return balance.toString();
      }
    },
    {
      enabled: !!token && !!account,
      onSuccess,
      refetchInterval: REFETCH_BALANCE,
      staleTime: Infinity,
    },
  );
  return { ...query, isLoading: query.isLoading && query.fetchStatus !== "idle" && !!token };
};

export const useRefetchBalances = () => {
  const { refetch: refetchSrcBalance } = useSrcBalance();
  const { refetch: refetchDstBalance } = useDstBalance();

  return useCallback(async () => {
    await Promise.all([refetchSrcBalance(), refetchDstBalance()]);
  }, [refetchSrcBalance, refetchDstBalance]);
};

export const useSrcBalance = () => {
  const srcToken = useWidgetContext().srcToken;
  return useBalance(srcToken);
};

export const useDstBalance = () => {
  const dstToken = useWidgetContext().dstToken;
  return useBalance(dstToken);
};
