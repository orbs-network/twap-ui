import { useMemo } from "react";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { useChunks } from "./use-chunks";
import { useSrcChunkAmount } from "./use-src-chunk-amount";
import { useFormatNumber } from "./useFormatNumber";
import BN from "bignumber.js";
import { Module } from "@orbs-network/twap-sdk";
import { ORBS_WEBSITE_URL } from "../consts";

export const useDisclaimerMessage = () => {
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const { translations: t } = useTwapContext();
  return useMemo(() => {
    return {
      type: isMarketOrder ? "market" : "limit",
      text: isMarketOrder ? t.marketOrderWarning : t.limitPriceMessage,
      url: "https://www.orbs.com/dtwap-and-dlimit-faq/",
    };
  }, [isMarketOrder, t]);
};

export const useChunkSizeMessage = () => {
  const { usd: chunkSize, amountUI: amountUI, error: chunkSizeError } = useSrcChunkAmount();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const { chunks } = useChunks();
  const error = !typedSrcAmount ? false : chunkSizeError;
  const amountUIF = useFormatNumber({ value: amountUI, decimalScale: 3 });
  const chunkSizeF = useFormatNumber({ value: chunkSize, decimalScale: 2 });
  const { srcToken, isLimitPanel } = useTwapContext();
  const isZero = isLimitPanel || !srcToken || BN(amountUI || 0).eq(0) || BN(chunkSize || 0).eq(0) || !chunks;
  return {
    hide: isLimitPanel || !srcToken,
    tokenAmount: isZero ? "0" : amountUIF,
    usdAmount: isZero ? "0" : chunkSizeF,
    error,
    token: srcToken,
    zeroAmount: isZero,
  };
};

export const useTriggerPriceWarning = () => {
  const { triggerPricePercent } = useTwapStore((s) => s.state);
  const { translations: t, module } = useTwapContext();

  return useMemo(() => {
    if (module !== Module.STOP_LOSS) return;

    return {
      text: t.triggerMarketPriceDisclaimer,
      url: ORBS_WEBSITE_URL,
    };
  }, [triggerPricePercent, t, module]);
};
