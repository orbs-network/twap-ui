import { useCallback, useMemo } from "react";
import BN from "bignumber.js";
import { useSwapModal } from "./useSwapModal";
import { useWidgetContext } from "..";
import { useShouldOnlyWrap, useShouldUnwrap } from "./useShouldWrapOrUnwrap";
import { useSrcBalance } from "./useBalances";
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
    translations,
    connect,
    srcToken,
    dstToken,
    twap: {
      errors: { hasErrors, srcAmount: srcAmountError },
    },
    marketPrice1Token,
    state: { swapStatus },
    marketPriceLoading,
  } = useWidgetContext();

  const { onOpen } = useSwapModal();
  const switchChain = useSwitchChain();
  const shouldUnwrap = useShouldUnwrap();
  const usdLoading = BN(srcUsd1Token || "0").isZero();
  const { isLoading: srcBalanceLoading } = useSrcBalance();
  const balanceError = useBalanceWaning();
  const { feeError, isLoading: feeOnTransferLoading } = useFeeOnTransferError();

  const shouldOnlyWrap = useShouldOnlyWrap();
  const { mutate: wrap, isLoading: wrapLoading } = useWrapOnly();
  const { mutate: unwrap, isLoading: unwrapLoading } = useUnwrapToken();

  const isLoading = useMemo(() => {
    if (!srcToken || !dstToken) return false;
    return marketPriceLoading || usdLoading || srcBalanceLoading || feeOnTransferLoading || BN(marketPrice1Token || 0).isZero();
  }, [usdLoading, srcBalanceLoading, feeOnTransferLoading, marketPrice1Token, srcToken, dstToken, marketPriceLoading]);

  return useMemo(() => {
    if (isWrongChain)
      return {
        text: translations.switchNetwork,
        onClick: switchChain,
        loading: false,
        disabled: false,
      };
    if (!maker)
      return {
        text: translations.connect,
        onClick: () => {
          if (!connect) {
            alert("connect function is not defined");
          } else {
            connect();
          }
        },
        loading: false,
        disabled: false,
      };

    if (shouldOnlyWrap || shouldUnwrap) {
      return {
        text: shouldOnlyWrap ? translations.wrap : translations.unwrap,
        onClick: shouldOnlyWrap ? wrap : unwrap,
        disabled: srcAmountError?.text || balanceError || wrapLoading || unwrapLoading,
        loading: wrapLoading || unwrapLoading,
      };
    }

    return {
      text: translations.placeOrder,
      onClick: onOpen,
      loading: swapStatus === SwapStatus.LOADING || isLoading,
      disabled: Boolean(feeError) || isLoading || hasErrors || !!balanceError,
      allowClickWhileLoading: true,
    };
  }, [
    isWrongChain,
    maker,
    connect,
    isLoading,
    shouldOnlyWrap,
    wrap,
    wrapLoading,
    shouldUnwrap,
    unwrap,
    unwrapLoading,
    translations,
    onOpen,
    hasErrors,
    balanceError,
    feeError,
    srcAmountError,
    switchChain,
  ]);
};
