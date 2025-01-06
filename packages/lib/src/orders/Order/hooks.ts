import { useMemo } from "react";
import { usePriceUSD } from "../../hooks";
import { useTwapStore } from "../../store";
import { useListOrderContext } from "./context";

export const useOrderPrice = () => {
  const { order, srcToken, dstToken } = useListOrderContext();
  const lib = useTwapStore((state) => state.lib);
  const srcUsd = usePriceUSD(srcToken?.address).value.toString();
  const dstUsd = usePriceUSD(dstToken?.address).value.toString();

  return useMemo(() => {
    if (!srcToken || !dstToken || !srcUsd || !dstUsd || !lib) return undefined;
    return lib.dstPriceFor1Src(srcToken, dstToken, srcUsd, dstUsd, order.srcBidAmount, order.dstMinAmount).toString();
  }, [srcToken, dstToken, srcUsd, dstUsd, lib, order.srcBidAmount, order.dstMinAmount]);
};
