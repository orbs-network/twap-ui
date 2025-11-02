import { Module } from "@orbs-network/twap-sdk";
import { useMemo } from "react";
import { useTwapContext } from "../context/twap-context";
import { useTwapStore } from "../useTwapStore";
import { useTranslations } from "./use-translations";

export const useDisclaimerPanel = () => {
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const { module } = useTwapContext();
  const t = useTranslations();

  const hide = module === Module.STOP_LOSS || module === Module.TAKE_PROFIT;
  return useMemo(() => {
    if (hide) return;
    return {
      text: isMarketOrder ? t("marketOrderWarning") : t("limitPriceMessage"),
      url: "https://www.orbs.com/dtwap-and-dlimit-faq/",
    };
  }, [isMarketOrder, t, hide]);
};
