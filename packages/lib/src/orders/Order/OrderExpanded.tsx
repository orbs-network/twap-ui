import { styled } from "@mui/material";
import { Status } from "@orbs-network/twap";
import { ReactNode } from "react";
import { Styles as TwapStyles } from "../..";
import { Button, Label, TokenLogo, TokenPriceCompare, Tooltip } from "../../components/base";
import { useTwapContext } from "../../context";
import { useCancelOrder, useFormatNumber, useHistoryPrice } from "../../hooks";
import { fillDelayText, useTwapStore } from "../../store";
import { StyledColumnFlex } from "../../styles";
import { OrderUI } from "../../types";

const OrderExpanded = ({ order }: { order: OrderUI }) => {
  const translations = useTwapContext().translations;
  const minimumDelayMinutes = useTwapStore((state) => state.getMinimumDelayMinutes());
  const totalChunks = useFormatNumber({ value: order.ui.totalChunks });
  const srcChunkAmountUsdUi = useFormatNumber({ value: order.ui.srcChunkAmountUsdUi });
  const srcChunkAmountUsdUiTooltip = useFormatNumber({ value: order.ui.srcChunkAmountUsdUi, decimalScale: 18 });

  const srcChunkAmountUi = useFormatNumber({ value: order.ui.srcChunkAmountUi });
  const srcChunkAmountUiTootlip = useFormatNumber({ value: order.ui.srcChunkAmountUi, decimalScale: 18 });

  const dstMinAmountOutUi = useFormatNumber({ value: order.ui.dstMinAmountOutUi });
  const dstMinAmountOutUsdUi = useFormatNumber({ value: order.ui.dstMinAmountOutUsdUi });
  const dstMinAmountOutUsdUiTooltip = useFormatNumber({ value: order.ui.dstMinAmountOutUsdUi, decimalScale: 18 });

  return (
    <StyledContainer className="twap-order-expanded">
      <StyledColumnFlex>
        {order.ui.srcToken && order.ui.dstToken && <OrderPrice order={order} />}
        <TwapStyles.StyledColumnFlex className="twap-extended-order-info">
          <Row label={`${translations.totalTrades}`} tooltip={translations.totalTradesTooltip}>
            {totalChunks}
          </Row>
          <Row label={`${translations.tradeSize}`} tooltip={translations.tradeSizeTooltip}>
            <TokenLogo logo={order.ui.srcToken.logoUrl} />
            <Tooltip text={`${srcChunkAmountUiTootlip} ${order.ui.srcToken.symbol}`}>
              {srcChunkAmountUi} {order.ui.srcToken?.symbol}
            </Tooltip>
            <Tooltip text={`$ ${srcChunkAmountUsdUiTooltip}`}> ≈ $ {srcChunkAmountUsdUi}</Tooltip>
          </Row>
          {order.ui.isMarketOrder ? (
            <Row label={`${translations.minReceivedPerTrade}`} tooltip={translations.confirmationMinDstAmountTootipMarket}>
              <TokenLogo logo={order.ui.dstToken.logoUrl} />
              {translations.none} {order.ui.dstToken?.symbol}
            </Row>
          ) : (
            <Row label={`${translations.minReceivedPerTrade}`} tooltip={translations.confirmationMinDstAmountTootipLimit}>
              <TokenLogo logo={order.ui.dstToken.logoUrl} />
              {dstMinAmountOutUi}
              {order.ui.dstToken?.symbol} ≈ $ <Tooltip text={dstMinAmountOutUsdUiTooltip}>{dstMinAmountOutUsdUi}</Tooltip>
            </Row>
          )}

          <Row label={`${translations.tradeInterval}`} tooltip={translations.tradeIntervalTootlip.replace("{{minutes}}", minimumDelayMinutes.toString())}>
            {fillDelayText(order.ui.fillDelay, translations)}
          </Row>
          <Row label={`${translations.deadline}`} tooltip={translations.maxDurationTooltip}>
            {order.ui.deadlineUi}
          </Row>
        </TwapStyles.StyledColumnFlex>
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

const Row = ({ label, tooltip, children }: { label: string; tooltip: string; children: ReactNode }) => {
  return (
    <StyledDetailRow className="twap-order-expanded-row">
      <Label tooltipText={tooltip}>{label}</Label>
      <StyledDetailRowChildren className="twap-order-expanded-right">{children}</StyledDetailRowChildren>
    </StyledDetailRow>
  );
};

export const StyledDetailRowChildren = styled(TwapStyles.StyledRowFlex)({
  width: "fit-content",
  gap: 5,
  fontWeight: 300,
  fontSize: 13,

  "& *": {
    fontWeight: "inherit",
    fontSize: "inherit",
  },
  "& .twap-token-logo": {
    width: 21,
    height: 21,
  },
});

export const StyledDetailRow = styled(TwapStyles.StyledRowFlex)({
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
  "@media(max-width: 500px)": {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 5,
  },
});

const OrderPrice = ({ order }: { order: OrderUI }) => {
  const { leftToken, rightToken, priceUi, toggleInverted } = useHistoryPrice(order);
  const translations = useTwapContext().translations;
  return (
    <StyledMarketPrice justifyContent="space-between" className="twap-market-price-section">
      <Label>{order.ui.isMarketOrder ? translations.marketPrice : translations.limitPrice}</Label>
      <TokenPriceCompare leftToken={leftToken} rightToken={rightToken} price={priceUi} toggleInverted={toggleInverted} />
    </StyledMarketPrice>
  );
};

const CancelOrderButton = ({ orderId }: { orderId: number }) => {
  const { isLoading, mutate } = useCancelOrder();
  const translations = useTwapContext().translations;
  return (
    <StyledCancelOrderButton
      loading={isLoading}
      onClick={(e: any) => {
        e.stopPropagation();
        mutate(orderId);
      }}
      className="twap-cancel-order"
    >
      {translations.cancelOrder}
    </StyledCancelOrderButton>
  );
};

const StyledMarketPrice = styled(TwapStyles.StyledRowFlex)({
  "@media(max-width: 500px)": {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 5,
  },
});

export const StyledCancelOrderButton = styled(Button)({
  background: "transparent",
  border: "unset",
  width: "fit-content",
  marginTop: 30,
  fontSize: 15,
  fontFamily: "inherit",
  marginLeft: "auto",
  marginRight: "auto",
  fontWeight: 300,
  marginBottom: 20,
});

export const StyledContainer = styled(TwapStyles.StyledColumnFlex)({
  width: "100%",
  gap: 15,
  paddingTop: 10,
  color: "#D1D5DB",
  "& *": {
    color: "inherit",
  },
});
