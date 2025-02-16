import { isNativeAddress } from "@defi.org/web3-candies";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { Token, useWidgetContext } from "..";
import { REFETCH_BALANCE } from "../consts";
import { QueryKeys } from "../enums";
import { readContract } from "viem/actions";
import { erc20Abi } from "viem";

export const useBalance = (token?: Token) => {
  const { account, publicClient, chainId } = useWidgetContext();

  const query = useQuery(
    [QueryKeys.GET_BALANCE, account, token?.address, chainId],
    async () => {
      console.log({token});
      
      let balance = "";
      if (isNativeAddress(token!.address)) {
      try {
        console.log({ publicClient });

        const res = await (publicClient as any).getBalance({ address: account });

        return res.toString();
      } catch (error) {
        console.log({ error });
      }
      } else {
        try {
          balance = await (readContract as any)(publicClient, {
            address: token?.address,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [account],
          });
        } catch (error) {
          console.log({ error });
        }
        console.log({ balance });
        return balance.toString();
      }
    },
    {
      enabled: !!token && !!account && !!publicClient,
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
