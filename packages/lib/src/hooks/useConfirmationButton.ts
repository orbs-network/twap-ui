import { useCallback, useMemo } from "react";
import { useTwapContext } from "../context";
import {
  useOutAmount,
  useChangeNetwork,
  useNoLiquidity,
  useShouldUnwrap,
  useSrcUsd,
  useDstUsd,
  useSrcBalance,
  useSwapWarning,
  useShouldOnlyWrap,
  useConfirmationModal,
} from "./hooks";
import { query } from "./query";
import { useTwapStore } from "../store";
import BN from "bignumber.js";
import { useUnwrapToken, useWrapOnly, useWrapToken } from "./useTransactions";
import _ from "lodash";

export const useConfirmationButton = () => {
  const { translations, lib, isWrongChain, connect } = useTwapContext();
  const { createOrderLoading, srcAmount, srcToken, dstToken } = useTwapStore((s) => ({
    createOrderLoading: s.swapState === "loading",
    srcAmount: s.getSrcAmount().toString(),
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));
  const { onOpen } = useConfirmationModal();
  const outAmountLoading = useOutAmount().isLoading;
  const { changeNetwork, loading: changeNetworkLoading } = useChangeNetwork();
  const noLiquidity = useNoLiquidity();
  const shouldUnwrap = useShouldUnwrap();
  const srcUsd = useSrcUsd().value;
  const dstUsd = useDstUsd().value;
  const nativeSymbol = lib?.config.nativeToken.symbol;
  const usdLoading = useMemo(() => BN(srcUsd || "0").isZero() || BN(dstUsd || "0").isZero(), [srcUsd.toString(), dstUsd.toString()]);
  const { isLoading: srcBalanceLoading } = useSrcBalance();
  query.useAllowance();
  const warning = useSwapWarning();
  const { isLoading: srcTokenFeeLoading } = query.useFeeOnTransfer(srcToken?.address);
  const { isLoading: dstTokenFeeLoading } = query.useFeeOnTransfer(dstToken?.address);
  const shouldOnlyWrap = useShouldOnlyWrap();
  const shoouldOnlyUnwrap = useShouldUnwrap();
  const { mutate: wrap, isLoading: wrapLoading } = useWrapOnly();
  const { mutate: unwrap, isLoading: unwrapLoading } = useUnwrapToken();
  console.log(warning);

  const hasWarning = useMemo(() => {
    return !_.every(warning, (value) => _.isNil(value));
  }, [warning]);

  const maker = lib?.maker;
  const disableWhileLaoding = outAmountLoading || usdLoading || srcBalanceLoading || srcTokenFeeLoading || dstTokenFeeLoading;

  return useMemo(() => {
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
      text: createOrderLoading ? translations.placeOrder : translations.placeOrder,
      onClick: onOpen,
      loading: createOrderLoading,
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
