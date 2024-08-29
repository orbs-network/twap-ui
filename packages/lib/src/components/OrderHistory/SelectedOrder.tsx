import styled from "styled-components";

import { useTwapContext } from "../../context/context";
import { useCancelOrder } from "../../hooks/useTransactions";
import { StyledColumnFlex, StyledText } from "../../styles";
import { Button } from "../base";
import { Separator } from "../Components";
import { useAmountUi, useFormatNumberV2 } from "../../hooks/hooks";
import { Token } from "../../types";
import { OrderDisplay } from "../OrderDisplay";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import BN from "bignumber.js";
import { Status, Order } from "@orbs-network/twap-sdk";
import { useOrderHistoryContext, useSelectedOrder } from "./context";
import moment from "moment";

export const SelectedOrder = () => {
  const order = useSelectedOrder();
  const { selectedOrderId } = useOrderHistoryContext();
  const [expanded, setExpanded] = useState<string | false>("panel1");

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
          <OrderDisplay.SrcToken token={order?.srcToken} />
          <OrderDisplay.DstToken token={order?.dstToken} isMarketOrder={order.isMarketOrder} chunks={order.totalChunks} fillDelayMillis={order.fillDelay} />
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
        <StyledDetails style={{ height: expanded ? "auto" : 0 }} className="twap-orders-selected-order-details">
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
  const srcChunkAmountUi = useAmountUi(order?.srcToken?.decimals, order.srcBidAmount);
  const dstMinAmountOutUi = useAmountUi(order?.dstToken?.decimals, order.dstMinAmount);
  return (
    <>
      <LimitPrice order={order} />
      <CreatedAt order={order} />
      <OrderDisplay.Expiry deadline={order?.deadline} />
      <AmountIn order={order} />
      {isTwap && <OrderDisplay.ChunkSize srcChunkAmount={srcChunkAmountUi} srcToken={order?.srcToken} />}
      {isTwap && <OrderDisplay.ChunksAmount chunks={order?.totalChunks} />}
      <OrderDisplay.MinDestAmount totalChunks={order?.totalChunks} dstToken={order?.dstToken} isMarketOrder={order?.isMarketOrder} dstMinAmountOut={dstMinAmountOutUi} />
      {isTwap && <OrderDisplay.TradeInterval fillDelayMillis={order?.fillDelay} />}
      <OrderDisplay.Recipient />
      <OrderDisplay.TxHash txHash={order?.txHash} />
    </>
  );
};

const ExcecutionSummary = ({ order }: { order: Order }) => {
  return (
    <>
      <OrderStatus order={order} />
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
  const translations = useTwapContext().translations;

  if (!order || order.status !== Status.Open) return null;

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
  const dstAmountUi = useAmountUi(order.dstToken?.decimals, order.dstAmount);
  const amount = useFormatNumberV2({ value: dstAmountUi, decimalScale: 3 });

  return (
    <OrderDisplay.DetailRow title="Amount received">
      <StyledText>
        {amount || 0} {order?.dstToken?.symbol}
      </StyledText>
    </OrderDisplay.DetailRow>
  );
};

const AmountIn = ({ order }: { order: Order }) => {
  const srcAmountUi = useAmountUi(order?.srcToken?.decimals, order.srcAmount);
  const amount = useFormatNumberV2({ value: srcAmountUi, decimalScale: 3 });

  return (
    <OrderDisplay.DetailRow title="Amount out">
      <StyledText>
        {amount || 0} {order?.srcToken?.symbol}
      </StyledText>
    </OrderDisplay.DetailRow>
  );
};

const AmountInFilled = ({ order }: { order: Order }) => {
  const srcFilledAmountUi = useAmountUi(order?.srcToken?.decimals, order.srcFilledAmount);
  const amount = useFormatNumberV2({ value: srcFilledAmountUi, decimalScale: 3 });

  return (
    <OrderDisplay.DetailRow title="Amount sent">
      <StyledText>
        {amount || 0} {order?.srcToken?.symbol}
      </StyledText>
    </OrderDisplay.DetailRow>
  );
};
const OrderStatus = ({ order }: { order: Order }) => {
  const t = useTwapContext().translations;

  const text = !order ? "" : t[order.status as keyof typeof t];

  return (
    <OrderDisplay.DetailRow title="Status">
      <StyledText>{text}</StyledText>
    </OrderDisplay.DetailRow>
  );
};

const Progress = ({ order }: { order: Order }) => {
  const progress = useFormatNumberV2({ value: order?.progress, decimalScale: 2 });
  if (order?.totalChunks === 1) return null;
  return (
    <OrderDisplay.DetailRow title="Progress">
      <StyledText>{progress || 0}%</StyledText>
    </OrderDisplay.DetailRow>
  );
};

const LimitPrice = ({ order }: { order: Order }) => {
  if (order?.isMarketOrder) return null;
  return <Price title="Limit price" price={order?.limitPrice} srcToken={order?.srcToken} dstToken={order?.dstToken} />;
};

const AvgExcecutionPrice = ({ order }: { order: Order }) => {
  const t = useTwapContext().translations;
  return (
    <Price
      title={order?.totalChunks === 1 ? "Final execution price" : t.AverageExecutionPrice}
      price={order?.excecutionPrice}
      srcToken={order?.srcToken}
      dstToken={order?.dstToken}
    />
  );
};

const Price = ({ price, srcToken, dstToken, title }: { price?: string; srcToken?: Token; dstToken?: Token; title: string }) => {
  const _price = useFormatNumberV2({ value: price, decimalScale: 3 });
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
