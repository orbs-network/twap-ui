import { amountUi } from "@orbs-network/twap-sdk";
import { useState, useMemo, useCallback } from "react";
import { useTwapContext } from "../context";
import BN from "bignumber.js";

export const useMarketPricePanel = () => {
  const { srcToken, dstToken, marketPrice } = useTwapContext();
  const [invert, setInvert] = useState(false);

  const price = useMemo(() => {
    const amountUI = amountUi(dstToken?.decimals, marketPrice);
    if (invert) {
      return BN(1)
        .div(amountUI || 0)
        .toFixed();
    }
    return amountUI;
  }, [invert, marketPrice, srcToken?.decimals, dstToken?.decimals]);

  return {
    sellToken: invert ? dstToken : srcToken,
    buyToken: invert ? srcToken : dstToken,
    price,
    onInvert: useCallback(() => setInvert(!invert), [invert]),
  };
};
