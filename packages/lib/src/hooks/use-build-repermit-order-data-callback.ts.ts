import { useCallback } from "react";
import { useTwapContext } from "../context";
import { useDeadline } from "./use-deadline";
import { useFillDelay } from "./use-fill-delay";
import { buildRePermitOrderData, getNetwork, isNativeAddress } from "@orbs-network/twap-sdk";

import { useDstMinAmountPerTrade } from "./use-dst-amount";
import { useSrcAmount } from "./use-src-amount";
import { useTriggerPrice } from "./use-trigger-price";
import { useTrades } from "./use-trades";
import { useLimitPrice } from "./use-limit-price";

export const useBuildRePermitOrderDataCallback = () => {
  const { srcToken, dstToken, chainId, account, slippage: _slippage, config } = useTwapContext();
  const srcChunkAmount = useTrades().amountPerTradeWei;
  const srcAmountWei = useSrcAmount().amountWei;
  const deadlineMillis = useDeadline();
  const triggerAmountPerChunk = useTriggerPrice().amountPerTradeWei;
  const dstMinAmountPerChunk = useDstMinAmountPerTrade().amountWei;
  const fillDelay = useFillDelay().fillDelay;
  const limitAmountPerChunk = useLimitPrice().amountWei;
  const slippage = _slippage * 100;

  return useCallback(() => {
    const srcTokenAddress = isNativeAddress(srcToken?.address || "") ? getNetwork(chainId)?.wToken.address : srcToken?.address;

    if (!srcTokenAddress || !dstToken || !chainId || !account || !deadlineMillis || !srcAmountWei) {
      throw new Error("buildRePermitOrderData missing required parameters");
    }
    return buildRePermitOrderData({
      chainId,
      srcToken: srcTokenAddress,
      dstToken: dstToken.address,
      srcAmount: srcAmountWei,
      deadlineMilliseconds: deadlineMillis,
      fillDelayMillis: fillDelay.unit * fillDelay.value,
      slippage,
      account,
      srcAmountPerChunk: srcChunkAmount,
      dstMinAmountPerChunk,
      triggerAmountPerChunk,
      limitAmountPerChunk,
    });
  }, [
    srcToken,
    dstToken,
    chainId,
    account,
    srcAmountWei,
    deadlineMillis,
    srcChunkAmount,
    triggerAmountPerChunk,
    slippage,
    dstMinAmountPerChunk,
    fillDelay,
    config,
    limitAmountPerChunk,
  ]);
};
