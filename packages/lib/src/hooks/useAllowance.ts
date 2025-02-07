import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "../enums";
import { useWidgetContext } from "../widget/widget-context";
import BN from "bignumber.js";
import { useERC20Contract } from "./useContracts";

export const useHasAllowance = () => {
  const { account, srcToken, config, twap } = useWidgetContext();
  const {
    values: { srcAmount },
  } = twap;
  const contract = useERC20Contract(srcToken?.address);

  const query = useQuery(
    [QueryKeys.GET_ALLOWANCE, config.chainId, srcToken?.address, srcAmount],
    async () => {
      const allowance = BN(await contract!.methods.allowance(account, config.twapAddress).call());
      return allowance.gte(srcAmount);
    },
    {
      enabled: !!srcToken && BN(srcAmount).gt(0) && !!account && !!config && !!contract,
      staleTime: Infinity,
      refetchOnWindowFocus: true,
    },
  );

  return { ...query, isLoading: query.isLoading && query.fetchStatus !== "idle" };
};
