import { useCallback, useMemo } from "react";
import { amountBNV2, amountUiV2, useWidgetContext } from "..";
import BN from "bignumber.js";
import { useNetwork, useSrcBalance } from "./hooks";
import { eqIgnoreCase, isNativeAddress, networks } from "@defi.org/web3-candies";
import { useFeeOnTransfer } from "./useFeeOnTransfer";

export const useShouldOnlyWrap = () => {
  const { srcToken, dstToken } = useWidgetContext();
  const network = useNetwork();

  return useMemo(() => {
    return isNativeAddress(srcToken?.address || "") && eqIgnoreCase(dstToken?.address || "", network?.wToken.address || "");
  }, [srcToken, dstToken, network]);
};

export const useShouldUnwrap = () => {
  const { srcToken, dstToken } = useWidgetContext();
  const network = useNetwork();

  return useMemo(() => {
    return eqIgnoreCase(srcToken?.address || "", network?.wToken.address || "") && isNativeAddress(dstToken?.address || "");
  }, [srcToken, dstToken, network]);
};

export const useShouldWrapOrUnwrapOnly = () => {
  const wrap = useShouldOnlyWrap();
  const unwrap = useShouldUnwrap();

  return wrap || unwrap;
};

const getMinNativeBalance = (chainId: number) => {
  switch (chainId) {
    case networks.base.id:
      return 0.0001;

    default:
      return 0.01;
  }
};

export const useDstMinAmountOut = () => {
  const {
    values: { destTokenMinAmount, destTokenMinAmountOutUI },
  } = useWidgetContext().twap;
  return {
    amount: destTokenMinAmount,
    amountUi: destTokenMinAmountOutUI,
  };
};

const getUsdAmount = (amount?: string, usd?: string | number) => {
  if (!amount || !usd || BN(amount || "0").isZero() || BN(usd || "0").isZero()) return "0";
  return BN(amount || "0")
    .times(usd)
    .toString();
};
export const useUsdAmount = () => {
  const { dstUsd, srcUsd, twap } = useWidgetContext();
  const { srcAmountUI, destTokenAmountUI } = twap.values;

  return {
    srcUsd: useMemo(() => {
      return getUsdAmount(srcAmountUI, srcUsd);
    }, [srcAmountUI, srcUsd]),
    dstUsd: useMemo(() => {
      return getUsdAmount(destTokenAmountUI, dstUsd);
    }, [destTokenAmountUI, dstUsd]),
  };
};

export const useSrcChunkAmountUsd = () => {
  const { srcUsd, srcToken, twap } = useWidgetContext();

  const srcChunksAmount = twap.values.srcChunkAmount;
  return useMemo(() => {
    if (!srcUsd) return "0";
    const res = BN(srcChunksAmount || "0")
      .times(srcUsd || 0)
      .toString();

    return amountUiV2(srcToken?.decimals, res);
  }, [srcChunksAmount, srcUsd, srcToken?.decimals]);
};

export const useToken = (isSrc?: boolean) => {
  const { srcToken, dstToken } = useWidgetContext();
  return isSrc ? srcToken : dstToken;
};

export const useMinChunkSizeUsd = () => {
  const { config } = useWidgetContext();
  return Math.max(config.minChunkSizeUsd || 0, config?.minChunkSizeUsd || 0);
};

export const useMaxPossibleChunks = () => {
  const {
    values: { maxPossibleChunks },
  } = useWidgetContext().twap;

  return maxPossibleChunks;
};

export const useMinimumDelayMinutes = () => {
  const {
    twap: { values },
  } = useWidgetContext();
  return values.estimatedDelayBetweenChunksMillis;
};

export const useNoLiquidity = () => {
  const { marketPrice, twap } = useWidgetContext();
  const srcAmount = twap.values.srcAmount;
  const outAmount = twap.values.destTokenAmount;

  return useMemo(() => {
    if (BN(srcAmount || 0).isZero()) return false;
    return BN(marketPrice || 0).isZero();
  }, [srcAmount, marketPrice, outAmount]);
};

const isEqual = (tokenA?: any, tokenB?: any) => {
  if (!tokenA || !tokenB) return false;
  return eqIgnoreCase(tokenA?.address || "", tokenB?.address || "") || eqIgnoreCase(tokenA?.symbol || "", tokenB?.symbol || "");
};

