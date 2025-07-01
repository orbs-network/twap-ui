import { useTwapStore } from "../../useTwapStore";
import { useMemo } from "react";
import BN from "bignumber.js";

export const useTradePrice = () => {
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const acceptedDstAmount = useTwapStore((s) => s.state.acceptedDstAmount);

  const price = useMemo(
    () =>
      BN(acceptedDstAmount || 0)
        .dividedBy(typedSrcAmount || 0)
        .toString(),
    [acceptedDstAmount, typedSrcAmount],
  );

  return price;
};
