import { Styles, Translations } from "..";
import { useTwapContext } from "../context/context";
import { Label } from "./base";
import { handleFillDelayText } from "../utils";
import { useIsMarketOrder, useMinimumDelayMinutes } from "../hooks/lib";

export function ChunksAmountLabel() {
  const translations = useTwapContext().translations;

  return (
    <Label>
      <Label.Text text={translations.tradeSize} />
      <Label.Info text={translations.tradeSizeTooltip} />
    </Label>
  );
}

export const TotalTradesLabel = () => {
  const translations = useTwapContext().translations;

  return (
    <Label>
      <Label.Text text={translations.totalTrades} />
      <Label.Info text={translations.totalTradesTooltip} />
    </Label>
  );
};

export const CurrentMarketPriceLabel = () => {
  const translations = useTwapContext().translations;
  return (
    <Label>
      <Label.Text text={translations.currentMarketPrice} />
    </Label>
  );
};

export const LimitPriceLabel = () => {
  const { translations: t, isLimitPanel } = useTwapContext();
  const isMarketOrder = useIsMarketOrder();

  return (
    <Styles.StyledRowFlex justifyContent="flex-start" style={{ width: "auto", position: "relative" }} gap={3}>
      <Label>
        <Label.Text text={!isLimitPanel ? t.price : t.limitPrice} />
        <Label.Info text={isMarketOrder ? t.marketPriceTooltip : isLimitPanel ? t.limitPriceTooltipLimitPanel : t.limitPriceTooltip} />
      </Label>
    </Styles.StyledRowFlex>
  );
};

export const MaxDurationLabel = () => {
  const translations = useTwapContext().translations;
  return (
    <Label>
      <Label.Text text={translations.expiry} />
      <Label.Info text={translations.maxDurationTooltip} />
    </Label>
  );
};

export const TradeIntervalLabel = () => {
  const translations = useTwapContext().translations;
  const getMinimumDelayMinutes = useMinimumDelayMinutes();
  return (
    <Label>
      <Label.Text text={translations.tradeInterval} />
      <Label.Info text={handleFillDelayText(translations.tradeIntervalTootlip, getMinimumDelayMinutes)} />
    </Label>
  );
};

export const OrderSummaryDeadlineLabel = ({ subtitle, translations: _translations }: { subtitle?: boolean; translations?: Translations }) => {
  const translations = useTwapContext()?.translations || _translations;

  return (
    <Label>
      <Label.Text text={translations.expiration} />
      <Label.Info text={translations.confirmationDeadlineTooltip} />
    </Label>
  );
};
