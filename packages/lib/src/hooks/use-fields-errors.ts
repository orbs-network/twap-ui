import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import BN from "bignumber.js";
import { useTriggerPrice } from "./use-trigger-price";
import { useChunks } from "./use-chunks";
import { useFillDelay } from "./use-fill-delay";
import { useSrcChunkAmount } from "./use-src-chunk-amount";
import { useLimitPrice } from "./use-limit-price";
import { useDuration } from "./use-duration";

export const useFieldsErrors = () => {
  const { marketPrice } = useTwapContext();
  const srcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const chunksError = useChunks().error;
  const fillDelayError = useFillDelay().error;
  const orderDurationError = useDuration().error;
  const srcChunkAmountError = useSrcChunkAmount().error;
  const limitPriceError = useLimitPrice().error;
  const triggerPriceError = useTriggerPrice().error;
  if (BN(marketPrice || 0).isZero() || BN(srcAmount || 0).isZero()) return;

  return triggerPriceError || limitPriceError || chunksError || fillDelayError || srcChunkAmountError || orderDurationError;
};
