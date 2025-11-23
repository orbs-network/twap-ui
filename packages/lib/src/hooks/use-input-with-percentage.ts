import { amountBN, amountUi } from "@orbs-network/twap-sdk";
import { useMemo, useCallback } from "react";
import BN from "bignumber.js";
import { useTwapContext } from "../context/twap-context";
import { formatDecimals } from "../utils";
import { useUsdAmount } from "./helper-hooks";
import { useInvertTradePanel } from "./use-invert-trade-panel";

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
  percentage?: string | null;
  setValue: (value?: string) => void;
  setPercentage: (percentage?: string | null) => void;
}) => {
  const { srcUsd1Token, dstUsd1Token } = useTwapContext();
  const { isInverted } = useInvertTradePanel();
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
    (percent?: string) => {
      setValue(undefined);
      setPercentage(percent);
    },
    [setValue, setPercentage],
  );

  const selectedPercentage = useMemo(() => {
    if (!initialPrice || BN(initialPrice).isZero()) return "";

    if (percentage !== undefined && percentage !== null) {
      return percentage;
    }

    if (priceWei) {
      const base = BN(initialPrice);
      const diff = BN(priceWei).minus(base).div(base).multipliedBy(100);
      const result = diff.decimalPlaces(2).toString();
      return BN(result || "0").isZero() ? "" : result;
    }

    return "";
  }, [priceWei, initialPrice, percentage]);

  const amountUI = useMemo(() => {
    let result = "";
    if (typedValue !== undefined) {
      result = typedValue;
    } else {
      const amount = amountUi(tokenDecimals, priceWei);
      if (BN(amount || "0").isZero()) {
        return "";
      }

      result = isInverted ? BN(1).div(amount).toFixed() : amount;
    }

    return formatDecimals(result, 6, tokenDecimals);
  }, [typedValue, tokenDecimals, priceWei, isInverted]);

  const usd = useUsdAmount(isInverted ? srcUsd1Token : dstUsd1Token, amountUI || "0");

  return {
    amountWei: BN(priceWei).isNaN() ? "" : priceWei,
    amountUI: BN(amountUI).isNaN() ? "" : amountUI,
    selectedPercentage,
    onChange,
    onPercentageChange,
    isInverted,
    usd: BN(usd).isNaN() ? "" : usd,
  };
};
