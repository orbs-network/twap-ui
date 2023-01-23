import React from "react";
import { Label } from "../components";
import { useTwapContext } from "../context";
import { handleFillDelayText, useTwapStore } from "../store";

export function ChunksAmountLabel() {
  const translations = useTwapContext().translations;
  return <Label tooltipText={translations.tradeSizeTooltip}>{translations.tradeSize}</Label>;
}

export const TotalTradesLabel = () => {
  const translations = useTwapContext().translations;

  return <Label tooltipText={translations.totalTradesTooltip}>{translations.totalTrades}</Label>;
};

export const LimitPriceLabel = () => {
  const translations = useTwapContext().translations;

  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  return <Label tooltipText={isLimitOrder ? translations.limitPriceTooltip : translations.marketPriceTooltip}>{translations.limitPrice}</Label>;
};

export const MaxDurationLabel = () => {
  const translations = useTwapContext().translations;
  return <Label tooltipText={translations.maxDurationTooltip}>{translations.maxDuration}</Label>;
};

export const TradeIntervalLabel = () => {
  const translations = useTwapContext().translations;
  const getMinimumDelayMinutes = useTwapStore((store) => store.getMinimumDelayMinutes());
  return <Label tooltipText={handleFillDelayText(translations.tradeIntervalTootlip, getMinimumDelayMinutes)}>{translations.tradeInterval}</Label>;
};

export const OrderSummaryDeadlineLabel = () => {
  const translations = useTwapContext().translations;

  return <Label tooltipText={translations.confirmationDeadlineTooltip}>{translations.expiration}</Label>;
};

export const OrderSummaryOrderTypeLabel = () => {
  const translations = useTwapContext().translations;

  return <Label tooltipText={translations.confirmationOrderType}>{translations.orderType}</Label>;
};

export const OrderSummaryChunkSizeLabel = () => {
  const translations = useTwapContext().translations;

  return <Label tooltipText={translations.confirmationTradeSizeTooltip}>{translations.tradeSize}</Label>;
};

export const OrderSummaryTotalChunksLabel = () => {
  const translations = useTwapContext().translations;

  return <Label tooltipText={translations.confirmationTotalTradesTooltip}>{translations.totalTrades}</Label>;
};

export const OrderSummaryTradeIntervalLabel = () => {
  const translations = useTwapContext().translations;

  return <Label tooltipText={translations.confirmationtradeIntervalTooltip}>{translations.tradeInterval}</Label>;
};

export const OrderSummaryMinDstAmountOutLabel = () => {
  const translations = useTwapContext().translations;

  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  return (
    <Label tooltipText={isLimitOrder ? translations.confirmationMinDstAmountTootipLimit : translations.confirmationMinDstAmountTootipMarket}>
      {translations.minReceivedPerTrade}
    </Label>
  );
};
