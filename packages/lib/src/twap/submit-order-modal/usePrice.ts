import { useMemo } from "react";
import BN from "bignumber.js";
import { useDerivedSwap } from "../../hooks/use-derived-swap";

export const useTradePrice = () => {
  const { dstAmount, srcAmount } = useDerivedSwap();

  const price = useMemo(
    () =>
      BN(dstAmount || 0)
        .dividedBy(srcAmount || 0)
        .toString(),
    [dstAmount, srcAmount],
  );

  return price;
};
