import { useCallback } from "react";
import { useTwapContext } from "../context/twap-context";
import { useTwapStore } from "../useTwapStore";
import { formatDecimals } from "../utils";
import { useUsdAmount, useShouldWrapOrUnwrapOnly, useAmountBN, useAmountUi } from "./helper-hooks";
import { useDstTokenAmount } from "./use-dst-amount";
import { useBalanceError } from "./use-input-errors";

const useTokenPanel = (isSrcToken: boolean, dstAmount?: string) => {
  const { marketPriceLoading, srcToken, dstToken, srcBalance, dstBalance } = useTwapContext();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const updateState = useTwapStore((s) => s.updateState);
  const { srcUsd1Token, dstUsd1Token } = useTwapContext();
  const srcUsd = useUsdAmount(typedSrcAmount, srcUsd1Token);
  const dstUsd = useUsdAmount(dstAmount, dstUsd1Token);
  const isWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();

  const token = isSrcToken ? srcToken : dstToken;
  const balance = useAmountUi(token?.decimals, isSrcToken ? srcBalance : dstBalance);
  const error = useBalanceError();

  const onChange = useCallback(
    (value: string) => {
      if (!isSrcToken) return;
      updateState({ typedSrcAmount: value });
    },
    [updateState, isSrcToken],
  );

  const onMax = useCallback(() => {
    if (!isSrcToken) return;
    updateState({ typedSrcAmount: formatDecimals(balance, 8) });
  }, [updateState, isSrcToken, balance]);

  const value = isWrapOrUnwrapOnly || isSrcToken ? typedSrcAmount : formatDecimals(dstAmount || "", 8);

  return {
    balance,
    usd: isSrcToken ? srcUsd : isWrapOrUnwrapOnly ? srcUsd : dstUsd,
    value: value || "",
    valueWei: useAmountBN(token?.decimals, value),
    onChange,
    onMax,
    isLoading: !typedSrcAmount ? false : isSrcToken ? false : marketPriceLoading,
    token,
    isInsufficientBalance: isSrcToken ? error : undefined,
  };
};

export const useSrcTokenPanel = () => useTokenPanel(true);

export const useDstTokenPanel = () => {
  const dstAmount = useDstTokenAmount().amountUI;
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  return useTokenPanel(false, typedSrcAmount ? dstAmount : "");
};

export const useTypedSrcAmount = () => {
  const updateState = useTwapStore((s) => s.updateState);
  return {
    amount: useTwapStore((s) => s.state.typedSrcAmount) || "",
    reset: useCallback(() => updateState({ typedSrcAmount: "" }), [updateState]),
  };
};
