import { useMemo } from "react";
import BN from "bignumber.js";
import { useSwapModal } from "./useSwapModal";
import { useWidgetContext } from "..";
import { useSwitchChain } from "./useSwitchChain";
import { useShouldOnlyWrap, useShouldUnwrap } from "./useShouldWraoOrUnwrap";
import { useSrcBalance } from "./useBalances";
import { useBalanceWaning, useFeeOnTransferError } from "./useWarnings";
import { useWrapOnly } from "./useWrapToken";
import { useUnwrapToken } from "./useUnwrapToken";
import { SwapStatus } from "@orbs-network/swap-ui";

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
      errors: { hasErrors },
    },
    marketPrice,
    state: { swapStatus },
  } = useWidgetContext();

  const { onOpen } = useSwapModal();
  const { changeNetwork, loading: changeNetworkLoading } = useSwitchChain();
  const shouldUnwrap = useShouldUnwrap();
  const usdLoading = BN(srcUsd || "0").isZero();
  const { isLoading: srcBalanceLoading } = useSrcBalance();
  const balanceError = useBalanceWaning();
  const { feeError, isLoading: feeOnTransferLoading } = useFeeOnTransferError();

  const shouldOnlyWrap = useShouldOnlyWrap();
  const { mutate: wrap, isLoading: wrapLoading } = useWrapOnly();
  const { mutate: unwrap, isLoading: unwrapLoading } = useUnwrapToken();

  const isLoading = useMemo(() => {
    if (!srcToken || !dstToken) return false;
    return swapStatus === SwapStatus.LOADING || usdLoading || srcBalanceLoading || feeOnTransferLoading || BN(marketPrice || 0).isZero();
  }, [usdLoading, srcBalanceLoading, feeOnTransferLoading, marketPrice, srcToken, dstToken, swapStatus]);

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
    changeNetwork,
    changeNetworkLoading,
    onOpen,
    hasErrors,
    balanceError,
    feeError,
  ]);
};
