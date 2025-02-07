import { useMemo } from "react";
import { useWidgetContext } from "..";
import BN from "bignumber.js";
import { useAmountUi } from "./useParseAmounts";

export const useSrcChunkAmountUSD = () => {
  const { srcUsd1Token, srcToken, twap } = useWidgetContext();

  const srcChunksAmount = twap.values.srcChunkAmount;
  const result = useMemo(() => {
    if (!srcUsd1Token) return "0";
    return BN(srcChunksAmount || "0")
      .times(srcUsd1Token || 0)
      .toString();
  }, [srcChunksAmount, srcUsd1Token]);

  return useAmountUi(srcToken?.decimals, result);
};
