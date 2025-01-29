import { useMemo } from "react";
import { useWidgetContext } from "../context/context";
import { query } from "./query";
import BN from "bignumber.js";
import { useUnwrapToken, useWrapOnly } from "./useTransactions";
import { useSwapModal } from "./useSwapModal";
import { useChangeNetwork, useSrcBalance } from "./hooks";
import { useShouldOnlyWrap, useShouldUnwrap } from "./lib";

export const useConfirmationButton = () => {
  const {
    isWrongChain,
    srcUsd,
    account: maker,
    translations,
    connect,
    srcToken,
    dstToken,
    twap: {
      errors: { hasErros },
    },
  } = useWidgetContext();
  const { onOpen } = useSwapModal();
  const { changeNetwork, loading: changeNetworkLoading } = useChangeNetwork();
  const shouldUnwrap = useShouldUnwrap();
  const usdLoading = BN(srcUsd || "0").isZero();
  const { isLoading: srcBalanceLoading } = useSrcBalance();
  const { isLoading: srcTokenFeeLoading } = query.useFeeOnTransfer(srcToken?.address);
  const { isLoading: dstTokenFeeLoading } = query.useFeeOnTransfer(dstToken?.address);
  const shouldOnlyWrap = useShouldOnlyWrap();
  const { mutate: wrap, isLoading: wrapLoading } = useWrapOnly();
  const { mutate: unwrap, isLoading: unwrapLoading } = useUnwrapToken();

  const isLoading = usdLoading || srcBalanceLoading || srcTokenFeeLoading || dstTokenFeeLoading;

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
        disabled: false,
        loading: wrapLoading || unwrapLoading,
      };
    }

    return {
      text: translations.placeOrder,
      onClick: onOpen,
      loading: isLoading,
      disabled: isLoading || hasErros,
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
    changeNetwork,
    changeNetworkLoading,
    onOpen,
    hasErros,
  ]);
};
