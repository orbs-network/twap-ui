import { useMemo } from "react";
import BN from "bignumber.js";
import { useDstTokenAmount } from "../../hooks/use-dst-amount";
import { useSrcAmount } from "../../hooks/use-src-amount";

export const useTradePrice = () => {
  const srcAmount = useSrcAmount().amountUI;
  const dstAmount = useDstTokenAmount().amountUI;

  const price = useMemo(
    () =>
      BN(dstAmount || 0)
        .dividedBy(srcAmount || 0)
        .toString(),
    [dstAmount, srcAmount],
  );

  return price;
};
