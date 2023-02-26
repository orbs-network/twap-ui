import { LinearProgress } from "@mui/material";
import { Box, styled } from "@mui/system";
import { Status } from "@orbs-network/twap";
import { ReactNode } from "react";
import { Components, Styles as TwapStyles } from "../..";
import { useOrdersContext } from "../../context";
import { useCancelOrder, useHistoryPrice } from "../../hooks";
import { fillDelayText, useTwapStore } from "../../store";
import { StyledText } from "../../styles";
import { OrderUI } from "../../types";
import { OrderTokenDisplay } from "./Components";
const OrderExpanded = ({ order }: { order: OrderUI }) => {
  const translations = useOrdersContext().translations;
  const minimumDelayMinutes = useTwapStore((state) => state.getMinimumDelayMinutes());

  return (
    <StyledContainer className="twap-order-expanded">
      {order.ui.srcToken && order.ui.dstToken && (
        <Box className="twap-market-price-section">
          {" "}
          <OrderPrice order={order} />{" "}
        </Box>
      )}
      <StyledColoredContainer className="twap-order-expanded-colored">
        <StyledTitle className="twap-order-expanded-colored-title">{translations.progress}:</StyledTitle>
        <TwapStyles.StyledColumnFlex gap={20}>
          <TwapStyles.StyledRowFlex justifyContent="space-between" style={{ paddingRight: 20 }}>
            <TwapStyles.StyledColumnFlex gap={10} style={{ width: "auto" }}>
              <StyledSectionTitle className="twap-order-expanded-title">{translations.filled}</StyledSectionTitle>
              <StyledOrderTokenDisplay alighLeft usdValue={order.ui.srcFilledAmountUsdUi} token={order.ui.srcToken} amount={order.ui.srcFilledAmountUi} />
            </TwapStyles.StyledColumnFlex>
            <TwapStyles.StyledColumnFlex gap={10} style={{ width: "auto" }}>
              <StyledSectionTitle className="twap-order-expanded-title">{translations.remaining}</StyledSectionTitle>
              <StyledOrderTokenDisplay alighLeft usdValue={order.ui.srcRemainingAmountUsdUi} token={order.ui.srcToken} amount={order.ui.srcRemainingAmountUi} />
            </TwapStyles.StyledColumnFlex>
          </TwapStyles.StyledRowFlex>
          <TwapStyles.StyledRowFlex>
            <Components.Base.Tooltip
              childrenStyles={{ width: "100%" }}
              placement="top"
              text={<Components.Base.NumberDisplay hideTooltip value={order.ui.progress || "0"} decimalScale={1} suffix="%" />}
            >
              <StyledMainProgressBar variant="determinate" value={order.ui.progress || 1} className="twap-order-main-progress-bar" />
            </Components.Base.Tooltip>
          </TwapStyles.StyledRowFlex>
        </TwapStyles.StyledColumnFlex>
      </StyledColoredContainer>
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
        <Box className="twap-order-expanded-cancel-wraper">
          <CancelOrderButton orderId={order.order.id} />
        </Box>
      )}
    </StyledContainer>
  );
};

export default OrderExpanded;

const StyledSectionTitle = styled(StyledText)({
  fontSize: 13,
});

const StyledOrderTokenDisplay = styled(OrderTokenDisplay)({
  fontSize: 14,
  "& .twap-token-logo": {
    width: 19,
    height: 19,
    top: 0,
  },
  "& .twap-token-display-usd": {
    fontSize: 13,
  },
});

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

const StyledTitle = styled(StyledText)({
  textTransform: "capitalize",
  fontSize: 14,
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

const StyledMainProgressBar = styled(LinearProgress)({
  height: 21,
  borderRadius: 2,
  width: "100%",
  "& .MuiLinearProgress-bar": {
    borderRadius: "4px",
  },
});

const StyledColoredContainer = styled(TwapStyles.StyledColumnFlex)({
  width: "100%",
  padding: 12,
  borderRadius: 6,
  gap: 15,
  "& .more-btn": {
    marginTop: 10,
  },
  "& .label": {
    fontSize: 14,
  },
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
