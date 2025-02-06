import { useMemo } from "react";
import { useWidgetContext } from "..";
import BN from "bignumber.js";
import { useAmountUi } from "./useParseAmounts";

export const useSrcChunkAmountUSD = () => {
  const { srcUsd, srcToken, twap } = useWidgetContext();

  const srcChunksAmount = twap.values.srcChunkAmount;
  const result = useMemo(() => {
    if (!srcUsd) return "0";
    return BN(srcChunksAmount || "0")
      .times(srcUsd || 0)
      .toString();
  }, [srcChunksAmount, srcUsd]);

  return useAmountUi(srcToken?.decimals, result);
};
