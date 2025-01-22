import BN from "bignumber.js";
import { useCallback, useMemo } from "react";
import { useShouldWrapOrUnwrapOnly } from "../../hooks/lib";
import { useTwapContext as useTwapContextUI } from "@orbs-network/twap-ui-sdk";

const defaultPercent = [1, 5, 10];

const useList = () => {
  const { state } = useTwapContextUI();
  const { isInvertedLimitPrice } = state;

  return useMemo(() => {
    if (isInvertedLimitPrice) {
      return defaultPercent.map((it) => -it).map((it) => it.toString());
    }
    return defaultPercent.map((it) => it.toString());
  }, [isInvertedLimitPrice]);
};

const useCustomPercent = () => {
  const {
    state,
    derivedValues: { priceDiffFromMarket },
  } = useTwapContextUI();

  const { limitPricePercent } = state;

  const formatted = useList();

  const custom = useMemo(() => {
    if (BN(priceDiffFromMarket).isZero()) {
      return false;
    }

    if (BN(limitPricePercent || 0).gt(0)) {
      return false;
    }

    if (limitPricePercent && formatted.includes(limitPricePercent)) {
      return false;
    }
    if (priceDiffFromMarket && formatted.includes(priceDiffFromMarket)) {
      return false;
    }

    return true;
  }, [priceDiffFromMarket, limitPricePercent, formatted]);

  return custom ? priceDiffFromMarket : undefined;
};

export const useLimitPercentList = () => {
  const {
    derivedValues: { priceDiffFromMarket },
  } = useTwapContextUI();
  const formatted = useList();
  const custom = useCustomPercent();

  return useMemo(() => {
    if (!custom) {
      return ["0", ...formatted];
    }
    return formatted;
  }, [formatted, custom, priceDiffFromMarket]);
};

export const useLimitTokens = () => {
  const { state } = useTwapContextUI();

  const { isInvertedLimitPrice: inverted, srcToken, destToken } = state;
  return useMemo(() => {
    return {
      srcToken: inverted ? destToken : srcToken,
      dstToken: inverted ? srcToken : destToken,
    };
  }, [inverted, destToken, srcToken]);
};

export const useLimitResetButton = () => {
  const customPercent = useCustomPercent();
  const { actionHandlers } = useTwapContextUI();
  const onSelectCallback = actionHandlers.onPricePercentClick;
  const onReset = useCallback(() => {
    onSelectCallback("0");
  }, [onSelectCallback]);

  return {
    value: customPercent,
    onReset,
  };
};

export const useLimitPercentButton = (percent: string) => {
  const {
    state,
    derivedValues: { price, priceDiffFromMarket },
    actionHandlers,
  } = useTwapContextUI();
  const { isInvertedLimitPrice: inverted, limitPricePercent } = state;

  const isSelected = useMemo(() => {
    const p = limitPricePercent || priceDiffFromMarket;
    if (BN(price || 0).isZero()) {
      return false;
    }

    return BN(p || 0).eq(percent);
  }, [limitPricePercent, price, priceDiffFromMarket, percent]);

  const text = useMemo(() => {
    return `${BN(percent || 0).isZero() ? "" : inverted ? "-" : !inverted && "+"} ${Math.abs(Number(percent))} %`;
  }, [inverted, percent]);

  const onSelectCallback = actionHandlers.onPricePercentClick;

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
  const {
    derivedValues: { isMarketOrder },
  } = useTwapContextUI();
  const shouldWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();

  return {
    showWarning: isMarketOrder,
    hidePanel: shouldWrapOrUnwrapOnly,
  };
};
