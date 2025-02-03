import { useMemo, useCallback } from "react";
import BN from "bignumber.js";
import { State, Token } from "../types";
import { TwapValues } from "./useDerivedValues";
import { toAmountUi } from "../utils";

type UpdateState = (value: Partial<State>) => void;
const defaultPercent = [1, 5, 10];

export const useLimitPricePanel = (state: State, values: TwapValues, updateState: UpdateState, srcToken?: Token, destToken?: Token, marketPrice?: string) => {
  const { limitPriceUI, priceDiffFromMarket } = values;
  const { isInvertedLimitPrice, typedPrice, limitPricePercent } = state;

  const onLimitPricePercent = useCallback(
    (percent?: string) => {
      if (!marketPrice) {
        return;
      }
      updateState({ limitPricePercent: percent });
      if (BN(percent || 0).isZero()) {
        updateState({ typedPrice: undefined });
        return;
      }
      const p = BN(percent || 0)
        .div(100)
        .plus(1)
        .toString();
      let price = toAmountUi(destToken?.decimals, marketPrice);

      if (state.isInvertedLimitPrice) {
        price = BN(1)
          .div(price || "0")
          .toString();
      }

      const value = BN(price || "0")
        .times(p)
        .toString();
      updateState({ typedPrice: BN(value).decimalPlaces(6).toString() });
    },
    [updateState, destToken, marketPrice, state.isInvertedLimitPrice],
  );

  const limitPrice = useMemo(() => {
    if (typedPrice !== undefined) return typedPrice;
    if (isInvertedLimitPrice && limitPriceUI) {
      return BN(1).div(limitPriceUI).decimalPlaces(6).toString();
    }

    return BN(limitPriceUI).decimalPlaces(6).toString();
  }, [typedPrice, limitPriceUI, isInvertedLimitPrice]);

  const onLimitPriceReset = useCallback(() => onLimitPricePercent("0"), [onLimitPricePercent]);

  const setLimitPrice = useCallback((typedPrice: string) => updateState({ typedPrice, limitPricePercent: undefined }), [updateState]);

  const onInvertLimitPrice = useCallback(() => {
    updateState({
      isInvertedLimitPrice: !state.isInvertedLimitPrice,
      typedPrice: undefined,
      limitPricePercent: undefined,
    });
  }, [updateState, state.isInvertedLimitPrice, state.typedPrice, state.limitPricePercent]);

  const isSelectedPercentCallback = useCallback(
    (percent: number) => {
      const p = limitPricePercent || priceDiffFromMarket;
      if (BN(limitPrice || 0).isZero()) return false;
      return BN(p || 0).eq(percent);
    },
    [limitPricePercent, limitPrice, priceDiffFromMarket],
  );

  const percentList = useMemo(() => {
    if (isInvertedLimitPrice) {
      return defaultPercent.map((it) => -it).map((it) => it.toString());
    } else {
      return defaultPercent.map((it) => it.toString());
    }
  }, [isInvertedLimitPrice]);

  const resetButton = useMemo(() => {
    let text = "";
    let selected = false;
    let isReset = false;
    if (BN(priceDiffFromMarket).isZero() || percentList.includes(priceDiffFromMarket) || limitPricePercent) {
      text = "0%";
    } else {
      text = `${priceDiffFromMarket}%`;
      selected = true;
      isReset = true;
    }

    return {
      text,
      selected,
      onClick: onLimitPriceReset,
      isReset,
    };
  }, [limitPricePercent, priceDiffFromMarket, onLimitPriceReset, percentList]);

  const percentButtons = useMemo(() => {
    const buttons = percentList.map((percent) => {
      return {
        text: `${BN(percent || 0).isZero() ? "" : isInvertedLimitPrice ? "-" : !isInvertedLimitPrice && "+"} ${Math.abs(Number(percent))} %`,
        selected: isSelectedPercentCallback(Number(percent)),
        onClick: () => onLimitPricePercent(percent),
        isReset: false,
      };
    });

    return [resetButton, ...buttons];
  }, [percentList, isSelectedPercentCallback, onLimitPricePercent, isInvertedLimitPrice, resetButton]);

  return {
    setLimitPrice,
    onLimitPricePercent,
    onLimitPriceReset,
    limitPrice,
    isLoading: Boolean(srcToken && destToken && !marketPrice),
    isInvertedLimitPrice,
    onInvertLimitPrice,
    limitPricePercent,
    srcToken: isInvertedLimitPrice ? destToken : srcToken,
    destToken: isInvertedLimitPrice ? srcToken : destToken,
    priceDiffFromMarket: values.priceDiffFromMarket,
    isSelectedPercentCallback,
    percentButtons,
  };
};
