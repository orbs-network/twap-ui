import BN from "bignumber.js";
import { useCallback } from "react";
import { stateActions } from "../../context/actions";
import { useTwapContext } from "../../context/context";
import { useMarketPrice } from "../../hooks/hooks";
import { amountUiV2, formatDecimals } from "../../utils";

export const useOnLimitPercentageClick = () => {
  const { marketPrice } = useMarketPrice();
  const { state, dstToken } = useTwapContext();
  const onChange = stateActions.useOnLimitChange();
  const onResetCustomLimit = stateActions.useResetCustomLimit();
  const { isInvertedLimitPrice } = state;

  return useCallback(
    (percent: string) => {
      if (BN(percent).isZero()) {
        onResetCustomLimit();
        return;
      }
      const p = BN(percent || 0)
        .div(100)
        .plus(1)
        .toString();
      let price = amountUiV2(dstToken?.decimals, marketPrice);

      if (isInvertedLimitPrice) {
        price = BN(1)
          .div(price || "0")
          .toString();
      }

      const value = BN(price || "0")
        .times(p)
        .toString();
      onChange(formatDecimals(value), percent);
    },
    [marketPrice, onChange, onResetCustomLimit, dstToken, isInvertedLimitPrice]
  );
};
