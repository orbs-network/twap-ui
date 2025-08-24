import { useEffect, useMemo, useRef } from "react";
import BN from "bignumber.js";
import { useTwapContext } from "../context";
import { amountBN, Module } from "@orbs-network/twap-sdk";
import { LIMIT_TRIGGER_PRICE_DELTA_PERCENTAGE, SLIPPAGE_MULTIPLIER } from "../consts";
import { useTwapStore } from "../useTwapStore";
import { formatDuration } from "../utils";
import { Token } from "../types";

export const useDefaultTriggerPricePercent = () => {
  const { slippage, module } = useTwapContext();

  return useMemo(() => {
    let result = BN(slippage).multipliedBy(SLIPPAGE_MULTIPLIER);
    result = module === Module.STOP_LOSS ? result.multipliedBy(-1) : result;
    return result.decimalPlaces(0).toNumber();
  }, [slippage, module]);
};

export const useDefaultLimitPricePercent = () => {
  const { slippage, module } = useTwapContext();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  return useMemo(() => {
    if ((module !== Module.STOP_LOSS && module !== Module.TAKE_PROFIT) || isMarketOrder) {
      return undefined;
    }
    const result = BN(slippage).multipliedBy(LIMIT_TRIGGER_PRICE_DELTA_PERCENTAGE);
    if (module === Module.STOP_LOSS) {
      return result.multipliedBy(-1).decimalPlaces(0).toNumber();
    } else {
      return Math.max(result.minus(LIMIT_TRIGGER_PRICE_DELTA_PERCENTAGE).decimalPlaces(0).toNumber(), 2);
    }
  }, [slippage, module, isMarketOrder]);
};

export const useListener = () => {
  const updateStore = useTwapStore((s) => s.updateState);
  const { module, overrides, srcToken, dstToken, callbacks } = useTwapContext();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const typedLimitPrice = useTwapStore((s) => s.state.typedLimitPrice);
  const typedTriggerPrice = useTwapStore((s) => s.state.typedTriggerPrice);
  const typedChunks = useTwapStore((s) => s.state.typedChunks);
  const typedDuration = useTwapStore((s) => s.state.typedDuration);
  const typedFillDelay = useTwapStore((s) => s.state.typedFillDelay);
  const prevSrcToken = useRef<Token | undefined>(undefined);
  const prevDstToken = useRef<Token | undefined>(undefined);
  const state = overrides?.state;
  const updatedRef = useRef(false);

  useEffect(() => {
    if (updatedRef.current) {
      updateStore({
        typedSrcAmount: state?.inputAmount,
        typedLimitPrice: state?.limitPrice,
        typedTriggerPrice: state?.triggerPrice,
        typedChunks: state?.chunks,
        typedDuration: formatDuration(state?.duration),
        typedFillDelay: formatDuration(state?.fillDelay),
        isMarketOrder: module === Module.TWAP ? state?.isMarketOrder : false,
        disclaimerAccepted: state?.disclaimerAccepted,
      });
      updatedRef.current = true;
    }
  }, [state, updateStore, module]);

  useEffect(() => {
    if (prevSrcToken.current && prevDstToken.current) {
      updateStore({ typedLimitPrice: undefined, typedTriggerPrice: undefined });
    }
    prevSrcToken.current = srcToken;
    prevDstToken.current = dstToken;
  }, [srcToken?.address, dstToken?.address, updateStore]);

  useEffect(() => {
    updateStore({ currentTime: Date.now() });
  }, [updateStore]);

  useEffect(() => {
    if (callbacks?.onInputAmountChange) {
      callbacks.onInputAmountChange(typedSrcAmount || "0", amountBN(srcToken?.decimals, typedSrcAmount || "").toString());
    }
  }, [typedSrcAmount, srcToken?.decimals, callbacks?.onInputAmountChange]);
  useEffect(() => {
    if (callbacks?.onTradePriceChange) {
      callbacks.onTradePriceChange(amountBN(srcToken?.decimals, typedLimitPrice || "").toString(), typedLimitPrice || "");
    }
  }, [typedLimitPrice, srcToken?.decimals, callbacks?.onTradePriceChange]);

  useEffect(() => {
    if (callbacks?.onDurationChange && typedDuration) {
      callbacks.onDurationChange(typedDuration.value * typedDuration.unit);
    }
  }, [typedDuration, callbacks?.onDurationChange]);

  useEffect(() => {
    if (callbacks?.onChunksChange) {
      callbacks.onChunksChange(typedChunks);
    }
  }, [typedChunks, callbacks?.onChunksChange]);

  useEffect(() => {
    if (callbacks?.onFillDelayChange && typedFillDelay) {
      callbacks.onFillDelayChange(typedFillDelay.value * typedFillDelay.unit);
    }
  }, [typedFillDelay, callbacks?.onFillDelayChange]);

  useEffect(() => {
    if (callbacks?.onTriggerPriceChange) {
      callbacks.onTriggerPriceChange(amountBN(srcToken?.decimals, typedTriggerPrice || "0").toString(), typedTriggerPrice || "");
    }
  }, [typedTriggerPrice, srcToken?.decimals, callbacks?.onTriggerPriceChange]);
};
