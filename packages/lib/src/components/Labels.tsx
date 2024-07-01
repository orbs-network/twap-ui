import { Styles, Translations } from "..";
import { useTwapContext } from "../context";
import { useTwapStore } from "../store";
import { StyledRowFlex } from "../styles";
import { Icon, Label } from "./base";
import { AiOutlineHistory } from "@react-icons/all-files/ai/AiOutlineHistory";
import { handleFillDelayText } from "../utils";
import { useMinimumDelayMinutes } from "../hooks";

export function ChunksAmountLabel() {
  const translations = useTwapContext().translations;

  return <Label tooltipText={translations.tradeSizeTooltip}>{translations.tradeSize} </Label>;
}

export const TotalTradesLabel = () => {
  const translations = useTwapContext().translations;

  return <Label tooltipText={translations.totalTradesTooltip}>{translations.totalTrades}</Label>;
};

export const CurrentMarketPriceLabel = () => {
  const translations = useTwapContext().translations;
  return <Label>{translations.currentMarketPrice}</Label>;
};

export const LimitPriceLabel = () => {
  const { translations, isLimitPanel } = useTwapContext();
  const isMarketOrder = useTwapStore((store) => store.isMarketOrder);

  return (
    <Styles.StyledRowFlex justifyContent="flex-start" style={{ width: "auto", position: "relative" }} gap={3}>
      <Label tooltipText={!isMarketOrder ? translations.limitPriceTooltip : translations.marketPriceTooltip}>{!isLimitPanel ? translations.price : translations.limitPrice}</Label>{" "}
    </Styles.StyledRowFlex>
  );
};

export const MaxDurationLabel = () => {
  const translations = useTwapContext().translations;
  return <Label tooltipText={translations.maxDurationTooltip}>{translations.maxDuration}</Label>;
};

export const TradeIntervalLabel = () => {
  const translations = useTwapContext().translations;
  const getMinimumDelayMinutes = useMinimumDelayMinutes();
  return <Label tooltipText={handleFillDelayText(translations.tradeIntervalTootlip, getMinimumDelayMinutes)}>{translations.tradeInterval}</Label>;
};

export const OrderSummaryDeadlineLabel = ({ subtitle, translations: _translations }: { subtitle?: boolean; translations?: Translations }) => {
  const translations = useTwapContext()?.translations || _translations;

  return (
    <Label subtitle={subtitle} tooltipText={translations.confirmationDeadlineTooltip}>
      {translations.expiration}
    </Label>
  );
};

export const OrderSummaryOrderTypeLabel = ({ subtitle, translations: _translations }: { subtitle?: boolean; translations?: Translations }) => {
  const translations = useTwapContext()?.translations || _translations;

  return (
    <Label subtitle={subtitle} tooltipText={translations.confirmationOrderType}>
      {translations.orderType}
    </Label>
  );
};

export const OrderSummaryChunkSizeLabel = ({ subtitle, translations: _translations }: { subtitle?: boolean; translations?: Translations }) => {
  const translations = useTwapContext()?.translations || _translations;

  return (
    <Label subtitle={subtitle} tooltipText={translations.confirmationTradeSizeTooltip}>
      {translations.tradeSize}
    </Label>
  );
};

export const OrderSummaryTotalChunksLabel = ({ subtitle, translations: _translations }: { subtitle?: boolean; translations?: Translations }) => {
  const translations = useTwapContext()?.translations || _translations;

  return (
    <Label subtitle={subtitle} tooltipText={translations.confirmationTotalTradesTooltip}>
      {translations.totalTrades}
    </Label>
  );
};

export const OrderSummaryTradeIntervalLabel = ({ subtitle, translations: _translations }: { subtitle?: boolean; translations?: Translations }) => {
  const translations = useTwapContext()?.translations || _translations;

  return (
    <Label subtitle={subtitle} tooltipText={translations.confirmationtradeIntervalTooltip}>
      {translations.tradeInterval}
    </Label>
  );
};

export const OrderSummaryMinDstAmountOutLabel = ({ subtitle, translations: _translations }: { subtitle?: boolean; translations?: Translations }) => {
  const translations = useTwapContext()?.translations || _translations;

  const isMarketOrder = useTwapStore((store) => store.isMarketOrder);
  return (
    <Label subtitle={subtitle} tooltipText={!isMarketOrder ? translations.confirmationMinDstAmountTootipLimit : translations.confirmationMinDstAmountTootipMarket}>
      {translations.minReceivedPerTrade}
    </Label>
  );
};

export const OrdersLabel = ({ className = "" }: { className?: string }) => {
  const translations = useTwapContext().translations;

  return (
    <StyledRowFlex justifyContent="flex-start" style={{ width: "auto" }}>
      <Icon className="stopwatch-icon" icon={<AiOutlineHistory style={{ width: 19, height: 19 }} />} />
      <Label className={`twap-orders-title ${className}`} tooltipText={translations.ordersTooltip} fontSize={16}>
        {translations.orders}
      </Label>
    </StyledRowFlex>
  );
};
