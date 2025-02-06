import { useMemo } from "react";
import { useWidgetContext } from "..";
import BN from "bignumber.js";

const getUsdAmount = (amount?: string, usd?: string | number) => {
  if (!amount || !usd || BN(amount || "0").isZero() || BN(usd || "0").isZero()) return "0";
  return BN(amount || "0")
    .times(usd)
    .toString();
};
export const useUsdAmount = () => {
  const { dstUsd, srcUsd, twap } = useWidgetContext();
  const { srcAmountUI, destTokenAmountUI } = twap.values;

  return {
    srcUsd: useMemo(() => {
      return getUsdAmount(srcAmountUI, srcUsd);
    }, [srcAmountUI, srcUsd]),
    dstUsd: useMemo(() => {
      return getUsdAmount(destTokenAmountUI, dstUsd);
    }, [destTokenAmountUI, dstUsd]),
  };
};
