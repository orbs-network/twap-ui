import React, { createContext, useContext, useMemo } from "react";
import { useTwapContext } from "./context";
import { useTwapStore } from "./useTwapStore";

import {
  useDstTokenPanel,
  useDurationPanel,
  useFillDelayPanel,
  useLimitPricePanel,
  useMarketPricePanel,
  useOpenSubmitModalButton,
  useOrderHistoryPanel,
  useSrcTokenPanel,
  useTradesPanel,
  useTriggerPricePanel,
  useSubmitSwapPanel,
} from "./hooks/use-panels";
import BN from "bignumber.js";
import { InputError, Translations } from "./types";
import { useDerivedSwap } from "./hooks/use-derived-swap";
import { useInvertTrade } from "./hooks/use-invert-trade";
type UserContextType = {
  derivedSwap: ReturnType<typeof useDerivedSwap>;
  inputsError: InputError | undefined;
  tradesPanel: ReturnType<typeof useTradesPanel>;
  fillDelayPanel: ReturnType<typeof useFillDelayPanel>;
  durationPanel: ReturnType<typeof useDurationPanel>;
  limitPricePanel: ReturnType<typeof useLimitPricePanel>;
  marketPricePanel: ReturnType<typeof useMarketPricePanel>;
  srcTokenPanel: ReturnType<typeof useSrcTokenPanel>;
  dstTokenPanel: ReturnType<typeof useDstTokenPanel>;
  disclaimerPanel: ReturnType<typeof useDisclaimerPanel>;
  triggerPricePanel: ReturnType<typeof useTriggerPricePanel>;
  orderHistoryPanel: ReturnType<typeof useOrderHistoryPanel>;
  invertTradePanel: ReturnType<typeof useInvertTrade>;
  submitSwapPanel: ReturnType<typeof useSubmitSwapPanel>;
  translations: Translations;
  openSubmitModalButtonPanel: ReturnType<typeof useOpenSubmitModalButton>;
};

const Context = createContext({} as UserContextType);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { marketPrice, translations } = useTwapContext();
  const srcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const tradesPanel = useTradesPanel();
  const fillDelayPanel = useFillDelayPanel();
  const durationPanel = useDurationPanel();
  const marketPricePanel = useMarketPricePanel();
  const derivedSwap = useDerivedSwap();
  const srcTokenPanel = useSrcTokenPanel();
  const dstTokenPanel = useDstTokenPanel();
  const triggerPricePanel = useTriggerPricePanel();
  const limitPricePanel = useLimitPricePanel();
  const disclaimerPanel = useDisclaimerPanel();
  const orderHistoryPanel = useOrderHistoryPanel();
  const invertTradePanel = useInvertTrade();
  const openSubmitModalButtonPanel = useOpenSubmitModalButton();
  const submitSwapPanel = useSubmitSwapPanel();

  const inputsError =
    BN(marketPrice || 0).isZero() || BN(srcAmount || 0).isZero()
      ? undefined
      : srcTokenPanel.isInsufficientBalance || triggerPricePanel.error || limitPricePanel.error || tradesPanel.error || fillDelayPanel.error || durationPanel.error;

  return (
    <Context.Provider
      value={{
        inputsError,
        derivedSwap,
        tradesPanel,
        fillDelayPanel,
        durationPanel,
        limitPricePanel,
        marketPricePanel,
        triggerPricePanel,
        srcTokenPanel,
        dstTokenPanel,
        disclaimerPanel,
        orderHistoryPanel,
        invertTradePanel,
        translations,
        openSubmitModalButtonPanel,
        submitSwapPanel,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export const useTwap = () => {
  return useContext(Context);
};

const useDisclaimerPanel = () => {
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
