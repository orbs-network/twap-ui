import { useCallback, useMemo } from "react";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { formatDecimals } from "../utils";
import { useAmountUi, useUsdAmount, useShouldWrapOrUnwrapOnly, useAmountBN } from "./helper-hooks";
import { useMaxSrcAmount } from "./use-src-amount";
import BN from "bignumber.js";
import { InputErrors } from "../types";

export const useTokenPanel = ({ isSrcToken, dstAmount }: { isSrcToken: boolean; dstAmount: string }) => {
  const { marketPriceLoading, srcToken, dstToken, srcBalance, dstBalance, translations: t } = useTwapContext();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const updateState = useTwapStore((s) => s.updateState);
  const { srcUsd1Token, dstUsd1Token } = useTwapContext();
  const srcUsd = useUsdAmount(typedSrcAmount, srcUsd1Token);
  const dstUsd = useUsdAmount(dstAmount, dstUsd1Token);
  const isWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();
  const maxSrcInputAmount = useMaxSrcAmount();
  const srcAmountWei = useAmountBN(srcToken?.decimals, typedSrcAmount);

  const token = isSrcToken ? srcToken : dstToken;
  const balance = useAmountUi(token?.decimals, isSrcToken ? srcBalance : dstBalance);
  const error = useMemo(() => {
    const isNativeTokenAndValueBiggerThanMax = maxSrcInputAmount && BN(srcAmountWei)?.gt(maxSrcInputAmount);

    if ((srcBalance && BN(srcAmountWei).gt(srcBalance)) || isNativeTokenAndValueBiggerThanMax) {
      return {
        type: InputErrors.INSUFFICIENT_BALANCE,
        message: t.insufficientFunds,
        value: srcBalance,
      };
    }
  }, [srcBalance?.toString(), srcAmountWei, maxSrcInputAmount?.toString(), t]);

  const onChange = useCallback(
    (value: string) => {
      if (!isSrcToken) return;
      updateState({ typedSrcAmount: value });
    },
    [updateState, isSrcToken],
  );

  return {
    balance,
    usd: isSrcToken ? srcUsd : isWrapOrUnwrapOnly ? srcUsd : dstUsd,
    value: isWrapOrUnwrapOnly || isSrcToken ? typedSrcAmount : formatDecimals(dstAmount, 8),
    onChange,
    isLoading: isSrcToken ? false : marketPriceLoading,
    token,
    isInsufficientBalance: isSrcToken ? error : undefined,
  };
};
