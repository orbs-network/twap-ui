import { useCallback, useMemo } from "react";
import { amountBNV2, amountUiV2, fillDelayText, query, stateActions, SwapStep, useTwapContext } from "..";
import BN from "bignumber.js";
import { useFormatDecimals, useNetwork, useSrcBalance } from "./hooks";
import { eqIgnoreCase, isNativeAddress, maxUint256 } from "@defi.org/web3-candies";
import moment from "moment";
import * as SDK from "@orbs-network/twap-ui-sdk";
import { MIN_NATIVE_BALANCE, useAmountUi } from "@orbs-network/twap-ui-sdk";

export const useShouldWrapOrUnwrapOnly = () => {
  const wrap = useShouldOnlyWrap();
  const unwrap = useShouldUnwrap();

  return wrap || unwrap;
};

export const useDstMinAmountOut = () => {
  const { marketPrice, srcToken, dstToken, config, srcUsd } = useTwapContext();
  const { amount: srcAmount, amountUi } = useSrcAmount();

  const maxPossibleChunks = useMaxPossibleChunks();
  const chunks = SDK.useChunks(maxPossibleChunks);
  const limitPrice = SDK.useLimitPrice(marketPrice, dstToken);
  const srcChunkAmount = SDK.useSrcChunkAmount(srcAmount, chunks);
  const amount = SDK.useDstMinAmountOut(srcChunkAmount, limitPrice, srcToken, dstToken);

  return {
    amount,
    amountUi: useAmountUi(dstToken?.decimals, amount),
  };
};

export const useLimitPrice = () => {
  const { dstToken, marketPrice } = useTwapContext();

  const limitPrice =  SDK.useLimitPrice(marketPrice, dstToken);

  return {
    limitPrice,
    limitPriceUi: useAmountUi(dstToken?.decimals, limitPrice),
    isLoading: !limitPrice,
  }
};

export const useOutAmount = () => {
  const { amountUi } = useSrcAmount();
  const { dstToken } = useTwapContext();

  const limitPrice = useLimitPrice().limitPrice;
  const outAmount = SDK.useOutAmount(amountUi, limitPrice);
  return {
    amount: outAmount,
    amountUi: useAmountUi(dstToken?.decimals, outAmount),
    isLoading: amountUi && BN(outAmount || 0).isZero() ? true : false,
  };
};

const getUsdAmount = (amount?: string, usd?: string | number) => {
  if (!amount || !usd || BN(amount || "0").isZero() || BN(usd || "0").isZero()) return "0";
  return BN(amount || "0")
    .times(usd)
    .toString();
};
export const useUsdAmount = () => {
  const { amount: srcAmount } = useSrcAmount();
  const { dstToken, dstUsd, srcToken, srcUsd } = useTwapContext();
  const dstAmount = useOutAmount().amount;

  const dstUsdAmount = useMemo(() => {
    return getUsdAmount(dstAmount, dstUsd);
  }, [dstAmount, dstUsd]);

  const srcUsdAmount = useMemo(() => {
    return getUsdAmount(srcAmount, srcUsd);
  }, [srcAmount, srcUsd]);

  return {
    srcUsd: useAmountUi(srcToken?.decimals, srcUsdAmount),
    dstUsd: useAmountUi(dstToken?.decimals, dstUsdAmount),
  };
};

export const useIsPartialFillWarning = () => {
  const chunks = useChunks();
  return SDK.useIsPartialFillWarning(chunks);
};

export const useSetChunks = () => {
  return SDK.useOnChunks();
};

export const useSrcChunkAmountUsd = () => {
  const { srcToken, srcUsd } = useTwapContext();
  const srcChunksAmount = useSrcChunkAmount().amount;

  const result = SDK.useSrcChunkAmountUsd(srcChunksAmount, srcUsd);

  return useAmountUi(srcToken?.decimals, result);
};

export const useMinDuration = () => {
  const chunks = useChunks();
  return SDK.useMinDuration(chunks);
};

export const useChunks = () => {
  const maxPossibleChunks = useMaxPossibleChunks();

  return SDK.useChunks(maxPossibleChunks);
};

export const useToken = (isSrc?: boolean) => {
  const { srcToken, dstToken } = useTwapContext();
  return isSrc ? srcToken : dstToken;
};

export const useMaxPossibleChunks = () => {
  const amountUi = useSrcAmount().amountUi;
  const { config, srcUsd } = useTwapContext();

  return SDK.useMaxPossibleChunks(amountUi, srcUsd);
};

export const useSrcAmount = () => {
  const { state, srcToken } = useTwapContext();
  return useMemo(() => {
    if (!state.srcAmountUi) {
      return {
        amountUi: "",
        amount: "0",
      };
    }
    return {
      amountUi: state.srcAmountUi,
      amount: BN.min(amountBNV2(srcToken?.decimals, state.srcAmountUi), maxUint256).decimalPlaces(0).toString(),
    };
  }, [srcToken, state.srcAmountUi]);
};

