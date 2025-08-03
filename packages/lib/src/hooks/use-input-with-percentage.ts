import { amountBN, amountUi } from "@orbs-network/twap-sdk";
import { useMemo, useCallback } from "react";
import BN from "bignumber.js";
import { useTwapContext } from "../context";
import { formatDecimals } from "../utils";
import { useUsdAmount } from "./helper-hooks";
import { useInvertTrade } from "./use-invert-trade";

export const useInputWithPercentage = ({
  typedValue,
  tokenDecimals = 18,
  initialPrice,
  percentage,
  setValue,
  setPercentage,
}: {
  typedValue?: string;
  tokenDecimals?: number;
  initialPrice?: string;
  percentage?: number | null;
  setValue: (value?: string) => void;
  setPercentage: (percentage?: number | null) => void;
}) => {
  const { srcUsd1Token, dstUsd1Token } = useTwapContext();
  const { isInverted } = useInvertTrade();
  const priceWei = useMemo(() => {
    if (typedValue !== undefined) {
      const value = isInverted ? (BN(typedValue).isZero() ? BN(0) : BN(1).div(typedValue)) : BN(typedValue);
      return amountBN(tokenDecimals, value.toFixed());
    }

    if (percentage !== undefined && initialPrice) {
      const price = BN(initialPrice);
      const percentFactor = BN(percentage || 0)
        .abs()
        .div(100);
      const adjusted = percentage && percentage < 0 ? price.minus(price.multipliedBy(percentFactor)) : price.plus(price.multipliedBy(percentFactor));
      return adjusted.decimalPlaces(0).toFixed();
    }

    return initialPrice || "";
  }, [typedValue, percentage, tokenDecimals, initialPrice, isInverted]);

  const onChange = useCallback(
    (typed?: string) => {
      setValue(typed);
      setPercentage(null);
    },
    [setValue, setPercentage],
  );

  const onPercentageChange = useCallback(
    (percent?: number) => {
      setValue(undefined);
      setPercentage(percent);
    },
    [setValue, setPercentage],
  );

  const percentDiffFromMarketPrice = useMemo(() => {
    if (!initialPrice || BN(initialPrice).isZero()) return undefined;

    if (percentage !== undefined && percentage !== null) {
      return !percentage ? undefined : percentage;
    }

    if (priceWei) {
      const base = BN(initialPrice);
      const diff = BN(priceWei).minus(base).div(base).multipliedBy(100);
      const result = Number(diff.toFixed(2));
      return !result ? undefined : result;
    }

    return undefined;
  }, [priceWei, initialPrice, percentage]);

  const amountUI = useMemo(() => {
    let result = "";
    if (typedValue !== undefined) {
      result = typedValue;
    } else {
      const amount = amountUi(tokenDecimals, priceWei);
      result = isInverted ? (BN(amount).isZero() ? "0" : BN(1).div(amount).toFixed()) : amount;
    }

    return formatDecimals(result, 6);
  }, [typedValue, tokenDecimals, priceWei, isInverted]);

  const usd = useUsdAmount(isInverted ? srcUsd1Token : dstUsd1Token, amountUI);

  return {
    amountWei: priceWei,
    amountUI,
    percentDiffFromMarketPrice,
    onChange,
    onPercentageChange,
    percentage,
    isInverted,
    usd,
  };
};
