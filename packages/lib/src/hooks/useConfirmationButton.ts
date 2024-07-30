import { useMemo } from "react";
import { useTwapContext } from "../context/context";
import { query } from "./query";
import BN from "bignumber.js";
import { useUnwrapToken, useWrapOnly } from "./useTransactions";
import { useSwapModal } from "./useSwapModal";
import { isNil } from "../utils";
import { useChangeNetwork, useSrcBalance } from "./hooks";
import { useNoLiquidity, useOutAmount, useShouldOnlyWrap, useShouldUnwrap, useSwapWarning } from "./lib";

export const useConfirmationButton = (connect?: () => void) => {
  const { translations, isWrongChain, state, srcToken, dstToken, srcUsd, account } = useTwapContext();
  const { swapState } = state;
  const createOrderLoading = swapState === "loading";
  const { onOpen } = useSwapModal();
  const outAmountLoading = useOutAmount().isLoading;
  const { changeNetwork, loading: changeNetworkLoading } = useChangeNetwork();
  const noLiquidity = useNoLiquidity();
  const shouldUnwrap = useShouldUnwrap();
  const usdLoading = BN(srcUsd || "0").isZero();
  const { isLoading: srcBalanceLoading } = useSrcBalance();
  const warning = useSwapWarning();
  const { isLoading: srcTokenFeeLoading } = query.useFeeOnTransfer(srcToken?.address);
  const { isLoading: dstTokenFeeLoading } = query.useFeeOnTransfer(dstToken?.address);
  const shouldOnlyWrap = useShouldOnlyWrap();
  const { mutate: wrap, isLoading: wrapLoading } = useWrapOnly();
  const { mutate: unwrap, isLoading: unwrapLoading } = useUnwrapToken();

  const hasWarning = useMemo(() => {
    return !Object.values(warning).every((value) => value === undefined);
  }, [warning]);

  const maker = account;
  const disableWhileLaoding = outAmountLoading || usdLoading || srcBalanceLoading || srcTokenFeeLoading || dstTokenFeeLoading;

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
  if (!maker && connect)
    return {
      text: translations.connect,
      onClick: connect,
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
};