export const useFillDelay = () => {
  const { translations } = useTwapContext();

  const millis = SDK.useFillDelay();

  return {
    millis,
    text: useMemo(() => fillDelayText(millis, translations), [millis, translations]),
  };
};

export const useMinimumDelayMinutes = () => {
  const { config } = useTwapContext();
  return SDK.useEstimatedDelayBetweenChunksMillis();
};

export const useNoLiquidity = () => {
  const srcAmount = useSrcAmount().amount;
  const {limitPrice} = useLimitPrice();
  const outAmount = useOutAmount().amount;

  return useMemo(() => {
    if (BN(limitPrice || 0).isZero() || BN(srcAmount || 0).isZero() || !outAmount) return false;
    return BN(outAmount || 0).isZero();
  }, [outAmount, srcAmount, limitPrice]);
};

export const useLimitPricePercentDiffFromMarket = () => {
  const {limitPrice} = useLimitPrice();
  const { marketPrice } = useTwapContext();

  return SDK.useLimitPricePercentDiffFromMarket(limitPrice, marketPrice);
};

export const useDeadline = () => {
  const { duration: durationUi } = useDuration();
  const millis = SDK.useDeadline();

  return useMemo(() => {
    return {
      millis,
      text: moment(millis).format("ll HH:mm"),
    };
  }, [durationUi, millis]);
};

export const useSrcChunkAmount = () => {
  const srcAmount = useSrcAmount().amount;
  const srcToken = useTwapContext().srcToken;

  const chunks = useChunks();
  const amount = SDK.useSrcChunkAmount(srcAmount, chunks);

  return {
    amount,
    amountUi: useFormatDecimals(useAmountUi(srcToken?.decimals, amount), 2),
  };
};

export const useShouldOnlyWrap = () => {
  const { srcToken, dstToken } = useTwapContext();
  const network = useNetwork();

  return useMemo(() => {
    return isNativeAddress(srcToken?.address || "") && eqIgnoreCase(dstToken?.address || "", network?.wToken.address || "");
  }, [srcToken, dstToken, network]);
};

export const useShouldUnwrap = () => {
  const { srcToken, dstToken } = useTwapContext();
  const network = useNetwork();

  return useMemo(() => {
    return eqIgnoreCase(srcToken?.address || "", network?.wToken.address || "") && isNativeAddress(dstToken?.address || "");
  }, [srcToken, dstToken, network]);
};

export const useSwitchTokens = () => {
  const { onSwitchTokens } = useTwapContext();
  const resetLimit = SDK.useResetLimitPrice();

  return useCallback(() => {
    onSwitchTokens?.();
    resetLimit();
  }, [resetLimit, onSwitchTokens]);
};

const isEqual = (tokenA?: any, tokenB?: any) => {
  return eqIgnoreCase(tokenA?.address || "", tokenB?.address || "") || eqIgnoreCase(tokenA?.symbol, tokenB?.symbol);
};

export const useTokenSelect = () => {
  const switchTokens = useSwitchTokens();
  const { onSrcTokenSelected, onDstTokenSelected, srcToken, dstToken } = useTwapContext();
  return useCallback(
    ({ isSrc, token }: { isSrc: boolean; token: any }) => {
      if (isSrc && isEqual(token, dstToken)) {
        switchTokens?.();
        return;
      }

      if (!isSrc && isEqual(token, srcToken)) {
        switchTokens?.();
        return;
      }

      if (isSrc) {
        onSrcTokenSelected?.(token);
      } else {
        onDstTokenSelected?.(token);
      }
    },
    [onDstTokenSelected, onSrcTokenSelected, srcToken, dstToken, switchTokens],
  );
};

// Warnigns //

export const useFillDelayWarning = () => {
  return SDK.useFillDelayWarning();
};

export const useTradeDurationWarning = () => {
  const duration = useDuration().millis;
  return SDK.useTradeDurationWarning(duration);
};

export const useFeeOnTransferWarning = () => {
  const { translations, srcToken, dstToken } = useTwapContext();
  const { data: srcTokenFeeOnTransfer } = query.useFeeOnTransfer(srcToken?.address);
  const { data: dstTokenFeeOnTransfer } = query.useFeeOnTransfer(dstToken?.address);

  return useMemo(() => {
    if (srcTokenFeeOnTransfer?.hasFeeOnTranfer || dstTokenFeeOnTransfer?.hasFeeOnTranfer) {
      return translations.feeOnTranferWarning;
    }
  }, [srcTokenFeeOnTransfer, dstTokenFeeOnTransfer, translations]);
};

export const useTradeSizeWarning = () => {
  const srcChunkAmountUsd = useSrcChunkAmountUsd();
  const chunks = useChunks();
  const srcAmount = useSrcAmount().amount;

  return SDK.useTradeSizeWarning(srcChunkAmountUsd, srcAmount, chunks);
};

const useSrcAmountWarning = () => {
  const srcAmount = useSrcAmount().amount;
  const { translations } = useTwapContext();

  return useMemo(() => {
    if (BN(srcAmount).isZero()) {
      return translations.enterAmount;
    }
  }, [srcAmount, translations]);
};

