import { setWeb3Instance, isNativeAddress, erc20 } from "@defi.org/web3-candies";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { Token, useWidgetContext } from "..";
import { REFETCH_BALANCE } from "../consts";
import { QueryKeys } from "../enums";
import BN from "bignumber.js";

export const useBalance = (token?: Token, onSuccess?: (value: BN) => void, staleTime?: number) => {
  const { web3, account } = useWidgetContext();

  const query = useQuery(
    [QueryKeys.GET_BALANCE, account, token?.address],
    () => {
      setWeb3Instance(web3);
      if (isNativeAddress(token!.address)) return web3!.eth.getBalance(account!).then(BN);
      else return erc20(token!.symbol, token!.address, token!.decimals).methods.balanceOf(account!).call().then(BN);
    },
    {
      enabled: !!web3 && !!token && !!account,
      onSuccess,
      refetchInterval: REFETCH_BALANCE,
      staleTime,
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
