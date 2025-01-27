import { useMemo, useCallback } from "react";
import { useTwapContext } from "../context";
import BN from "bignumber.js";
import { useShouldWrapOrUnwrapOnly } from "./hooks";

export const useLimitPricePanel = () => {
  const isWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();
  const {
    derivedValues: { priceUI, priceDiffFromMarket, isMarketOrder },
    actionHandlers: { onPricePercentClick, setLimitPrice },
    state: { isInvertedLimitPrice, typedPrice, limitPricePercent, srcToken, destToken, marketPrice },
  } = useTwapContext();

  const value = useMemo(() => {
    if (typedPrice !== undefined) return typedPrice;

    if (isInvertedLimitPrice && priceUI) {
      return BN(1).div(priceUI).decimalPlaces(6).toString();
    }

    return BN(priceUI).decimalPlaces(6).toString();
  }, [typedPrice, priceUI, isInvertedLimitPrice]);

  const showReset = useMemo(() => {
    if (BN(priceDiffFromMarket).isZero()) return false;
    if (BN(limitPricePercent || 0).gt(0)) return false;
    return true;
  }, [priceDiffFromMarket, limitPricePercent]);

  const onReset = useCallback(() => onPricePercentClick("0"), [onPricePercentClick]);

  return {
    hidePanel: isMarketOrder || isWrapOrUnwrapOnly,
    onInputChange: setLimitPrice,
    onPercentClick: onPricePercentClick,
    onReset,
    inputValue: value,
    isLoading: Boolean(srcToken && destToken && !marketPrice),
    inverted: isInvertedLimitPrice,
    showReset,
    selectedPercent: limitPricePercent,
    srcToken: isInvertedLimitPrice ? destToken : srcToken,
    destToken: isInvertedLimitPrice ? srcToken : destToken,
  };
};
