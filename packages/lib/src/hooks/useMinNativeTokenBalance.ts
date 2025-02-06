import { useQueryClient, useQuery } from "@tanstack/react-query";
import BN from "bignumber.js";
import { useCallback } from "react";
import { amountBNV2 } from "../utils";
import { useWidgetContext } from "../widget/widget-context";
import { useNetwork } from "./useNetwork";
export const useMinNativeTokenBalance = (minNativeTokenBalance?: string) => {
  const { web3, account } = useWidgetContext();
  const { config } = useWidgetContext();
  const network = useNetwork();
  const key = ["useHasMinNativeTokenBalance", account, config.chainId, minNativeTokenBalance];
  const queryClient = useQueryClient();
  const query = useQuery(
    key,
    async () => {
      const balance = await web3!.eth.getBalance(account!);
      return BN(balance).gte(amountBNV2(network?.native.decimals, minNativeTokenBalance!));
    },
    {
      enabled: !!web3 && !!minNativeTokenBalance && !!account && !!config && !!network,
      staleTime: Infinity,
    },
  );

  const ensureData = useCallback(() => {
    return queryClient.ensureQueryData<ReturnType<typeof query.refetch>>(key);
  }, [queryClient, key]);

  return {
    ...query,
    ensureData,
  };
};
