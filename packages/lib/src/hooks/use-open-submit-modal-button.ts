import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { useFieldsErrors } from "./use-fields-errors";
import { useMinChunkSizeUsd } from "./use-min-chunk-size-usd";
import BN from "bignumber.js";
import { InputErrors } from "../types";
import { useMemo } from "react";

export const useOpenSubmitModalButton = () => {
  const { srcUsd1Token, translations: t, marketPriceLoading, srcBalance, srcToken, dstToken, noLiquidity } = useTwapContext();

  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const minChunkSizeUsd = useMinChunkSizeUsd();
  const inputsError = useFieldsErrors();

  const isPropsLoading = marketPriceLoading || BN(srcUsd1Token || "0").isZero() || srcBalance === undefined || !minChunkSizeUsd;
  const isLoading = Boolean(srcToken && dstToken && typedSrcAmount && isPropsLoading);
  const disabled = Boolean(inputsError || noLiquidity || isLoading);

  const text = useMemo(() => {
    if (noLiquidity) {
      return t.noLiquidity;
    }
    if (BN(typedSrcAmount || "0").isZero()) {
      return t.enterAmount;
    }
    if (inputsError?.type === InputErrors.INSUFFICIENT_BALANCE) {
      return t.insufficientFunds;
    }
    return t.placeOrder;
  }, [inputsError, t, typedSrcAmount, noLiquidity]);

  return {
    disabled,
    isLoading,
    text,
  };
};