export const useTokenSelect = () => {
  const { onSrcTokenSelected, onDstTokenSelected, onSwitchTokens } = useWidgetContext();
  const { srcToken, dstToken } = useWidgetContext();
  return useCallback(
    ({ isSrc, token }: { isSrc: boolean; token: any }) => {
      if (isSrc && isEqual(token, dstToken)) {
        onSwitchTokens?.();
        return;
      }

      if (!isSrc && isEqual(token, srcToken)) {
        onSwitchTokens?.();
        return;
      }

      if (isSrc) {
        onSrcTokenSelected?.(token);
      } else {
        onDstTokenSelected?.(token);
      }
    },
    [onDstTokenSelected, onSrcTokenSelected, srcToken, dstToken, onSwitchTokens],
  );
};

// Warnigns //

export const useFeeOnTransferWarning = () => {
  const { translations: t, srcToken, dstToken } = useWidgetContext();

  const { data: srcTokenFeeOnTransfer } = useFeeOnTransfer(srcToken?.address);
  const { data: dstTokenFeeOnTransfer } = useFeeOnTransfer(dstToken?.address);

  return useMemo(() => {
    if (srcTokenFeeOnTransfer?.hasFeeOnTranfer || dstTokenFeeOnTransfer?.hasFeeOnTranfer) {
      return t.feeOnTranferWarning;
    }
  }, [srcTokenFeeOnTransfer, dstTokenFeeOnTransfer, t]);
};

export const useToggleDisclaimer = () => {
  const {
    state: { disclaimerAccepted },
    updateState,
  } = useWidgetContext();
  return useCallback(() => {
    updateState({ disclaimerAccepted: !disclaimerAccepted });
  }, [disclaimerAccepted, updateState]);
};

export const useBalanceWaning = () => {
  const { data: srcBalance } = useSrcBalance();
  const maxSrcInputAmount = useMaxSrcInputAmount();
  const { translations: t, twap } = useWidgetContext();
  const srcAmount = twap.values.srcAmount;

  return useMemo(() => {
    const isNativeTokenAndValueBiggerThanMax = maxSrcInputAmount && BN(srcAmount)?.gt(maxSrcInputAmount);

    if ((srcBalance && BN(srcAmount).gt(srcBalance)) || isNativeTokenAndValueBiggerThanMax) {
      return t.insufficientFunds;
    }
  }, [srcBalance?.toString(), srcAmount, maxSrcInputAmount?.toString(), t]);
};
export const useShouldWrap = () => {
  const { srcToken } = useWidgetContext();

  return useMemo(() => isNativeAddress(srcToken?.address || ""), [srcToken]);
};

export const useSwapPrice = () => {
  const { srcUsd, dstUsd, twap } = useWidgetContext();

  const srcAmount = twap.values.srcAmountUI;
  const outAmountUi = twap.values.destTokenAmountUI;

  const price = useMemo(() => {
    if (!outAmountUi || !srcAmount) return "0";
    return BN(outAmountUi).dividedBy(srcAmount).toString();
  }, [srcAmount, outAmountUi]);

  return {
    price,
    usd: useMemo(() => {
      if (!dstUsd || !srcUsd) return "0";
      return BN(dstUsd).multipliedBy(price).toString();
    }, [price, srcUsd, dstUsd]),
  };
};

export const useMaxSrcInputAmount = () => {
  const { srcToken, config } = useWidgetContext();
  const srcBalance = useSrcBalance().data?.toString();

  return useMemo(() => {
    if (srcBalance && isNativeAddress(srcToken?.address || "")) {
      const srcTokenMinimum = amountBNV2(srcToken?.decimals, getMinNativeBalance(config.chainId).toString());
      return BN.max(0, BN.min(BN(srcBalance).minus(srcTokenMinimum))).toString();
    }
  }, [srcToken, srcBalance, config.chainId]);
};

export const useOnSrcAmountPercent = () => {
  const { srcToken, updateState } = useWidgetContext();

  const maxAmount = useMaxSrcInputAmount();
  const srcBalance = useSrcBalance().data?.toString();
  return useCallback(
    (percent: number) => {
      if (!srcToken || !srcBalance || BN(srcBalance || 0).isZero()) return;

      const _maxAmount = maxAmount && percent === 1 && BN(maxAmount).gt(0) ? maxAmount : undefined;
      const value = amountUiV2(srcToken.decimals, _maxAmount || BN(srcBalance).times(percent).toString());
      updateState({ srcAmount: value });
    },
    [maxAmount, srcBalance, updateState, srcToken],
  );
};
