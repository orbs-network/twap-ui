import { styled } from "@mui/material";
import { Status } from "@orbs-network/twap";
import { ReactNode } from "react";
import { Button, Label, TokenLogo } from "../../components/base";
import { useTwapContext } from "../../context/context";
import { useFormatNumberV2, useMinimumDelayMinutes } from "../../hooks";
import { useCancelOrder } from "../../hooks/useTransactions";
import { StyledColumnFlex, StyledRowFlex } from "../../styles";
import { OrderUI } from "../../types";
import { fillDelayText } from "../../utils";

const OrderExpanded = ({ order }: { order: OrderUI }) => {
  const { translations, uiPreferences } = useTwapContext();
  const hideUsd = uiPreferences.orders?.hideUsd;
  const minimumDelayMinutes = useMinimumDelayMinutes();
  const totalChunks = useFormatNumberV2({ value: order?.totalChunks });
  const srcChunkAmountUsdUi = 0;

  const srcChunkAmountUi = useFormatNumberV2({ value: order?.srcChunkAmountUi });

  const dstMinAmountOutUi = useFormatNumberV2({ value: order?.dstMinAmountOutUi });
  const dstMinAmountOutUsdUi = 0;

  if (!order) return null;

  return (
    <StyledContainer className="twap-order-expanded">
      <StyledColumnFlex gap={0}>
        <StyledColumnFlex className="twap-extended-order-info">
          {/* {order.ui.srcToken && order.ui.dstToken && <OrderPrice order={order} />} */}
          <Row label={`${translations.totalTrades}`} tooltip={translations.totalTradesTooltip}>
            {totalChunks}
          </Row>
          <Row label={`${translations.tradeSize}`} tooltip={translations.tradeSizeTooltip}>
            <TokenLogo logo={order?.srcToken?.logoUrl} />
            {srcChunkAmountUi} {order?.srcToken?.symbol} {hideUsd ? null : `≈ $${srcChunkAmountUsdUi}`}
          </Row>
          {order.isMarketOrder ? null : (
            <Row label={`${translations.minReceivedPerTrade}`} tooltip={translations.confirmationMinDstAmountTootipLimit}>
              <TokenLogo logo={order.dstToken?.logoUrl} />
              {`${dstMinAmountOutUi} `}
              {order.dstToken?.symbol} {hideUsd ? null : `≈ $${dstMinAmountOutUsdUi}`}
            </Row>
          )}

          <Row label={`${translations.tradeInterval}`} tooltip={translations.tradeIntervalTootlip.replace("{{minutes}}", minimumDelayMinutes.toString())}>
            {fillDelayText(order.fillDelay, translations)}
          </Row>
          <Row label={`${translations.deadline}`} tooltip={translations.maxDurationTooltip}>
            {order.deadlineUi}
          </Row>
        </StyledColumnFlex>
        {order.status === Status.Open && (
          <div className="twap-order-expanded-cancel-wraper" style={{ marginLeft: "auto", marginRight: "auto" }}>
            <CancelOrderButton orderId={order.id} />
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

export const CancelOrderButton = ({ orderId, className = "" }: { orderId: number; className?: string }) => {
  const { isLoading, mutate } = useCancelOrder();
  const translations = useTwapContext().translations;
  return (
    <StyledCancelOrderButton
      loading={isLoading}
      onClick={() => {
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
