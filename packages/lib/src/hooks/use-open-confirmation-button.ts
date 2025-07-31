import { SwapStatus } from "@orbs-network/swap-ui";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { useShouldUnwrap, useShouldOnlyWrap } from "./helper-hooks";
import { useBalanceError } from "./use-balance-error";
import { useOnOpenConfirmationModal } from "./use-confirmation";
import { useFieldsErrors } from "./use-fields-errors";
import { useMinChunkSizeUsd } from "./use-min-chunk-size-usd";
import { useUnwrapToken } from "./use-unwrap";
import { useWrapOnly } from "./use-wrap-only";
import BN from "bignumber.js";

export const useOnOpenConfirmationButton = () => {
  const { srcUsd1Token, translations: t, marketPrice, marketPriceLoading, srcBalance, srcToken, dstToken, noLiquidity, account } = useTwapContext();

  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const swapStatus = useTwapStore((s) => s.state.swapStatus);

  const minChunkSizeUsd = useMinChunkSizeUsd();
  const balanceError = useBalanceError();
  const inputsError = useFieldsErrors();
  const disabled = Boolean(balanceError || inputsError);

  const onOpen = useOnOpenConfirmationModal();
  const shouldUnwrap = useShouldUnwrap();
  const shouldOnlyWrap = useShouldOnlyWrap();

  const { mutate: wrap, isLoading: wrapLoading } = useWrapOnly();
  const { mutate: unwrap, isLoading: unwrapLoading } = useUnwrapToken();

  const zeroSrcAmount = BN(typedSrcAmount || "0").isZero();
  const zeroMarketPrice = !BN(marketPrice || 0).gt(0);

  const isPropsLoading = marketPriceLoading || BN(srcUsd1Token || "0").isZero() || srcBalance === undefined || !minChunkSizeUsd;

  const isButtonLoading = Boolean(srcToken && dstToken && typedSrcAmount && isPropsLoading);

  const makeButton = (text: string, onClick: () => void, loading = false, disabled = false) => ({ text, onClick, loading, disabled });

  // Handle no liquidity

  if (noLiquidity) {
    return makeButton(t.noLiquidity, () => {}, false, true);
  }

  if (!account || !srcToken || !dstToken) {
    return makeButton(t.placeOrder, () => {}, false, true);
  }

  // Handle wrap only
  if (shouldOnlyWrap) {
    return makeButton(t.wrap, () => wrap(), wrapLoading, wrapLoading);
  }

  // Handle unwrap
  if (shouldUnwrap) {
    return makeButton(t.unwrap, () => unwrap(), unwrapLoading, disabled || unwrapLoading);
  }

  // Default swap button
  const getSwapText = () => {
    if (!srcToken || !dstToken) return t.placeOrder;
    if (BN(typedSrcAmount || "0").isZero()) return t.enterAmount;
    if (marketPriceLoading) return t.outAmountLoading;
    if (isButtonLoading) return t.placeOrder;
    if (balanceError) return balanceError;
    return t.placeOrder;
  };

  const swapButton = makeButton(
    getSwapText(),
    onOpen,
    isButtonLoading,
    Boolean(swapStatus !== SwapStatus.LOADING && (zeroMarketPrice || isButtonLoading || disabled || zeroSrcAmount)),
  );

  return swapButton;
};
