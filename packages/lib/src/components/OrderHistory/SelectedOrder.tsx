import { Fade, styled } from "@mui/material";
import { useTwapContext } from "../../context/context";
import { useCancelOrder } from "../../hooks/useTransactions";
import { StyledColumnFlex, StyledText } from "../../styles";
import { Button } from "../base";
import { Separator } from "../Components";
import { OrderSummary } from "../OrderSummary/OrderSummary";
import { Status } from "@orbs-network/twap";
import { useOrderHistoryContext } from "./context";
import { useCallback } from "react";
import { useFormatNumberV2, useOrderById } from "../../hooks";
import { OrderUI } from "../../types";

export const SelectedOrder = () => {
  const { selectedOrderId } = useOrderHistoryContext();
  const order = useOrderById(selectedOrderId);

  if (!order) return null;
  const singleChunk = order.totalChunks === 1;

  return (
    <Fade in={true}>
      <Container>
        <StyledOrderPreview>
          <OrderSummary
            fillDelayMillis={order.fillDelay}
            chunks={order.totalChunks}
            dstMinAmountOut={order.dstMinAmountOutUi}
            isMarketOrder={order.isMarketOrder}
            srcChunkAmount={order.srcChunkAmountUi}
            deadline={order.deadline}
            srcAmount={order.srcAmountUi}
            srcToken={order.srcToken}
            dstToken={order.dstToken}
            txHash={order.txHash}
          >
            <OrderSummary.Tokens />
            <Separator />
            <OrderSummary.Details>
              <CreatedAt order={order} />
              <OrderSummary.Details.Expiry />
              {!singleChunk && <Filled order={order} />}
              {!singleChunk && <OrderSummary.Details.ChunkSize />}
              {!singleChunk && <OrderSummary.Details.ChunksAmount />}
              {!singleChunk && <OrderSummary.Details.MinDestAmount />}
              {!singleChunk && <OrderSummary.Details.TradeInterval />}
              <OrderSummary.Details.Recipient />
              <OrderSummary.Details.TxHash />
            </OrderSummary.Details>
            <CancelOrderButton order={order} />
          </OrderSummary>
        </StyledOrderPreview>
      </Container>
    </Fade>
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
      className="twap-cancel-order"
    >
      {translations.cancelOrder}
    </StyledCancelOrderButton>
  );
};

const StyledCancelOrderButton = styled(Button)({
  marginTop: 20,
});

const CreatedAt = ({ order }: { order: OrderUI }) => {
  return (
    <OrderSummary.Details.DetailRow title="Created At">
      <StyledText>{order?.createdAtUi}</StyledText>
    </OrderSummary.Details.DetailRow>
  );
};

const Filled = ({ order }: { order: OrderUI }) => {
  const progress = useFormatNumberV2({ value: order?.progress, decimalScale: 2 });
  const dstAmount = useFormatNumberV2({ value: order?.dstAmount, decimalScale: 2 });

  return (
    <OrderSummary.Details.DetailRow title="Filled">
      <StyledText>
        {`${dstAmount || 0} ${order?.dstToken?.symbol}`}
        <small>{` (${progress || 0}%)`}</small>
      </StyledText>
    </OrderSummary.Details.DetailRow>
  );
};

const StyledOrderPreview = styled(StyledColumnFlex)({
  width: "100%",
});
