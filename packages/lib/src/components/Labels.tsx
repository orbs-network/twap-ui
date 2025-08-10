import { Styles, Translations } from "..";
import { useTwapContext } from "../context";
import { useTwapStore } from "../store";
import { StyledRowFlex } from "../styles";
import { Icon, Label } from "./base";
import { AiOutlineHistory } from "@react-icons/all-files/ai/AiOutlineHistory";
import { handleFillDelayText } from "../utils";

export function ChunksAmountLabel() {
  const translations = useTwapContext().translations;

  return <Label tooltipText={translations.sizePerTradeTooltip}>{translations.sizePerTrade} </Label>;
}

export const TotalTradesLabel = () => {
  const translations = useTwapContext().translations;

  return <Label tooltipText={translations.totalTradesTooltip}>{translations.totalTrades}</Label>;
};

export const CurrentMarketPriceLabel = () => {
  const translations = useTwapContext().translations;
  return <Label>{translations.currentMarketPrice}</Label>;
};

export const LimitPriceLabel = ({ custom }: { custom?: string }) => {
  const translations = useTwapContext().translations;

  return (
    <Styles.StyledRowFlex justifyContent="flex-start" style={{ width: "auto", position: "relative" }} gap={3}>
      <Label>{custom || translations.limitPrice}</Label>{" "}
    </Styles.StyledRowFlex>
  );
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

export const OrderSummaryDeadlineLabel = ({ subtitle, translations: _translations }: { subtitle?: boolean; translations?: Translations }) => {
  const translations = useTwapContext()?.translations || _translations;

  return (
    <Label subtitle={subtitle} tooltipText={translations.expirationTooltip}>
      {translations.expiration}
    </Label>
  );
};

export const OrderSummaryOrderTypeLabel = ({ subtitle, translations: _translations }: { subtitle?: boolean; translations?: Translations }) => {
  const translations = useTwapContext()?.translations || _translations;

  return (
    <Label subtitle={subtitle} tooltipText="">
      {translations.orderType}
    </Label>
  );
};

export const OrderSummaryChunkSizeLabel = ({ subtitle, translations: _translations }: { subtitle?: boolean; translations?: Translations }) => {
  const translations = useTwapContext()?.translations || _translations;

  return (
    <Label subtitle={subtitle} tooltipText={translations.chunkSizeTooltip}>
      {translations.sizePerTrade}
    </Label>
  );
};

export const OrderSummaryTotalChunksLabel = ({ subtitle, translations: _translations }: { subtitle?: boolean; translations?: Translations }) => {
  const translations = useTwapContext()?.translations || _translations;

  return (
    <Label subtitle={subtitle} tooltipText={translations.totalTradesTooltip}>
      {translations.totalTrades}
    </Label>
  );
};

export const OrderSummaryTradeIntervalLabel = ({ subtitle, translations: _translations }: { subtitle?: boolean; translations?: Translations }) => {
  const translations = useTwapContext()?.translations || _translations;

  return (
    <Label subtitle={subtitle} tooltipText={translations.tradeIntervalTooltip}>
      {translations.tradeInterval}
    </Label>
  );
};

export const OrderSummaryMinDstAmountOutLabel = ({ subtitle, translations: _translations }: { subtitle?: boolean; translations?: Translations }) => {
  const translations = useTwapContext()?.translations || _translations;

  return <Label subtitle={subtitle}>{translations.minReceivedPerTrade}</Label>;
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
