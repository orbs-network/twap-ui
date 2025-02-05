import { setWeb3Instance, isNativeAddress, erc20 } from "@defi.org/web3-candies";
import { Token } from "@orbs-network/twap-ui-sdk";
import { useQuery } from "@tanstack/react-query";
import { REFETCH_BALANCE } from "../consts";
import { QueryKeys } from "../enums";
import { useWidgetContext } from "../widget/widget-context";
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
