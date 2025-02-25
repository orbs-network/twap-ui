import { useMemo } from "react";
import { useWidgetContext } from "..";
import BN from "bignumber.js";
import { useAmountUi } from "./useParseAmounts";

export const useSrcChunkAmountUSD = () => {
  const { srcUsd1Token, srcToken, twap } = useWidgetContext();

  const srcChunksAmountUI = useAmountUi(srcToken?.decimals, twap.derivedState.srcTokenChunkAmount);
  return useMemo(() => {
    if (!srcUsd1Token) return "0";
    return BN(srcChunksAmountUI || "0")
      .times(srcUsd1Token || 0)
      .toString();
  }, [srcChunksAmountUI, srcUsd1Token]);
};
