import { useQuery } from "@tanstack/react-query";
import { useGetHasAllowance } from ".";
import { STALE_ALLOWANCE } from "../consts";
import { QueryKeys } from "../enums";
import { useWidgetContext } from "../widget/widget-context";
import BN from "bignumber.js";

export const useAllowance = () => {
  const { account, srcToken, config, twap } = useWidgetContext();
  const getHasAllowance = useGetHasAllowance();
  const {
    values: { srcAmount },
  } = twap;

  const query = useQuery(
    [QueryKeys.GET_ALLOWANCE, config.chainId, srcToken?.address, srcAmount],
    async () => {
      return getHasAllowance(srcToken!, srcAmount);
    },
    {
      enabled: !!srcToken && BN(srcAmount).gt(0) && !!account && !!config,
      staleTime: STALE_ALLOWANCE,
      refetchOnWindowFocus: true,
    },
  );

  return { ...query, isLoading: query.isLoading && query.fetchStatus !== "idle" };
};
