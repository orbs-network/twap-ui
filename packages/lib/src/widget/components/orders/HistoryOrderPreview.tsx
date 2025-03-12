import React from "react";
import styled from "styled-components";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import BN from "bignumber.js";
import { OrderStatus, Order, getOrderFillDelay, getOrderLimitPrice, getOrderExcecutionPrice } from "@orbs-network/twap-sdk";
import { useOrderHistoryContext, useSelectedOrder } from "./context";
import moment from "moment";
import { OrderDisplay } from "../../../components/OrderDisplay";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../../styles";
import { Token } from "../../../types";
import Button from "../../../components/base/Button";
import { useFormatNumber } from "../../../hooks/useFormatNumber";
import { useTwapContext } from "../../../context";
import { useAmountUi, useOrderName } from "../../../hooks/logic-hooks";
import { HiArrowLeft } from "@react-icons/all-files/hi/HiArrowLeft";

const useOrderFillDelay = (order?: Order) => {
  const { config } = useTwapContext();
  return useMemo(() => (!order ? undefined : getOrderFillDelay(order, config)), [order, config]);
};

export const HistoryOrderPreview = () => {
  const order = useSelectedOrder();
  const { useToken, components, translations: t } = useTwapContext();

  const { selectedOrderId, closePreview } = useOrderHistoryContext();
  const [expanded, setExpanded] = useState<string | false>("panel1");
  const srcToken = useToken?.(order?.srcTokenAddress);
  const dstToken = useToken?.(order?.dstTokenAddress);

  useEffect(() => {
    setExpanded("panel1");
  }, [selectedOrderId]);

  const handleChange = (panel: string) => {
    setExpanded(expanded === panel ? false : panel);
  };

  const fillDelayMillis = useOrderFillDelay(order);
  const name = useOrderName(order?.isMarketOrder, order?.totalChunks);

  if (!order) return null;

  if (components.OrderHistorySelectedOrder) {
    return <components.OrderHistorySelectedOrder order={order} onBackClick={closePreview} />;
  }

  return (
    <Container className="twap-orders-selected-order">
      <StyledOrderDetails>
        <StyledBack onClick={closePreview} className="twap-order-history-header-back-icon">
          <HiArrowLeft />
        </StyledBack>
        <StyledText className="twap-order-history-header-title">
          #{order?.id} {name} {t.order}
        </StyledText>
      </StyledOrderDetails>
      <OrderDisplay>
        <OrderDisplay.Tokens>
          <OrderDisplay.SrcToken token={srcToken} />
          <OrderDisplay.DstToken token={dstToken} />
        </OrderDisplay.Tokens>
        <OrderDisplay.FillDelaySummary chunks={order.totalChunks} fillDelayMillis={fillDelayMillis} />

        <div className="twap-orders-selected-order-bottom">
          <div className="twap-orders-selected-order-bottom-accordions">
            <AccordionContainer title={t.excecutionSummary} onClick={() => handleChange("panel1")} expanded={expanded === "panel1"}>
              <ExcecutionSummary order={order} />
            </AccordionContainer>
            <AccordionContainer title={t.orderInfo} expanded={expanded === "panel2"} onClick={() => handleChange("panel2")}>
              <OrderInfo order={order} />
            </AccordionContainer>
          </div>
          <CancelOrderButton order={order} />
        </div>
      </OrderDisplay>
    </Container>
  );
};

const StyledBack = styled("button")({
  background: "none",
  border: "none",
  cursor: "pointer",
});

const StyledOrderDetails = styled(StyledRowFlex)({
  justifyContent: "flex-start",
  gap: 5,
});

const AccordionContainer = ({ expanded, onClick, children, title }: { expanded: boolean; onClick: () => void; children: ReactNode; title: string }) => {
  return (
    <StyledAccordion className="twap-orders-selected-order-accordion">
      <StyledSummary onClick={onClick} className="twap-orders-selected-order-summary">
        <StyledText className="twap-orders-selected-order-summary-title">{title}</StyledText>
        <IoIosArrowDown style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }} />
      </StyledSummary>
      {expanded && <div className="twap-orders-selected-order-details">{children}</div>}
    </StyledAccordion>
  );
};

const StyledSummary = styled.div({
  display: "flex",
  justifyContent: "space-between",
  cursor: "pointer",
  alignItems: "center",
});

const OrderInfo = ({ order }: { order: Order }) => {
  const { useToken } = useTwapContext();

  const srcToken = useToken?.(order?.srcTokenAddress);
  const dstToken = useToken?.(order?.dstTokenAddress);
  const srcChunkAmountUi = useAmountUi(srcToken?.decimals, order.srcBidAmount);
  const dstMinAmountOutUi = useAmountUi(dstToken?.decimals, order.dstMinAmount);
  const fillDelayMillis = useOrderFillDelay(order);

  return (
    <>
      <LimitPrice order={order} />
      <CreatedAt order={order} />
      <OrderDisplay.Expiry deadline={order?.deadline} />
      <AmountIn order={order} />
      <OrderDisplay.ChunkSize chunks={order?.totalChunks} srcChunkAmount={srcChunkAmountUi} srcToken={srcToken} />
      <OrderDisplay.ChunksAmount chunks={order?.totalChunks} />
      <OrderDisplay.MinDestAmount totalChunks={order?.totalChunks} dstToken={dstToken} isMarketOrder={order?.isMarketOrder} dstMinAmountOut={dstMinAmountOutUi} />
      <OrderDisplay.TradeInterval chunks={order.totalChunks} fillDelayMillis={fillDelayMillis} />
      <OrderDisplay.Recipient />
      <OrderDisplay.TxHash txHash={order?.txHash} />
    </>
  );
};

