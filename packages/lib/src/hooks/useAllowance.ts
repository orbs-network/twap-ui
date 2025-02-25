import { useQuery } from "@tanstack/react-query";
import { useWidgetContext } from "../widget/widget-context";
import BN from "bignumber.js";
import { readContract } from "viem/actions";
import { useHandleNativeAddress } from "./useHandleNativeAddress";
import { erc20Abi } from "viem";
import { useAmountBN } from "./useParseAmounts";

export const useHasAllowance = () => {
  const { account, srcToken, config, state, publicClient } = useWidgetContext();
  const srcAmount = useAmountBN(srcToken?.decimals, state.typedSrcAmount);
  const tokenAddress = useHandleNativeAddress(srcToken?.address);

  const query = useQuery(
    ["useTwapHasAllowance", config.chainId, srcToken?.address, srcAmount],
    async () => {
      const allowance = await (readContract as any)(publicClient, {
        address: tokenAddress,
        abi: erc20Abi,
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
