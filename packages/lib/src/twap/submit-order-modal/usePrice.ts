import { useTwapStore } from "../../useTwapStore";
import { useMemo } from "react";
import BN from "bignumber.js";

export const useTradePrice = () => {
  const trade = useTwapStore((s) => s.state.trade);

  const price = useMemo(
    () =>
      BN(trade?.dstAmount || 0)
        .dividedBy(trade?.srcAmount || 0)
        .toString(),
    [trade?.dstAmount, trade?.srcAmount],
  );

  return price;
};
