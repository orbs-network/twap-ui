import { useAmountUi, useIsMarketOrder, useMainStore, useOnLimitChange, useOnResetCustomLimit } from "@orbs-network/twap-ui-sdk";
import BN from "bignumber.js";
import { useCallback, useMemo } from "react";
import { stateActions } from "../../context/actions";
import { useTwapContext } from "../../context/context";
import { useLimitPrice, useLimitPricePercentDiffFromMarket, useShouldWrapOrUnwrapOnly } from "../../hooks/lib";
import { amountUiV2, formatDecimals } from "../../utils";

export const useOnLimitPercentageClick = () => {
  const { dstToken, marketPrice } = useTwapContext();
  const onChange = useOnLimitChange();
  const onResetCustomLimit = useOnResetCustomLimit();
  const { isInvertedLimitPrice } = useMainStore();

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
    [marketPrice, onChange, onResetCustomLimit, dstToken, isInvertedLimitPrice],
  );
};

export const useLimitInput = () => {
  const { dstToken } = useTwapContext();
  const { isInvertedLimitPrice, isCustomLimitPrice, customLimitPrice } = useMainStore();
  const {limitPriceUi: priceUi, isLoading} = useLimitPrice();

  const onChange = useOnLimitChange();

  const value = useMemo(() => {
    if (isCustomLimitPrice) {
      return customLimitPrice;
    }
    let res = priceUi;

    if (isInvertedLimitPrice) {
      res = BN(1)
        .div(res || 0)
        .toString();
    }

    return formatDecimals(res);
  }, [customLimitPrice, isCustomLimitPrice, isInvertedLimitPrice, priceUi, dstToken]);

  return {
    value: value || "",
    onChange,
    isLoading,
  };
};
const defaultPercent = [1, 5, 10];

const useList = () => {
  const { isInvertedLimitPrice } = useMainStore();

  return useMemo(() => {
    if (isInvertedLimitPrice) {
      return defaultPercent.map((it) => -it).map((it) => it.toString());
    }
    return defaultPercent.map((it) => it.toString());
  }, [isInvertedLimitPrice]);
};

const useCustomPercent = () => {
  const priceDeltaPercentage = useLimitPricePercentDiffFromMarket();
  const { limitPricePercent } =  useMainStore();

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
  const { srcToken, dstToken } = useTwapContext();

  const { isInvertedLimitPrice: inverted } = useMainStore();
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
  const { isInvertedLimitPrice: inverted, limitPricePercent } = useMainStore();
  const {limitPrice} = useLimitPrice();

  const priceDeltaPercentage = useLimitPricePercentDiffFromMarket();

  const isSelected = useMemo(() => {
    const p = limitPricePercent || priceDeltaPercentage;
    if (BN(limitPrice || 0).isZero()) {
      return false;
    }

    return BN(p || 0).eq(percent);
  }, [limitPricePercent, limitPrice, priceDeltaPercentage, percent]);

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
