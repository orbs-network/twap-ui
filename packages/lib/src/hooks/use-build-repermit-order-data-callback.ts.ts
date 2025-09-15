import { useCallback } from "react";
import { useTwapContext } from "../context";
import { useSrcAmount } from "./use-src-amount";
import { useDeadline } from "./use-deadline";
import { useSrcChunkAmount } from "./use-src-chunk-amount";
import { useDstMinAmountPerChunk } from "./use-dst-min-amount-out-per-chunk";
import { useFillDelay } from "./use-fill-delay";
import { useTriggerAmountPerChunk } from "./use-trigger-amount-per-chunk";
import { buildRePermitOrderData, getNetwork, isNativeAddress } from "@orbs-network/twap-sdk";

export const useBuildRePermitOrderDataCallback = () => {
  const { srcToken, dstToken, chainId, account, slippage: _slippage, config } = useTwapContext();
  const srcAmountWei = useSrcAmount().amountWei;
  const srcChunkAmount = useSrcChunkAmount().amountWei;
  const deadlineMillis = useDeadline();
  const { amountWei: triggerAmountPerChunk } = useTriggerAmountPerChunk();
  const dstMinAmountPerChunk = useDstMinAmountPerChunk().amountWei;
  const fillDelay = useFillDelay().fillDelay;
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
      exchangeAddress: config.exchangeAddress,
    });
  }, [srcToken, dstToken, chainId, account, srcAmountWei, deadlineMillis, srcChunkAmount, triggerAmountPerChunk, slippage, dstMinAmountPerChunk, fillDelay, config]);
};
