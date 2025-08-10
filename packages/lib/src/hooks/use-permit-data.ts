import { useMemo } from "react";
import { useTwapContext } from "../context";
import { useSrcAmount } from "./use-src-amount";
import { useDeadline } from "./use-deadline";
import { useSrcChunkAmount } from "./use-src-chunk-amount";
import { useDstMinAmountPerChunk } from "./use-dst-min-amount-out-per-chunk";
import { useFillDelay } from "./use-fill-delay";
import { useTriggerAmountPerChunk } from "./use-trigger-amount-per-chunk";

export const usePermitData = () => {
  const { srcToken, dstToken, chainId, account, slippage: _slippage, twapSDK } = useTwapContext();
  const srcAmountWei = useSrcAmount().amountWei;
  const srcChunkAmount = useSrcChunkAmount().amountWei;
  const deadlineMillis = useDeadline();
  const { amountWei: triggerAmountPerChunk } = useTriggerAmountPerChunk();
  const dstMinAmountPerChunk = useDstMinAmountPerChunk().amountWei;
  const fillDelay = useFillDelay().fillDelay;
  const slippage = _slippage * 100;

  return useMemo(() => {
    if (!srcToken || !dstToken || !chainId || !account || !deadlineMillis || !srcAmountWei) return;
    return twapSDK.getPermitData({
      chainId,
      srcToken: srcToken.address,
      dstToken: dstToken.address,
      srcAmount: srcAmountWei,
      deadlineMilliseconds: deadlineMillis,
      fillDelayMillis: fillDelay.unit * fillDelay.value,
      slippage,
      account,
      srcAmountPerChunk: srcChunkAmount,
      dstMinAmountPerChunk,
      triggerAmountPerChunk,
    });
  }, [srcToken, dstToken, chainId, account, srcAmountWei, deadlineMillis, srcChunkAmount, triggerAmountPerChunk, slippage, dstMinAmountPerChunk]);
};
