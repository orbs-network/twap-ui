import BN from "bignumber.js";
import { useCallback } from "react";
import { useMarketPrice } from "../../hooks/hooks";
import { useTwapStore } from "../../store";
import { amountUiV2, formatDecimals } from "../../utils";

export const useOnLimitPercentageClick = () => {
  const { marketPrice } = useMarketPrice();
  const { onChange, onResetCustomLimit, setLimitPricePercent, dstToken, inverted } = useTwapStore((s) => ({
    onChange: s.onLimitChange,
    onResetCustomLimit: s.onResetCustomLimit,
    setLimitPricePercent: s.setLimitPricePercent,
    dstToken: s.dstToken,
    inverted: s.isInvertedLimitPrice,
  }));

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

      if (inverted) {
        price = BN(1)
          .div(price || "0")
          .toString();
      }

      const value = BN(price || "0")
        .times(p)
        .toString();
      setLimitPricePercent(percent);

      onChange(formatDecimals(value));
    },
    [marketPrice, onChange, setLimitPricePercent, onResetCustomLimit, dstToken, inverted]
  );
};

export const onCustomChange = () => {
  const { onChange, setLimitPricePercent } = useTwapStore((s) => ({
    onChange: s.onLimitChange,

    setLimitPricePercent: s.setLimitPricePercent,
  }));

  return useCallback(
    (customPrice: string) => {
      onChange(customPrice);
      setLimitPricePercent(undefined);
    },
    [onChange, setLimitPricePercent]
  );
};