export const useBalanceWarning = () => {
  const { data: srcBalance } = useSrcBalance();
  const maxSrcInputAmount = useMaxSrcInputAmount();
  const srcAmount = useSrcAmount().amount;

  const { translations } = useTwapContext();

  return useMemo(() => {
    const isNativeTokenAndValueBiggerThanMax = maxSrcInputAmount && BN(srcAmount)?.gt(maxSrcInputAmount);

    if ((srcBalance && BN(srcAmount).gt(srcBalance)) || isNativeTokenAndValueBiggerThanMax) {
      return translations.insufficientFunds;
    }
  }, [srcBalance?.toString(), srcAmount, maxSrcInputAmount?.toString(), translations]);
};

export const useLowPriceWarning = () => {
  const { srcToken, dstToken, marketPrice } = useTwapContext();

  return SDK.useLowPriceWarning(srcToken, dstToken, marketPrice);
};

export const useSwapWarning = () => {
  const fillDelay = useFillDelayWarning();
  const feeOnTranfer = useFeeOnTransferWarning();
  const tradeSize = useTradeSizeWarning();
  const shouldWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();
  const zeroSrcAmount = useSrcAmountWarning();
  const balance = useBalanceWarning();
  const lowPrice = useLowPriceWarning();
  const duration = useTradeDurationWarning();

  if (shouldWrapOrUnwrapOnly) {
    return { balance, zeroSrcAmount };
  }

  return { tradeSize, zeroSrcAmount, fillDelay, feeOnTranfer, lowPrice, balance, duration };
};

export const useDuration = () => {
  const chunks = useChunks();

  return SDK.useDuration(chunks);
};

export const useShouldWrap = () => {
  const { srcToken } = useTwapContext();

  return useMemo(() => {
    return isNativeAddress(srcToken?.address || "");
  }, [srcToken]);
};

export const useSetSwapSteps = () => {
  const shouldWrap = useShouldWrap();
  const { data: haveAllowance } = query.useAllowance();
  const updateState = useTwapContext().updateState;
  return useCallback(() => {
    let swapSteps: SwapStep[] = [];
    if (shouldWrap) {
      swapSteps.push("wrap");
    }
    if (!haveAllowance) {
      swapSteps.push("approve");
    }
    swapSteps.push("createOrder");
    updateState({ swapSteps });
  }, [haveAllowance, shouldWrap, updateState]);
};

export const useSwapPrice = () => {
  const srcAmount = useSrcAmount().amountUi;
  const { srcUsd, dstUsd } = useTwapContext();
  const outAmountUi = useOutAmount().amountUi;
  const price = useMemo(() => {
    if (!outAmountUi || !srcAmount) return "0";
    return BN(outAmountUi).dividedBy(srcAmount).toString();
  }, [srcAmount, outAmountUi]);

  const usd = useMemo(() => {
    if (!dstUsd || !srcUsd) return "0";
    return BN(dstUsd).multipliedBy(price).toString();
  }, [price, srcUsd, dstUsd]);

  return {
    price,
    usd,
  };
};

export const useMaxSrcInputAmount = () => {
  const { srcToken } = useTwapContext();
  const srcBalance = useSrcBalance().data?.toString();

  return useMemo(() => {
    if (srcBalance && isNativeAddress(srcToken?.address || "")) {
      const srcTokenMinimum = amountBNV2(srcToken?.decimals, MIN_NATIVE_BALANCE.toString());
      return BN.max(0, BN.min(BN(srcBalance).minus(srcTokenMinimum))).toString();
    }
  }, [srcToken, srcBalance]);
};

export const useOnSrcAmountPercent = () => {
  const { srcToken } = useTwapContext();

  const setSrcAmountUi = stateActions.useSetSrcAmount();
  const maxAmount = useMaxSrcInputAmount();
  const srcBalance = useSrcBalance().data?.toString();
  return useCallback(
    (percent: number) => {
      if (!srcToken || !srcBalance) {
        return;
      }

      //max amount will be greater than zero only if the src token is native token
      const _maxAmount = maxAmount && percent === 1 && BN(maxAmount).gt(0) ? maxAmount : undefined;
      const value = amountUiV2(srcToken.decimals, _maxAmount || BN(srcBalance).times(percent).toString());
      setSrcAmountUi(value);
    },
    [srcToken, maxAmount, srcBalance, setSrcAmountUi],
  );
};

export const useSwapData = () => {
  const srcAmount = useSrcAmount();
  const amountUsd = useUsdAmount();
  const outAmount = useOutAmount();
  const deadline = useDeadline();
  const srcChunkAmount = useSrcChunkAmount();
  const dstMinAmount = useDstMinAmountOut();

  const fillDelay = useFillDelay();
  const chunks = useChunks();
  const { srcToken, dstToken } = useTwapContext();

  return {
    srcAmount,
    amountUsd,
    outAmount,
    deadline,
    srcChunkAmount,
    dstMinAmount,
    fillDelay,
    chunks,
    srcToken,
    dstToken,
  };
};
