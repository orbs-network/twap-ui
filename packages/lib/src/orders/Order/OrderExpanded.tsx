import { styled } from "@mui/material";
import { Status } from "@orbs-network/twap";
import { ReactNode } from "react";
import { Button, Label, TokenLogo, TokenPriceCompare } from "../../components/base";
import { useTwapContext } from "../../context";
import { useCancelOrder, useFormatNumber, useHistoryPrice, useMinimumDelayMinutes } from "../../hooks";
import { useTwapStore } from "../../store";
import { StyledColumnFlex, StyledRowFlex } from "../../styles";
import { OrderUI } from "../../types";
import { fillDelayText } from "../../utils";

const OrderExpanded = ({ order }: { order: OrderUI }) => {
  const { translations, uiPreferences } = useTwapContext();
  const hideUsd = uiPreferences.orders?.hideUsd;
  const minimumDelayMinutes = useMinimumDelayMinutes();
  const totalChunks = useFormatNumber({ value: order?.ui.totalChunks, disableDynamicDecimals: true });
  const srcChunkAmountUsdUi = useFormatNumber({ value: order?.ui.srcChunkAmountUsdUi, disableDynamicDecimals: true });

  const srcChunkAmountUi = useFormatNumber({ value: order?.ui.srcChunkAmountUi, disableDynamicDecimals: true });

  const dstMinAmountOutUi = useFormatNumber({ value: order?.ui.dstMinAmountOutUi, disableDynamicDecimals: true });
  const dstMinAmountOutUsdUi = useFormatNumber({ value: order?.ui.dstMinAmountOutUsdUi, disableDynamicDecimals: true });

  if (!order) return null;

  return (
    <StyledContainer className="twap-order-expanded">
      <StyledColumnFlex gap={0}>
        <StyledColumnFlex className="twap-extended-order-info">
          {order.ui.srcToken && order.ui.dstToken && <OrderPrice order={order} />}
          <Row label={`${translations.totalTrades}`} tooltip={translations.totalTradesTooltip}>
            {totalChunks}
          </Row>
          <Row label={`${translations.tradeSize}`} tooltip={translations.tradeSizeTooltip}>
            <TokenLogo logo={order.ui.srcToken?.logoUrl} />
            {srcChunkAmountUi} {order.ui.srcToken?.symbol} {hideUsd ? null : `≈ $${srcChunkAmountUsdUi}`}
          </Row>
          {order.ui.isMarketOrder ? null : (
            <Row label={`${translations.minReceivedPerTrade}`} tooltip={translations.confirmationMinDstAmountTootipLimit}>
              <TokenLogo logo={order.ui.dstToken?.logoUrl} />
              {`${dstMinAmountOutUi} `}
              {order.ui.dstToken?.symbol} {hideUsd ? null : `≈ $${dstMinAmountOutUsdUi}`}
            </Row>
          )}

          <Row label={`${translations.tradeInterval}`} tooltip={translations.tradeIntervalTootlip.replace("{{minutes}}", minimumDelayMinutes.toString())}>
            {fillDelayText(order.ui.fillDelay, translations)}
          </Row>
          <Row label={`${translations.deadline}`} tooltip={translations.maxDurationTooltip}>
            {order.ui.deadlineUi}
          </Row>
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

  "& *": {
    fontWeight: "inherit",
    fontSize: "inherit",
  },
  "& .twap-token-logo": {
    width: 21,
    height: 21,
  },
});

export const StyledDetailRow = styled(StyledRowFlex)({
  justifyContent: "space-between",
  flexWrap: "wrap",
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
