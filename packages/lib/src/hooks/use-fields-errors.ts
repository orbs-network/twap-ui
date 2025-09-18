import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import BN from "bignumber.js";
import { useTriggerPriceError } from "./use-trigger-price";
import { useChunksError } from "./use-chunks";
import { useFillDelayError } from "./use-fill-delay";
import { useLimitPriceError } from "./use-limit-price";
import { useDurationError } from "./use-duration";
import { useBalanceError } from "./use-balance-error";

export const useFieldsErrors = () => {
  const { marketPrice } = useTwapContext();
  const srcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const chunksError = useChunksError();
  const fillDelayError = useFillDelayError();
  const orderDurationError = useDurationError();
  const limitPriceError = useLimitPriceError();
  const triggerPriceError = useTriggerPriceError();
  const balanceError = useBalanceError();

  if (BN(marketPrice || 0).isZero() || BN(srcAmount || 0).isZero()) return;

  return balanceError || triggerPriceError || limitPriceError || chunksError || fillDelayError || orderDurationError;
};
