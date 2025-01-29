import { useState, useMemo, useCallback } from "react";
import BN from "bignumber.js";
import { Token } from "../types";

export const usePriceDisplay = (srcToken?: Token, destToken?: Token, srcAmount?: string, destAmount?: string) => {
  const [inverted, setInvert] = useState(Boolean);

  const price = useMemo(() => {
    if (!destAmount || !srcAmount) return "0";
    const value = BN(destAmount).dividedBy(srcAmount).toString();
    return inverted ? BN(1).div(value).toString() : value;
  }, [destAmount, srcAmount, inverted]);

  const toggleInvert = useCallback(() => {
    setInvert((prev) => !prev);
  }, []);

  return {
    toggleInvert,
    price,
    leftToken: inverted ? destToken : srcToken,
    rightToken: inverted ? srcToken : destToken,
  };
};
