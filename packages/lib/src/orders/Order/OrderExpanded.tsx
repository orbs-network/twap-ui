import { styled } from "@mui/material";
import { Status } from "@orbs-network/twap";
import { ReactNode } from "react";
import { Button, Label, TokenLogo, TokenPriceCompare } from "../../components/base";
import { useTwapContext } from "../../context";
import { useCancelOrder, useFormatNumber, useHistoryPrice } from "../../hooks";
import { useTwapStore } from "../../store";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { OrderUI } from "../../types";
import { fillDelayText } from "../../utils";
import { OrderStatus } from "./Components";

const OrderExpanded = ({ order }: { order: OrderUI }) => {
  if (!order) return null;

  return (
    <StyledContainer className="twap-order-expanded">
      <StyledColumnFlex gap={0}>
        <StyledColumnFlex className="twap-extended-order-info">
          <Row label={`Status`}>
            <OrderStatus order={order} />
          </Row>
          <OrderPrice order={order} />
          <Filled order={order} />
          <MinAmountOut order={order} />
          <TotalTrades order={order} />
          <SizePerTrade order={order} />
          <TradeInterval order={order} />
          <Expiry order={order} />
        </StyledColumnFlex>
        {order.ui.status === Status.Open && (
          <div className="twap-order-expanded-cancel-wraper" style={{ marginLeft: "auto", marginRight: "auto" }}>
            <CancelOrderButton orderId={order.order.id} />
          </div>
        )}
      </StyledColumnFlex>
    </StyledContainer>
  );
};

const Expiry = ({ order }: { order: OrderUI }) => {
  const translations = useTwapContext().translations;
  return (
    <Row label={`${translations.deadline}`} tooltip={translations.maxDurationTooltip}>
      {order?.ui.deadlineUi}
    </Row>
  );
};

const TradeInterval = ({ order }: { order: OrderUI }) => {
  const minimumDelayMinutes = useTwapStore((state) => state.getMinimumDelayMinutes());

  if (!order) return null;
  const translations = useTwapContext().translations;
  return (
    <Row label={`${translations.tradeInterval}`} tooltip={translations.tradeIntervalTootlip.replace("{{minutes}}", minimumDelayMinutes.toString())}>
      {fillDelayText(order.ui.fillDelay, translations)}
    </Row>
  );
};

const SizePerTrade = ({ order }: { order: OrderUI }) => {
  const translations = useTwapContext().translations;
  const srcChunkAmountUi = useFormatNumber({ value: order?.ui.srcChunkAmountUi, disableDynamicDecimals: true });

  return (
    <Row label={`${translations.tradeSize}`} tooltip={translations.tradeSizeTooltip}>
      {srcChunkAmountUi} {order?.ui.srcToken?.symbol}
    </Row>
  );
};

const TotalTrades = ({ order }: { order: OrderUI }) => {
  const translations = useTwapContext().translations;

  return (
    <Row label={`${translations.totalTrades}`} tooltip={translations.totalTradesTooltip}>
      {order?.ui.totalChunks}
    </Row>
  );
};

const MinAmountOut = ({ order }: { order: OrderUI }) => {
  const amountF = useFormatNumber({ value: order?.ui.dstMinAmountOut, decimalScale: 4 });

  return (
    <Row label="Minimum received" className="twap-order-details-min-amount-out">
      {amountF} {order?.ui.dstToken?.symbol}
    </Row>
  );
};

const Filled = ({ order }: { order: OrderUI }) => {
  const srcFilledAmountUiF = useFormatNumber({ value: order?.ui.srcFilledAmountUi, decimalScale: 4 });
  const srcAmountUiF = useFormatNumber({ value: order?.ui.srcAmountUi, decimalScale: 4 });

  return (
    <Row label="Filled" className="twap-order-details-filled">
      <StyledText>
        {"("}
        {`${srcFilledAmountUiF || "0"}`}
        <span>{`/${srcAmountUiF}`}</span>
        {")"}
      </StyledText>
      <StyledText className="twap-order-details-filled-percent">{order?.ui.progress}%</StyledText>
    </Row>
  );
};

export default OrderExpanded;

const Row = ({ label, tooltip = "", children, className = "" }: { label: string; tooltip?: string; children: ReactNode; className?: string }) => {
  return (
    <StyledDetailRow className={`twap-order-expanded-row ${className}`}>
      <Label tooltipText={tooltip}>{label}</Label>
      <StyledDetailRowChildren className="twap-order-expanded-right">{children}</StyledDetailRowChildren>
    </StyledDetailRow>
  );
};

export const StyledDetailRowChildren = styled(StyledRowFlex)({
  width: "fit-content",
  gap: 5,
  fontWeight: 300,
  fontSize: 13,
  textAlign: "right",
  "& .twap-token-logo": {
    width: 21,
    height: 21,
  },
});

export const StyledDetailRow = styled(StyledRowFlex)({
  justifyContent: "space-between",
  "& .twap-label": {
    fontWeight: 400,
    fontSize: 14,
    "& p": {
      whiteSpace: "unset",
    },
  },
  "& .text": {
    fontWeight: 300,
  },
  "@media(max-width: 500px)": {},
});

const OrderPrice = ({ order }: { order: OrderUI }) => {
  const { leftToken, rightToken, priceUi, toggleInverted } = useHistoryPrice(order);
  const translations = useTwapContext().translations;

  if (!priceUi) return null;

  return (
    <Row className="twap-market-price-section" label={order?.ui.isMarketOrder ? translations.marketPrice : translations.limitPrice}>
      <TokenPriceCompare leftToken={leftToken} rightToken={rightToken} price={priceUi} toggleInverted={toggleInverted} />
    </Row>
  );
};

export const CancelOrderButton = ({ orderId, className = "" }: { orderId: number; className?: string }) => {
  const { isLoading, mutate } = useCancelOrder();
  const translations = useTwapContext().translations;
  return (
    <StyledCancelOrderButton
      loading={isLoading}
      onClick={(e: any) => {
        e.stopPropagation();
        mutate(orderId);
      }}
      className={`${className} twap-cancel-order`}
    >
      {translations.cancelOrder}
    </StyledCancelOrderButton>
  );
};

export const StyledCancelOrderButton = styled(Button)({});

export const StyledContainer = styled(StyledColumnFlex)({
  width: "100%",
  gap: 15,
  paddingTop: 10,
  color: "#D1D5DB",
  "& *": {
    color: "inherit",
  },
});
