import { styled } from "@mui/material";
import { Styles } from "..";
import { useTwapContext } from "../context";
import { handleFillDelayText, useTwapStore } from "../store";
import { Label } from "./base";
import { ResetLimitButton } from "./Components";

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
  const translations = useTwapContext().translations;
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);

  return (
    <Styles.StyledRowFlex justifyContent="flex-start" style={{ width: "auto", position: "relative" }} gap={3}>
      <Label tooltipText={isLimitOrder ? translations.limitPriceTooltip : translations.marketPriceTooltip}>{translations.limitPrice}</Label>{" "}
      <StyledResetLimit>
        <ResetLimitButton />
      </StyledResetLimit>
    </Styles.StyledRowFlex>
  );
};

const StyledResetLimit = styled("div")({
  position: "absolute",
  right: -35,
});

export const MaxDurationLabel = () => {
  const translations = useTwapContext().translations;
  return <Label tooltipText={translations.maxDurationTooltip}>{translations.maxDuration}</Label>;
};

export const TradeIntervalLabel = () => {
  const translations = useTwapContext().translations;
  const getMinimumDelayMinutes = useTwapStore((store) => store.getMinimumDelayMinutes());
  return <Label tooltipText={handleFillDelayText(translations.tradeIntervalTootlip, getMinimumDelayMinutes)}>{translations.tradeInterval}</Label>;
};

export const OrderSummaryDeadlineLabel = ({ subtitle }: { subtitle?: boolean }) => {
  const translations = useTwapContext().translations;

  return (
    <Label subtitle={subtitle} tooltipText={translations.confirmationDeadlineTooltip}>
      {translations.expiration}
    </Label>
  );
};

export const OrderSummaryOrderTypeLabel = ({ subtitle }: { subtitle?: boolean }) => {
  const translations = useTwapContext().translations;

  return (
    <Label subtitle={subtitle} tooltipText={translations.confirmationOrderType}>
      {translations.orderType}
    </Label>
  );
};

export const OrderSummaryChunkSizeLabel = ({ subtitle }: { subtitle?: boolean }) => {
  const translations = useTwapContext().translations;

  return (
    <Label subtitle={subtitle} tooltipText={translations.confirmationTradeSizeTooltip}>
      {translations.tradeSize}
    </Label>
  );
};

export const OrderSummaryTotalChunksLabel = ({ subtitle }: { subtitle?: boolean }) => {
  const translations = useTwapContext().translations;

  return (
    <Label subtitle={subtitle} tooltipText={translations.confirmationTotalTradesTooltip}>
      {translations.totalTrades}
    </Label>
  );
};

export const OrderSummaryTradeIntervalLabel = ({ subtitle }: { subtitle?: boolean }) => {
  const translations = useTwapContext().translations;

  return (
    <Label subtitle={subtitle} tooltipText={translations.confirmationtradeIntervalTooltip}>
      {translations.tradeInterval}
    </Label>
  );
};

export const OrderSummaryMinDstAmountOutLabel = ({ subtitle }: { subtitle?: boolean }) => {
  const translations = useTwapContext().translations;

  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  return (
    <Label subtitle={subtitle} tooltipText={isLimitOrder ? translations.confirmationMinDstAmountTootipLimit : translations.confirmationMinDstAmountTootipMarket}>
      {translations.minReceivedPerTrade}
    </Label>
  );
};