const ExcecutionSummary = ({ order }: { order: Order }) => {
  return (
    <>
      <OrderStatusComponent order={order} />
      <AmountInFilled order={order} />
      <AmountOutFilled order={order} />
      <Progress order={order} />
      <AvgExcecutionPrice order={order} />
    </>
  );
};

const Container = styled(StyledColumnFlex)({});

export const CancelOrderButton = ({ order }: { order: Order }) => {
  const { cancelOrder } = useOrderHistoryContext();
  const translations = useTwapContext().translations;

  if (!order || order.status !== OrderStatus.Open) return null;

  return (
    <StyledCancelOrderButton onClick={cancelOrder} className="twap-cancel-order twap-submit-button">
      {translations.cancelOrder}
    </StyledCancelOrderButton>
  );
};

const StyledCancelOrderButton = styled(Button)({
  marginTop: 0,
});

const CreatedAt = ({ order }: { order: Order }) => {
  const createdAtUi = useMemo(() => moment(order?.createdAt).format("DD/MM/YYYY HH:mm"), [order?.createdAt]);
  return (
    <OrderDisplay.DetailRow title="Created at">
      <StyledText>{createdAtUi}</StyledText>
    </OrderDisplay.DetailRow>
  );
};

const AmountOutFilled = ({ order }: { order: Order }) => {
  const { useToken } = useTwapContext();
  const dstToken = useToken?.(order?.dstTokenAddress);
  const dstAmountUi = useAmountUi(dstToken?.decimals, order.dstFilledAmount);
  const amount = useFormatNumber({ value: dstAmountUi, decimalScale: 3 });

  return (
    <OrderDisplay.DetailRow title="Amount received">
      <StyledText>
        {amount || "-"} {dstToken?.symbol}
      </StyledText>
    </OrderDisplay.DetailRow>
  );
};

const AmountIn = ({ order }: { order: Order }) => {
  const { useToken } = useTwapContext();

  const srcToken = useToken?.(order?.srcTokenAddress);
  const srcAmountUi = useAmountUi(srcToken?.decimals, order.srcAmount);
  const amount = useFormatNumber({ value: srcAmountUi, decimalScale: 3 });

  return (
    <OrderDisplay.DetailRow title="Amount out">
      <StyledText>
        {amount || 0} {srcToken?.symbol}
      </StyledText>
    </OrderDisplay.DetailRow>
  );
};

const AmountInFilled = ({ order }: { order: Order }) => {
  const { useToken } = useTwapContext();

  const srcToken = useToken?.(order?.srcTokenAddress);
  const srcFilledAmountUi = useAmountUi(srcToken?.decimals, order.srcFilledAmount);
  const amount = useFormatNumber({ value: srcFilledAmountUi, decimalScale: 3 });

  return (
    <OrderDisplay.DetailRow title="Amount sent">
      <StyledText>
        {amount || "-"} {srcToken?.symbol}
      </StyledText>
    </OrderDisplay.DetailRow>
  );
};
const OrderStatusComponent = ({ order }: { order: Order }) => {
  const text = !order ? "" : order.status;

  return (
    <OrderDisplay.DetailRow title="Status">
      <StyledText>{text}</StyledText>
    </OrderDisplay.DetailRow>
  );
};

const Progress = ({ order }: { order: Order }) => {
  const progress = useFormatNumber({ value: order?.progress, decimalScale: 2 });
  if (order?.totalChunks === 1) return null;
  return (
    <OrderDisplay.DetailRow title="Progress">
      <StyledText>{progress || 0}%</StyledText>
    </OrderDisplay.DetailRow>
  );
};

const LimitPrice = ({ order }: { order: Order }) => {
  const { useToken } = useTwapContext();
  const srcToken = useToken?.(order.srcTokenAddress);
  const dstToken = useToken?.(order.dstTokenAddress);

  const limitPrice = useMemo(() => {
    if (!srcToken || !dstToken) return;
    return getOrderLimitPrice(order, srcToken?.decimals, dstToken?.decimals);
  }, [order, srcToken, dstToken]);

  if (order?.isMarketOrder) return null;
  return <Price title="Limit price" price={limitPrice} srcToken={srcToken} dstToken={dstToken} />;
};

const AvgExcecutionPrice = ({ order }: { order: Order }) => {
  const { translations: t, useToken } = useTwapContext();
  const srcToken = useToken?.(order.srcTokenAddress);
  const dstToken = useToken?.(order.dstTokenAddress);

  const excecutionPrice = useMemo(() => {
    if (!srcToken || !dstToken) return;
    return getOrderExcecutionPrice(order, srcToken.decimals, dstToken.decimals);
  }, [order, srcToken, dstToken]);

  return <Price title={order?.totalChunks === 1 ? "Final execution price" : t.AverageExecutionPrice} price={excecutionPrice} srcToken={srcToken} dstToken={dstToken} />;
};

const Price = ({ price, srcToken, dstToken, title }: { price?: string; srcToken?: Token; dstToken?: Token; title: string }) => {
  const _price = useFormatNumber({ value: price, decimalScale: 3 });
  return (
    <OrderDisplay.DetailRow title={title}>
      {BN(price || 0).isZero() ? (
        <StyledText>-</StyledText>
      ) : (
        <StyledText>
          1 {srcToken?.symbol} = {_price} {dstToken?.symbol}
        </StyledText>
      )}
    </OrderDisplay.DetailRow>
  );
};

const StyledAccordion = styled("div")({
  width: "100%",
});
