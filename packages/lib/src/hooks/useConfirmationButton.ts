import { useCallback, useMemo } from "react";
import BN from "bignumber.js";
import { useConfirmationModal } from "./useConfirmationModal";
import { useWidgetContext } from "..";
import { useShouldOnlyWrap, useShouldUnwrap } from "./useShouldWrapOrUnwrap";
import { useBalanceWaning } from "./useWarnings";
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
    twap: { errors },
    marketPrice,
    state: { swapStatus, typedSrcAmount },
    marketPriceLoading,
    srcBalance,
  } = useWidgetContext();

  const { onOpen } = useConfirmationModal();
  const switchChain = useSwitchChain();
  const shouldUnwrap = useShouldUnwrap();
  const usdLoading = BN(srcUsd1Token || "0").isZero();
  const srcBalanceLoading = srcBalance === undefined;
  const balanceError = useBalanceWaning();
  const { onConnect } = actions;
  const hasErrors = Object.values(errors).some((it) => it);

  const shouldOnlyWrap = useShouldOnlyWrap();
  const { mutate: wrap, isLoading: wrapLoading } = useWrapOnly();
  const { mutate: unwrap, isLoading: unwrapLoading } = useUnwrapToken();
  const zeroSrcAmount = BN(typedSrcAmount || "0").isZero();
  const zeroMarketPrice = BN(marketPrice || 0).isZero();

  const isLoading = useMemo(() => {
    if (!srcToken || !dstToken || !typedSrcAmount || BN(typedSrcAmount).isZero()) return false;
    return marketPriceLoading || usdLoading || srcBalanceLoading;
  }, [usdLoading, srcBalanceLoading, srcToken, dstToken, marketPriceLoading, typedSrcAmount]);

  const connect = useMemo(() => {
    if (maker) return;

    return {
      text: t.connect,
      disabled: false,
      loading: false,
      onClick: () => {
        if (!onConnect) {
          alert("connect function is not defined");
        } else {
          onConnect();
        }
      },
    };
  }, [maker, onConnect, t]);

  const invalidChain = useMemo(() => {
    if (!isWrongChain) return;
    return {
      text: t.switchNetwork,
      onClick: switchChain,
      disabled: false,
      loading: false,
    };
  }, [isWrongChain, t, switchChain]);

  const wrapOnly = useMemo(() => {
    if (!shouldOnlyWrap) return;

    return {
      text: t.wrap,
      onClick: wrap,
      disabled: zeroSrcAmount || balanceError || wrapLoading,
      loading: wrapLoading,
    };
  }, [shouldOnlyWrap, wrap, zeroSrcAmount, balanceError, wrapLoading, t]);

  const unwrapOnly = useMemo(() => {
    if (!shouldUnwrap) return;

    return {
      text: t.unwrap,
      onClick: unwrap,
      disabled: zeroSrcAmount || balanceError || unwrapLoading,
      loading: unwrapLoading,
    };
  }, [shouldUnwrap, unwrap, zeroSrcAmount, balanceError, unwrapLoading, t]);

  const swap = useMemo(() => {
    const text = () => {
      if (zeroSrcAmount) return t.enterAmount;
      if (marketPriceLoading) return t.outAmountLoading;
      return t.placeOrder;
    };

    return {
      text: text(),
      onClick: onOpen,
      loading: swapStatus === SwapStatus.LOADING || isLoading,
      disabled: swapStatus === SwapStatus.LOADING ? false : zeroMarketPrice || isLoading || hasErrors || balanceError,
    };
  }, [marketPriceLoading, zeroSrcAmount, t, onOpen, swapStatus, isLoading, zeroMarketPrice, hasErrors, balanceError]);

  return connect || invalidChain || wrapOnly || unwrapOnly || swap;
};
