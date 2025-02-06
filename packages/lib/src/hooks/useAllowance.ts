import { useQuery } from "@tanstack/react-query";
import { STALE_ALLOWANCE } from "../consts";
import { QueryKeys } from "../enums";
import { useWidgetContext } from "../widget/widget-context";
import BN from "bignumber.js";
import { erc20abi, isNativeAddress } from "@defi.org/web3-candies";
import { useNetwork } from "./useNetwork";
import { useContract } from "./useContracts";

export const useHasAllowance = () => {
  const { account, srcToken, config, twap } = useWidgetContext();
  const {
    values: { srcAmount },
  } = twap;
  const wToken = useNetwork()?.wToken;
  const token = srcToken && isNativeAddress(srcToken?.address || "") ? wToken : srcToken;
  const contract = useContract(erc20abi, token?.address);

  const query = useQuery(
    [QueryKeys.GET_ALLOWANCE, config.chainId, token?.address, srcAmount],
    async () => {
      const allowance = BN(await contract!.methods.allowance(account, config.twapAddress).call());
      return allowance.gte(srcAmount);
    },
    {
      enabled: !!srcToken && BN(srcAmount).gt(0) && !!account && !!config && !!wToken && !!contract,
      staleTime: Infinity,
      refetchOnWindowFocus: true,
    },
  );

  return { ...query, isLoading: query.isLoading && query.fetchStatus !== "idle" };
};
