import { useMemo } from "react";
import BN from "bignumber.js";
import { useSwap } from "../../hooks/use-swap";

export const useTradePrice = () => {
  const {
    swap: { dstAmount, srcAmount },
  } = useSwap();

  const price = useMemo(
    () =>
      BN(dstAmount || 0)
        .dividedBy(srcAmount || 0)
        .toString(),
    [dstAmount, srcAmount],
  );

  return price;
};
