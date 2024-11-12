import BN from "bignumber.js";
import { useCallback, useMemo } from "react";
import { useTwapContext } from "../../context/context";
import { useIsMarketOrder, useLimitPrice, useLimitPricePercentDiffFromMarket, useSetLimitPrice, useShouldWrapOrUnwrapOnly } from "../../hooks/lib";
import { amountUiV2, formatDecimals } from "../../utils";

export const useOnLimitPercentageClick = () => {
  const { dstToken, marketPrice, state } = useTwapContext();
  const onChange = useSetLimitPrice();
  const { isInvertedLimitPrice } = state;

  return useCallback(
    (percent: string) => {
      if (BN(percent).isZero()) {
        onChange(undefined);
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
    [marketPrice, onChange, dstToken, isInvertedLimitPrice, state],
  );
};

export const useLimitInput = () => {
  const { dstToken, state, updateState } = useTwapContext();
  const { isInvertedLimitPrice, typedLimitPrice } = state;
  const { priceUi, isLoading } = useLimitPrice();

  const onChange = useCallback(
    (value: string) => {
      updateState({ typedLimitPrice: value, limitPricePercent: undefined });
    },
    [updateState],
  );

  const value = useMemo(() => {
    if (typedLimitPrice) return typedLimitPrice;
    let res = priceUi;

    if (isInvertedLimitPrice) {
      res = BN(1)
        .div(res || 0)
        .toString();
    }

    return formatDecimals(res);
  }, [priceUi, isInvertedLimitPrice, typedLimitPrice]);

  return {
    value: value || "",
    onChange,
    isLoading,
  };
};
const defaultPercent = [1, 5, 10];

const useList = () => {
  const { state } = useTwapContext();
  const { isInvertedLimitPrice } = state;

  return useMemo(() => {
    if (isInvertedLimitPrice) {
      return defaultPercent.map((it) => -it).map((it) => it.toString());
    }
    return defaultPercent.map((it) => it.toString());
  }, [isInvertedLimitPrice]);
};

const useCustomPercent = () => {
  const { state } = useTwapContext();

  const priceDeltaPercentage = useLimitPricePercentDiffFromMarket();
  const { limitPricePercent } = state;

  const formatted = useList();

  const custom = useMemo(() => {
    if (BN(priceDeltaPercentage).isZero()) {
      return false;
    }

    if (BN(limitPricePercent || 0).gt(0)) {
      return false;
    }

    if (limitPricePercent && formatted.includes(limitPricePercent)) {
      return false;
    }
    if (priceDeltaPercentage && formatted.includes(priceDeltaPercentage)) {
      return false;
    }

    return true;
  }, [priceDeltaPercentage, limitPricePercent, formatted]);

  return custom ? priceDeltaPercentage : undefined;
};

export const useLimitPercentList = () => {
  const priceDeltaPercentage = useLimitPricePercentDiffFromMarket();
  const formatted = useList();
  const custom = useCustomPercent();

  return useMemo(() => {
    if (!custom) {
      return ["0", ...formatted];
    }
    return formatted;
  }, [formatted, custom, priceDeltaPercentage]);
};

export const useLimitTokens = () => {
  const { srcToken, dstToken, state } = useTwapContext();

  const { isInvertedLimitPrice: inverted } = state;
  return useMemo(() => {
    return {
      srcToken: inverted ? dstToken : srcToken,
      dstToken: inverted ? srcToken : dstToken,
    };
  }, [srcToken, dstToken, inverted]);
};

export const useLimitResetButton = () => {
  const customPercent = useCustomPercent();
  const onSelectCallback = useOnLimitPercentageClick();
  const onReset = useCallback(() => {
    onSelectCallback("0");
  }, [onSelectCallback]);

  return {
    value: customPercent,
    onReset,
  };
};

export const useLimitPercentButton = (percent: string) => {
  const { state } = useTwapContext();
  const { isInvertedLimitPrice: inverted, limitPricePercent } = state;
  const { price } = useLimitPrice();

  const priceDeltaPercentage = useLimitPricePercentDiffFromMarket();

  const isSelected = useMemo(() => {
    const p = limitPricePercent || priceDeltaPercentage;
    if (BN(price || 0).isZero()) {
      return false;
    }

    return BN(p || 0).eq(percent);
  }, [limitPricePercent, price, priceDeltaPercentage, percent]);

  const text = useMemo(() => {
    return `${BN(percent || 0).isZero() ? "" : inverted ? "-" : !inverted && "+"} ${Math.abs(Number(percent))} %`;
  }, [inverted, percent]);

  const onSelectCallback = useOnLimitPercentageClick();

  const onSelect = useCallback(() => {
    onSelectCallback(percent);
  }, [onSelectCallback, percent]);

  return {
    value: percent,
    isSelected,
    onSelect,
    text,
  };
};

export const useLimitPricePanel = () => {
  const isMarket = useIsMarketOrder();
  const shouldWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();

  return {
    showWarning: isMarket,
    hidePanel: shouldWrapOrUnwrapOnly,
  };
};
