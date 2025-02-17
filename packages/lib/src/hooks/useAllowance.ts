import { useQuery } from "@tanstack/react-query";
import { useWidgetContext } from "../widget/widget-context";
import BN from "bignumber.js";
import { readContract } from "viem/actions";
import { useHandleNativeAddress } from "./useHandleNativeAddress";
import { erc20abi } from "@defi.org/web3-candies";

export const useHasAllowance = () => {
  const { account, srcToken, config, twap, publicClient } = useWidgetContext();
  const {
    values: { srcAmount },
  } = twap;

  const tokenAddress = useHandleNativeAddress(srcToken?.address);
  const query = useQuery(
    ["useTwapHasAllowance", config.chainId, srcToken?.address, srcAmount],
    async () => {
      const allowance = await (readContract as any)(publicClient, {
        address: tokenAddress,
        abi: erc20abi,
        functionName: "allowance",
        args: [account, config.twapAddress],
      });
      return BN(allowance).gte(srcAmount);
    },
    {
      enabled: !!srcToken && BN(srcAmount).gt(0) && !!account && !!config,
      staleTime: Infinity,
      refetchOnWindowFocus: true,
    },
  );

  return { ...query, isLoading: query.isLoading && query.fetchStatus !== "idle" };
};
