import React from "react";
import styled from "styled-components";
import { useWidgetContext } from "../../context/context";
import { useCancelOrder } from "../../hooks/useTransactions";
import { StyledColumnFlex, StyledText } from "../../styles";
import { Button } from "../base";
import { Separator } from "../Components";
import { useAmountUi, useFormatNumber } from "../../hooks/hooks";
import { Token } from "../../types";
import { OrderDisplay } from "../OrderDisplay";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import BN from "bignumber.js";
import { OrderStatus, Order } from "@orbs-network/twap-sdk";
import { useOrderHistoryContext, useSelectedOrder } from "./context";
import moment from "moment";

export const SelectedOrder = () => {
  const order = useSelectedOrder();
  const { config, useToken } = useWidgetContext();

  const { selectedOrderId } = useOrderHistoryContext();
  const [expanded, setExpanded] = useState<string | false>("panel1");
  const srcToken = useToken?.(order?.srcTokenAddress);
  const dstToken = useToken?.(order?.dstTokenAddress);

  useEffect(() => {
    setExpanded("panel1");
  }, [selectedOrderId]);

  const handleChange = (panel: string) => {
    setExpanded(expanded === panel ? false : panel);
  };

  if (!order) return null;

  return (
    <Container className="twap-orders-selected-order">
      <OrderDisplay>
        <OrderDisplay.Tokens>
          <OrderDisplay.SrcToken token={srcToken} />
          <OrderDisplay.DstToken token={dstToken} isMarketOrder={order.isMarketOrder} chunks={order.totalChunks} fillDelayMillis={order.getFillDelay(config)} />
        </OrderDisplay.Tokens>
        <Separator />
        <StyledColumnFlex gap={15}>
          <AccordionContainer title="Execution summary" onClick={() => handleChange("panel1")} expanded={expanded === "panel1"}>
            <ExcecutionSummary order={order} />
          </AccordionContainer>
          <AccordionContainer title="Order info" expanded={expanded === "panel2"} onClick={() => handleChange("panel2")}>
            <OrderInfo order={order} />
          </AccordionContainer>
          <CancelOrderButton order={order} />
        </StyledColumnFlex>
      </OrderDisplay>
    </Container>
  );
};

const AccordionContainer = ({ expanded, onClick, children, title }: { expanded: boolean; onClick: () => void; children: ReactNode; title: string }) => {
  return (
    <OrderDisplay.DetailsContainer>
      <StyledAccordion>
        <StyledSummary onClick={onClick} className="twap-orders-selected-order-summary">
          <StyledText>{title}</StyledText>
          <IoIosArrowDown style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }} />
        </StyledSummary>
        <StyledDetails style={{ height: expanded ? "auto" : 0 }} className={`twap-orders-selected-order-details ${expanded ? "twap-orders-selected-order-details-expanded" : ""} `}>
          <>
            {children}
            <div className="twap-orders-selected-order-details-margin" />
          </>
        </StyledDetails>
      </StyledAccordion>
    </OrderDisplay.DetailsContainer>
  );
};

const StyledSummary = styled.div({
  display: "flex",
  justifyContent: "space-between",
  cursor: "pointer",
  alignItems: "center",
});

const StyledDetails = styled.div({
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
});

const OrderInfo = ({ order }: { order: Order }) => {
  const isTwap = (order?.totalChunks || 0) > 1;
  const { config, useToken } = useWidgetContext();

  const srcToken = useToken?.(order?.srcTokenAddress);
  const dstToken = useToken?.(order?.dstTokenAddress);
  const srcChunkAmountUi = useAmountUi(srcToken?.decimals, order.srcBidAmount);
  const dstMinAmountOutUi = useAmountUi(dstToken?.decimals, order.dstMinAmount);
  return (
    <>
      <LimitPrice order={order} />
      <CreatedAt order={order} />
      <OrderDisplay.Expiry deadline={order?.deadline} />
      <AmountIn order={order} />
      {isTwap && <OrderDisplay.ChunkSize srcChunkAmount={srcChunkAmountUi} srcToken={srcToken} />}
      {isTwap && <OrderDisplay.ChunksAmount chunks={order?.totalChunks} />}
      <OrderDisplay.MinDestAmount totalChunks={order?.totalChunks} dstToken={dstToken} isMarketOrder={order?.isMarketOrder} dstMinAmountOut={dstMinAmountOutUi} />
      {isTwap && <OrderDisplay.TradeInterval fillDelayMillis={order?.getFillDelay(config)} />}
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
  const { isLoading, mutate: cancel } = useCancelOrder();
  const translations = useWidgetContext().translations;

  if (!order || order.status !== OrderStatus.Open) return null;

  return (
    <StyledCancelOrderButton
      loading={isLoading}
      onClick={() => {
        cancel(order.id);
      }}
      className="twap-cancel-order twap-submit-button"
    >
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
  const { useToken } = useWidgetContext();
  const dstToken = useToken?.(order?.dstTokenAddress);
  const dstAmountUi = useAmountUi(dstToken?.decimals, order.dstFilledAmount);
  const amount = useFormatNumber({ value: dstAmountUi, decimalScale: 3 });

  return (
    <OrderDisplay.DetailRow title="Amount received">
      <StyledText>
        {amount || 0} {dstToken?.symbol}
      </StyledText>
    </OrderDisplay.DetailRow>
  );
};

const AmountIn = ({ order }: { order: Order }) => {
  const { useToken } = useWidgetContext();

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
  const { useToken } = useWidgetContext();

  const srcToken = useToken?.(order?.srcTokenAddress);
  const srcFilledAmountUi = useAmountUi(srcToken?.decimals, order.srcFilledAmount);
  const amount = useFormatNumber({ value: srcFilledAmountUi, decimalScale: 3 });

  return (
    <OrderDisplay.DetailRow title="Amount sent">
      <StyledText>
        {amount || 0} {srcToken?.symbol}
      </StyledText>
    </OrderDisplay.DetailRow>
  );
};
const OrderStatusComponent = ({ order }: { order: Order }) => {
  const t = useWidgetContext().translations;

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
  const { useToken } = useWidgetContext();
  const srcToken = useToken?.(order.srcTokenAddress);
  const dstToken = useToken?.(order.dstTokenAddress);

  const limitPrice = useMemo(() => {
    if (!srcToken || !dstToken) return;
    return order.getLimitPrice(srcToken.decimals, dstToken.decimals);
  }, [order, srcToken, dstToken]);
  const limitPriceF = useFormatNumber({ value: limitPrice });

  if (order?.isMarketOrder) return null;
  return <Price title="Limit price" price={limitPriceF} srcToken={srcToken} dstToken={dstToken} />;
};

const AvgExcecutionPrice = ({ order }: { order: Order }) => {
  const { translations: t, useToken } = useWidgetContext();
  const srcToken = useToken?.(order.srcTokenAddress);
  const dstToken = useToken?.(order.dstTokenAddress);

  const excecutionPrice = useMemo(() => {
    if (!srcToken || !dstToken) return;
    return order.getExcecutionPrice(srcToken.decimals, dstToken.decimals);
  }, [order, srcToken, dstToken]);

  const excecutionPriceF = useFormatNumber({ value: excecutionPrice });

  return <Price title={order?.totalChunks === 1 ? "Final execution price" : t.AverageExecutionPrice} price={excecutionPriceF} srcToken={srcToken} dstToken={dstToken} />;
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
  backgroundColor: "transparent",
  backgroundImage: "unset",
  boxShadow: "unset",
  width: "100%",
});
