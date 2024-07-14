import { useMemo } from "react";
import { useTwapContext } from "../context/context";
import { useOutAmount, useChangeNetwork, useNoLiquidity, useShouldUnwrap, useSrcBalance, useSwapWarning, useShouldOnlyWrap, useSrcAmount } from "./hooks";
import { query } from "./query";
import BN from "bignumber.js";
import { useUnwrapToken, useWrapOnly } from "./useTransactions";
import _ from "lodash";
import { useSwapModal } from "./useSwapModal";

export const useConfirmationButton = () => {
  const { translations, lib, isWrongChain, dappProps, state, srcToken, dstToken, srcUsd, dstUsd } = useTwapContext();
  const { connect } = dappProps;
  const srcAmount = useSrcAmount().srcAmountBN.toString();
  const { swapState } = state;
  const createOrderLoading = swapState === "loading";

  const { onOpen } = useSwapModal();
  const outAmountLoading = useOutAmount().isLoading;
  const { changeNetwork, loading: changeNetworkLoading } = useChangeNetwork();
  const noLiquidity = useNoLiquidity();
  const shouldUnwrap = useShouldUnwrap();
  const nativeSymbol = lib?.config.nativeToken.symbol;
  const usdLoading = BN(srcUsd || "0").isZero();
  const { isLoading: srcBalanceLoading } = useSrcBalance();
  const warning = useSwapWarning();
  const { isLoading: srcTokenFeeLoading } = query.useFeeOnTransfer(srcToken?.address);
  const { isLoading: dstTokenFeeLoading } = query.useFeeOnTransfer(dstToken?.address);
  const shouldOnlyWrap = useShouldOnlyWrap();
  const shoouldOnlyUnwrap = useShouldUnwrap();
  const { mutate: wrap, isLoading: wrapLoading } = useWrapOnly();
  const { mutate: unwrap, isLoading: unwrapLoading } = useUnwrapToken();

  const hasWarning = useMemo(() => {
    return !_.every(warning, (value) => _.isNil(value));
  }, [warning]);

  const maker = lib?.maker;
  const disableWhileLaoding = outAmountLoading || usdLoading || srcBalanceLoading || srcTokenFeeLoading || dstTokenFeeLoading;

  return useMemo(() => {
    if (createOrderLoading) {
      return {
        text: translations.placingOrder,
        onClick: onOpen,
        loading: false,
        disabled: false,
      };
    }
    if (isWrongChain)
      return {
        text: translations.switchNetwork,
        onClick: changeNetwork,
        loading: changeNetworkLoading,
        disabled: changeNetworkLoading,
      };
    if (!maker)
      return {
        text: translations.connect,
        onClick: connect ? connect : undefined,
        loading: false,
        disabled: false,
      };

    if (hasWarning)
      return {
        text: warning.zeroSrcAmount ? warning.zeroSrcAmount : warning.balance || translations.placeOrder,
        onClick: undefined,
        disabled: true,
        loading: false,
      };
    if (disableWhileLaoding) {
      return { text: undefined, onClick: undefined, loading: true };
    }

    if (noLiquidity) {
      return {
        text: translations.noLiquidity,
        disabled: true,
        loading: false,
      };
    }

    if (shouldOnlyWrap) {
      return {
        text: translations.wrap,
        onClick: wrap,
        disabled: false,
        loading: wrapLoading,
      };
    }
    if (shouldUnwrap) {
      return {
        text: translations.unwrap,
        onClick: unwrap,
        disabled: false,
        loading: unwrapLoading,
      };
    }

    return {
      text: translations.placeOrder,
      onClick: onOpen,
      loading: false,
      disabled: false,
    };
  }, [
    createOrderLoading,
    srcAmount,
    usdLoading,
    noLiquidity,
    shouldUnwrap,
    onOpen,
    translations,
    nativeSymbol,
    changeNetwork,
    changeNetworkLoading,
    connect,
    maker,
    warning,
    isWrongChain,
    shouldOnlyWrap,
    shoouldOnlyUnwrap,
    disableWhileLaoding,
    wrap,
    wrapLoading,
    unwrap,
    unwrapLoading,
    hasWarning,
  ]);
};
