import { useCallback } from "react";
import { useWidgetContext } from "..";
import { useMaxSrcInputAmount } from "./useMaxSrcInputAmount";
import BN from "bignumber.js";
import { amountUi } from "@orbs-network/twap-sdk";

export const useOnSrcInputPercentClick = () => {
  const { srcToken, updateState, srcBalance } = useWidgetContext();

  const maxAmount = useMaxSrcInputAmount();
  return useCallback(
    (percent: number) => {
      if (!srcToken || !srcBalance || BN(srcBalance || 0).isZero()) return;

      const _maxAmount = maxAmount && percent === 1 && BN(maxAmount).gt(0) ? maxAmount : undefined;
      const value = amountUi(srcToken.decimals, _maxAmount || BN(srcBalance).times(percent).toString());
      updateState({ srcAmount: value });
    },
    [maxAmount, srcBalance, updateState, srcToken],
  );
};
