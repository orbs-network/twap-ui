import { useMemo } from "react";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { useChunks } from "./use-chunks";
import { useSrcChunkAmount, useSrcChunkAmountError } from "./use-src-chunk-amount";
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
