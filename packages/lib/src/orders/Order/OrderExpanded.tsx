import { Box, styled } from "@mui/system";
import { Status } from "@orbs-network/twap";
import { ReactNode } from "react";
import { Components, Styles as TwapStyles } from "../..";
import { useOrdersContext } from "../../context";
import { useCancelOrder, useHistoryPrice } from "../../hooks";
import { fillDelayText, useTwapStore } from "../../store";
import { StyledColumnFlex } from "../../styles";
import { OrderUI } from "../../types";

const OrderExpanded = ({ order }: { order: OrderUI }) => {
  const translations = useOrdersContext().translations;
  const minimumDelayMinutes = useTwapStore((state) => state.getMinimumDelayMinutes());

  return (
    <StyledContainer className="twap-order-expanded">
      <StyledColumnFlex>
        {order.ui.srcToken && order.ui.dstToken && (
          <Box className="twap-market-price-section">
            {" "}
            <OrderPrice order={order} />{" "}
          </Box>
        )}
        <TwapStyles.StyledColumnFlex className="twap-extended-order-info">
          <Row label={`${translations.totalTrades}:`} tooltip={translations.totalTradesTooltip}>
            <Components.Base.NumberDisplay value={order.ui.totalChunks} />
          </Row>
          <Row label={`${translations.tradeSize}:`} tooltip={translations.tradeSizeTooltip}>
            <Components.Base.TokenLogo logo={order.ui.srcToken.logoUrl} />
            <Components.Base.NumberDisplay value={order.ui.srcChunkAmountUi} />
            {order.ui.srcToken?.symbol} ≈ $ <Components.Base.NumberDisplay value={order.ui.srcChunkAmountUsdUi} />
          </Row>
          {order.ui.isMarketOrder ? (
            <Row label={`${translations.minReceivedPerTrade}:`} tooltip={translations.confirmationMinDstAmountTootipMarket}>
              <Components.Base.TokenLogo logo={order.ui.dstToken.logoUrl} />
              {translations.none} {order.ui.dstToken?.symbol}
            </Row>
          ) : (
            <Row label={`${translations.minReceivedPerTrade}:`} tooltip={translations.confirmationMinDstAmountTootipLimit}>
              <Components.Base.TokenLogo logo={order.ui.dstToken.logoUrl} />
              <Components.Base.NumberDisplay value={order.ui.dstMinAmountOutUi} />
              {order.ui.dstToken?.symbol} ≈ $ <Components.Base.NumberDisplay value={order.ui.dstMinAmountOutUsdUi} />
            </Row>
          )}

          <Row label={`${translations.tradeInterval}:`} tooltip={translations.tradeIntervalTootlip.replace("{{minutes}}", minimumDelayMinutes.toString())}>
            {fillDelayText(order.ui.fillDelay, translations)}
          </Row>
          <Row label={`${translations.deadline}:`} tooltip={translations.maxDurationTooltip}>
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
      <Components.Base.Label tooltipText={tooltip}>{label}</Components.Base.Label>
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
  "@media(max-width: 600px)": {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 5,
  },
});

const OrderPrice = ({ order }: { order: OrderUI }) => {
  const { leftToken, rightToken, priceUi, toggleInverted } = useHistoryPrice(order);
  const translations = useOrdersContext().translations;
  return (
    <TwapStyles.StyledRowFlex justifyContent="space-between">
      <Components.Base.SmallLabel>{order.ui.isMarketOrder ? translations.marketPrice : translations.limitPrice}</Components.Base.SmallLabel>
      <Components.Base.TokenPriceCompare leftToken={leftToken} rightToken={rightToken} price={priceUi} toggleInverted={toggleInverted} />
    </TwapStyles.StyledRowFlex>
  );
};

const CancelOrderButton = ({ orderId }: { orderId: number }) => {
  const { isLoading, mutate } = useCancelOrder();
  const translations = useOrdersContext().translations;
  return (
    <StyledCancelOrderButton loading={isLoading} onClick={() => mutate(orderId)}>
      {translations.cancelOrder}
    </StyledCancelOrderButton>
  );
};

export const StyledCancelOrderButton = styled(Components.Base.Button)({
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
