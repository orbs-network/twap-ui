import { useCallback, useMemo } from "react";
import BN from "bignumber.js";
import { useConfirmation } from "./useConfirmation";
import { useWidgetContext } from "..";
import { useShouldOnlyWrap, useShouldUnwrap } from "./useShouldWrapOrUnwrap";
import { useBalanceWaning, useFeeOnTransferError } from "./useWarnings";
import { useWrapOnly } from "./useWrapToken";
import { useUnwrapToken } from "./useUnwrapToken";
import { SwapStatus } from "@orbs-network/swap-ui";

export const useSwitchChain = () => {
  const { config, walletClient } = useWidgetContext();

  return useCallback(() => {
    (walletClient as any)?.switchChain({ id: config.chainId });
  }, [config, walletClient]);
};

export const useConfirmationButton = () => {
  const {
    isWrongChain,
    srcUsd1Token,
    account: maker,
    translations: t,
    actions,
    srcToken,
    dstToken,
    config,
    twap: {
      errors: { hasErrors, srcAmount: srcAmountError },
    },
    marketPrice,
    state: { swapStatus, srcAmount },
    marketPriceLoading,
    srcBalance,
  } = useWidgetContext();

  const { onOpen } = useConfirmation();
  const switchChain = useSwitchChain();
  const shouldUnwrap = useShouldUnwrap();
  const usdLoading = BN(srcUsd1Token || "0").isZero();
  const srcBalanceLoading = srcBalance === undefined;
  const balanceError = useBalanceWaning();
  const { feeError, isLoading: feeOnTransferLoading } = useFeeOnTransferError();
  const { onConnect } = actions;

  const shouldOnlyWrap = useShouldOnlyWrap();
  const { mutate: wrap, isLoading: wrapLoading } = useWrapOnly();
  const { mutate: unwrap, isLoading: unwrapLoading } = useUnwrapToken();

  const isLoading = useMemo(() => {
    if (!srcToken || !dstToken) return false;
    return (marketPriceLoading && BN(srcAmount || 0).gt(0)) || usdLoading || srcBalanceLoading || feeOnTransferLoading || !config.minChunkSizeUsd;
  }, [usdLoading, srcBalanceLoading, feeOnTransferLoading, srcToken, dstToken, marketPriceLoading, srcAmount, config.minChunkSizeUsd]);

  return useMemo(() => {
    if (isWrongChain)
      return {
        text: t.switchNetwork,
        onClick: switchChain,
      };
    if (!maker)
      return {
        text: t.connect,
        onClick: () => {
          if (!onConnect) {
            alert("connect function is not defined");
          } else {
            onConnect();
          }
        },
      };

    if (shouldOnlyWrap) {
      return {
        text: t.wrap,
        onClick: wrap,
        disabled: srcAmountError?.text || balanceError || wrapLoading,
        loading: wrapLoading,
      };
    }

    if (shouldUnwrap) {
      return {
        text: t.unwrap,
        onClick: unwrap,
        disabled: srcAmountError?.text || balanceError || unwrapLoading,
        loading: unwrapLoading,
      };
    }

    const text = () => {
      if (!srcToken || !dstToken) {
        return t.enterAmount;
      }
      if (marketPriceLoading) {
        return t.outAmountLoading;
      }
      if (srcAmountError) {
        return t.enterAmount;
      }

      return t.placeOrder;
    };

    return {
      text: text(),
      onClick: onOpen,
      loading: swapStatus === SwapStatus.LOADING || isLoading,
      disabled: BN(marketPrice || 0).isZero() || Boolean(feeError) || isLoading || hasErrors || !!balanceError,
      allowClickWhileLoading: true,
    };
  }, [
    isWrongChain,
    maker,
    onConnect,
    isLoading,
    shouldOnlyWrap,
    wrap,
    wrapLoading,
    shouldUnwrap,
    unwrap,
    unwrapLoading,
    t,
    onOpen,
    hasErrors,
    balanceError,
    feeError,
    srcAmountError,
    switchChain,
    swapStatus,
    marketPriceLoading,
    marketPrice,
    srcToken,
    dstToken,
  ]);
};
