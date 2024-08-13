import styled from "styled-components";

import { useTwapContext } from "../../context/context";
import { useCancelOrder } from "../../hooks/useTransactions";
import { StyledColumnFlex, StyledText } from "../../styles";
import { Button } from "../base";
import { Separator } from "../Components";
import { useFormatNumberV2 } from "../../hooks/hooks";
import { useOrderById } from "../../hooks/orders";
import { OrderUI, Status, Token } from "../../types";
import { OrderDisplay } from "../OrderDisplay";
import { ReactNode, useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import BN from "bignumber.js";
export const SelectedOrder = ({ selectedOrderId }: { selectedOrderId?: number }) => {
  const order = useOrderById(selectedOrderId);
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
          <OrderDisplay.SrcToken token={order.srcToken} />
          <OrderDisplay.DstToken token={order.dstToken} />
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

const OrderInfo = ({ order }: { order: OrderUI }) => {
  const isTwap = (order?.totalChunks || 0) > 1;
  return (
    <>
      <LimitPrice order={order} />
      <CreatedAt order={order} />
      <OrderDisplay.Expiry deadline={order?.deadline} />
      <AmountIn order={order} />
      {isTwap && <OrderDisplay.ChunkSize srcChunkAmount={order?.srcChunkAmountUi} srcToken={order?.srcToken} />}
      {isTwap && <OrderDisplay.ChunksAmount chunks={order?.totalChunks} />}
      <OrderDisplay.MinDestAmount totalChunks={order?.totalChunks} dstToken={order?.dstToken} isMarketOrder={order?.isMarketOrder} dstMinAmountOut={order?.dstMinAmountOutUi} />
      {isTwap && <OrderDisplay.TradeInterval fillDelayMillis={order?.fillDelay} />}
      <OrderDisplay.Recipient />
      <OrderDisplay.TxHash txHash={order?.txHash} />
    </>
  );
};

const ExcecutionSummary = ({ order }: { order: OrderUI }) => {
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

export const CancelOrderButton = ({ order }: { order: OrderUI }) => {
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

const CreatedAt = ({ order }: { order: OrderUI }) => {
  return (
    <OrderDisplay.DetailRow title="Created at">
      <StyledText>{order?.createdAtUi}</StyledText>
    </OrderDisplay.DetailRow>
  );
};

const AmountOutFilled = ({ order }: { order: OrderUI }) => {
  const amount = useFormatNumberV2({ value: order?.dstAmount, decimalScale: 3 });

  return (
    <OrderDisplay.DetailRow title="Amount received">
      <StyledText>
        {amount || 0} {order?.dstToken.symbol}
      </StyledText>
    </OrderDisplay.DetailRow>
  );
};

const AmountIn = ({ order }: { order: OrderUI }) => {
  const amount = useFormatNumberV2({ value: order?.srcAmountUi, decimalScale: 3 });

  return (
    <OrderDisplay.DetailRow title="Amount out">
      <StyledText>
        {amount || 0} {order?.srcToken.symbol}
      </StyledText>
    </OrderDisplay.DetailRow>
  );
};

const AmountInFilled = ({ order }: { order: OrderUI }) => {
  const amount = useFormatNumberV2({ value: order?.srcFilledAmountUi, decimalScale: 3 });

  return (
    <OrderDisplay.DetailRow title="Amount sent">
      <StyledText>
        {amount || 0} {order?.srcToken.symbol}
      </StyledText>
    </OrderDisplay.DetailRow>
  );
};
const OrderStatus = ({ order }: { order: OrderUI }) => {
  const t = useTwapContext().translations;

  const text = !order ? "" : t[order.status as keyof typeof t];

  return (
    <OrderDisplay.DetailRow title="Status">
      <StyledText>{text}</StyledText>
    </OrderDisplay.DetailRow>
  );
};

const Progress = ({ order }: { order: OrderUI }) => {
  const progress = useFormatNumberV2({ value: order?.progress, decimalScale: 2 });
  if (order?.totalChunks === 1) return null;
  return (
    <OrderDisplay.DetailRow title="Progress">
      <StyledText>{progress || 0}%</StyledText>
    </OrderDisplay.DetailRow>
  );
};

const LimitPrice = ({ order }: { order: OrderUI }) => {
  if (order?.isMarketOrder) return null;
  return <Price title="Limit price" price={order?.limitPrice} srcToken={order?.srcToken} dstToken={order?.dstToken} />;
};

const AvgExcecutionPrice = ({ order }: { order: OrderUI }) => {
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
