import { useCallback } from "react";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { formatDecimals } from "../utils";
import { useAmountUi, useUsdAmount, useShouldWrapOrUnwrapOnly } from "./helper-hooks";
import { useBalanceError } from "./use-balance-error";
import { useDstAmount } from "./use-dst-amount";

export const useTokenBalance = ({ isSrcToken }: { isSrcToken: boolean }) => {
  const { srcBalance, dstBalance } = useTwapContext();
  const token = useToken({ isSrcToken });
  return useAmountUi(token?.decimals, isSrcToken ? srcBalance : dstBalance);
};

export const useTokenUSD = ({ isSrcToken }: { isSrcToken: boolean }) => {
  const { srcUsd1Token, dstUsd1Token } = useTwapContext();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const dstAmountOut = useDstAmount().amountUI;
  const srcUsd = useUsdAmount(typedSrcAmount, srcUsd1Token);
  const dstUsd = useUsdAmount(dstAmountOut, dstUsd1Token);

  const token = useToken({ isSrcToken });
  const isWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();
  const data = isSrcToken ? srcUsd : isWrapOrUnwrapOnly ? srcUsd : dstUsd;

  return {
    data: isSrcToken ? srcUsd : isWrapOrUnwrapOnly ? srcUsd : dstUsd,
    isLoading: Boolean(token && !data),
  };
};

export const useTokenInput = ({ isSrcToken }: { isSrcToken: boolean }) => {
  const { marketPriceLoading } = useTwapContext();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const updateState = useTwapStore((s) => s.updateState);
  const destTokenAmountUI = useDstAmount().amountUI;
  const isWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();

  const onChange = useCallback(
    (value: string) => {
      if (!isSrcToken) return;
      updateState({ typedSrcAmount: value });
    },
    [updateState, isSrcToken],
  );
  return {
    value: isWrapOrUnwrapOnly || isSrcToken ? typedSrcAmount : formatDecimals(destTokenAmountUI, 8),
    onChange,
    isLoading: isSrcToken ? false : marketPriceLoading,
  };
};
export const useToken = ({ isSrcToken }: { isSrcToken: boolean }) => {
  const { srcToken, dstToken } = useTwapContext();
  return isSrcToken ? srcToken : dstToken;
};

export const useTokenPanel = ({ isSrcToken }: { isSrcToken: boolean }) => {
  const { marketPriceLoading } = useTwapContext();
  return {
    balance: useTokenBalance({ isSrcToken }),
    usd: useTokenUSD({ isSrcToken }),
    input: useTokenInput({ isSrcToken }),
    token: useToken({ isSrcToken }),
    error: useBalanceError(),
    isLoading: isSrcToken ? false : marketPriceLoading,
  };
};
