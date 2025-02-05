import { estimateGasPrice } from "@defi.org/web3-candies";
import { useQuery } from "@tanstack/react-query";
import BN from "bignumber.js";
import { REFETCH_GAS_PRICE } from "../consts";
import { QueryKeys } from "../enums";
import { useWidgetContext } from "../widget/widget-context";

export const useGasPrice = () => {
  const { web3, maxFeePerGas: contextMax, priorityFeePerGas: contextTip } = useWidgetContext();
  const { isLoading, data } = useQuery([QueryKeys.GET_GAS_PRICE, contextTip, contextMax], () => estimateGasPrice(undefined, undefined, web3), {
    enabled: !!web3,
    refetchInterval: REFETCH_GAS_PRICE,
  });

  const priorityFeePerGas = BN.max(data?.fast.tip || 0, contextTip || 0);
  const maxFeePerGas = BN.max(data?.fast.max || 0, contextMax || 0, priorityFeePerGas);

  return {
    isLoading,
    maxFeePerGas,
    priorityFeePerGas,
  };
};
