import { amountBN, amountUi } from "@orbs-network/twap-sdk";
import { useMemo, useCallback } from "react";
import BN from "bignumber.js";
import { useTwapContext } from "../context/twap-context";
import { formatDecimals } from "../utils";
import { useUsdAmount } from "./helper-hooks";
import { useInvertTrade } from "./use-invert-trade";

export const useInputWithPercentage = ({
  typedValue,
  tokenDecimals = 18,
  initialPrice = "0",
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

    if (percentage !== undefined && BN(initialPrice || "0").gt(0) && !BN(initialPrice || "0").isNaN()) {
      const price = BN(initialPrice || "0");
      const percentFactor = BN(percentage || 0).div(100);

      const adjusted = price.plus(price.multipliedBy(percentFactor));
      return adjusted.decimalPlaces(0).toFixed();
    }
    return BN(initialPrice).gt(0) ? initialPrice : "";
  }, [typedValue, percentage, tokenDecimals, initialPrice, isInverted]);

  const onChange = useCallback(
    (typed?: string) => {
      setValue(typed);
      setPercentage(null);
    },
    [setValue, setPercentage],
  );

  const onPercentageChange = useCallback(
    (percent?: string | number) => {
      setValue(undefined);
      setPercentage(BN(percent || 0).toNumber());
    },
    [setValue, setPercentage],
  );

  const selectedPercentage = useMemo(() => {
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

    return formatDecimals(result, 6, tokenDecimals);
  }, [typedValue, tokenDecimals, priceWei, isInverted]);

  const usd = useUsdAmount(isInverted ? srcUsd1Token : dstUsd1Token, amountUI || "0");

  return {
    amountWei: priceWei,
    amountUI,
    selectedPercentage,
    onChange,
    onPercentageChange,
    isInverted,
    usd,
  };
};
