import React, { useMemo } from "react";
import { Button } from "../../components/base";
import { SwapStatus } from "@orbs-network/swap-ui";
import { useTwapContext } from "../../context";
import { useMinChunkSizeUsd, useOnOpenConfirmationModal, useSwitchChain, useShouldUnwrap, useShouldOnlyWrap, useBalanceError, useError } from "../../hooks/logic-hooks";
import { useWrapOnly, useUnwrapToken } from "../../hooks/send-transactions-hooks";
import { useTwapStore } from "../../useTwapStore";
import BN from "bignumber.js";

export const useConfirmationButtonPanel = () => {
  const { isWrongChain, srcUsd1Token, account: maker, translations: t, callbacks, marketPrice, marketPriceLoading, srcBalance, srcToken, dstToken } = useTwapContext();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const swapStatus = useTwapStore((s) => s.state.swapStatus);
  const minChunkSizeUsd = useMinChunkSizeUsd();
  const balanceError = useBalanceError();
  const disabled = useError();

  const onOpen = useOnOpenConfirmationModal();
  const onConnect = callbacks?.onConnect;
  const switchChain = useSwitchChain();
  const shouldUnwrap = useShouldUnwrap();
  const shouldOnlyWrap = useShouldOnlyWrap();
  const { mutate: wrap, isLoading: wrapLoading } = useWrapOnly();
  const { mutate: unwrap, isLoading: unwrapLoading } = useUnwrapToken();
  const zeroSrcAmount = BN(typedSrcAmount || "0").isZero();
  const zeroMarketPrice = !BN(marketPrice || 0).gt(0);
  const isPropsLoading = marketPriceLoading || BN(srcUsd1Token || "0").isZero() || srcBalance === undefined || !minChunkSizeUsd;
  const isButtonLoading = !srcToken || !dstToken || !typedSrcAmount ? false : isPropsLoading;

  const noLiquidity = useMemo(() => {
    const result = srcToken && dstToken && !isButtonLoading && !marketPriceLoading && zeroMarketPrice;
    if (!result) return;
    return {
      text: t.noLiquidity,
      disabled: true,
      loading: false,
      onClick: () => {},
    };
  }, [t, isButtonLoading, marketPriceLoading, zeroMarketPrice, srcToken, dstToken]);

  const connect = useMemo(() => {
    if (maker) return;

    return {
      text: t.connect,
      disabled: false,
      loading: false,
      onClick: () => {
        if (onConnect) {
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
      onClick: () => wrap,
      disabled: Boolean(wrapLoading),
      loading: wrapLoading,
    };
  }, [shouldOnlyWrap, wrap, wrapLoading, t]);

  const unwrapOnly = useMemo(() => {
    if (!shouldUnwrap) return;

    return {
      text: t.unwrap,
      onClick: () => unwrap(),
      disabled: Boolean(disabled || unwrapLoading),
      loading: unwrapLoading,
    };
  }, [shouldUnwrap, unwrap, disabled, unwrapLoading, t]);

  const swap = useMemo(() => {
    return {
      text:
        !srcToken || !dstToken
          ? t.placeOrder
          : !typedSrcAmount
            ? t.enterAmount
            : marketPriceLoading
              ? t.outAmountLoading
              : isButtonLoading
                ? t.placeOrder
                : balanceError
                  ? balanceError
                  : t.placeOrder,
      onClick: onOpen,
      loading: isButtonLoading,
      disabled: Boolean(swapStatus === SwapStatus.LOADING ? false : zeroMarketPrice || isButtonLoading || disabled),
    };
  }, [marketPriceLoading, zeroSrcAmount, t, onOpen, swapStatus, isButtonLoading, zeroMarketPrice, disabled, srcToken, dstToken, typedSrcAmount, balanceError]);

  return connect || invalidChain || wrapOnly || unwrapOnly || noLiquidity || swap;
};

export const ShowConfirmationButton = ({ className = "" }: { className?: string }) => {
  const args = useConfirmationButtonPanel();

  return (
    <Button className={`twap-submit-button ${className}`} onClick={args.onClick} disabled={args.disabled} loading={args.loading}>
      {args.text}
    </Button>
  );
};
