import { useCallback } from "react";
import { useWidgetContext } from "..";
import { amountUiV2 } from "../utils";
import { useSrcBalance } from "./useBalances";
import { useMaxSrcInputAmount } from "./useMaxSrcInputAmount";
import BN from "bignumber.js";

export const useOnSrcInputPercentClick = () => {
  const { srcToken, updateState } = useWidgetContext();

  const maxAmount = useMaxSrcInputAmount();
  const srcBalance = useSrcBalance().data?.toString();
  return useCallback(
    (percent: number) => {
      if (!srcToken || !srcBalance || BN(srcBalance || 0).isZero()) return;

      const _maxAmount = maxAmount && percent === 1 && BN(maxAmount).gt(0) ? maxAmount : undefined;
      const value = amountUiV2(srcToken.decimals, _maxAmount || BN(srcBalance).times(percent).toString());
      updateState({ srcAmount: value });
    },
    [maxAmount, srcBalance, updateState, srcToken],
  );
};
