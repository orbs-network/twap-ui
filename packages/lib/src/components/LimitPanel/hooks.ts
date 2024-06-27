import BN from "bignumber.js";
import { useCallback } from "react";
import { useMarketPrice } from "../../hooks";
import { useTwapStore } from "../../store";
import { amountUiV2, formatDecimals } from "../../utils";

export const useOnLimitPercentageClick = () => {
  const marketPrice = useMarketPrice().marketPriceRaw;
  const { onChange, onResetCustom, setLimitPricePercent, dstToken } = useTwapStore((s) => ({
    onChange: s.onLimitChange,
    onResetCustom: s.onResetCustomLimit,
    setLimitPricePercent: s.setLimitPricePercent,
    dstToken: s.dstToken,
  }));

  return useCallback(
    (percent: string) => {
      if (BN(percent).isZero()) {
        onResetCustom();
        return;
      }
      const p = BN(percent || 0)
        .div(100)
        .plus(1)
        .toString();

      const rawValue = BN(marketPrice || "0")
        .times(p)
        .toString();
      setLimitPricePercent(percent);

      onChange(formatDecimals(amountUiV2(dstToken?.decimals, rawValue)));
    },
    [marketPrice, onChange, setLimitPricePercent, onResetCustom]
  );
};
