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

export const SelectedOrder = () => {
  const { order } = useOrderHistoryContext();
  if (!order) return null;
  const singleChunk = order.ui.totalChunks === 1;

  return (
    <Fade in={true}>
      <Container>
        <StyledOrderPreview>
          <OrderSummary
            fillDelayMillis={order.ui.fillDelay}
            chunks={order.ui.totalChunks}
            dstMinAmountOut={order.ui.dstMinAmountOutUi}
            isMarketOrder={order.ui.isMarketOrder}
            srcChunkAmount={order.ui.srcChunkAmountUi}
            deadline={order.ui.deadline}
            srcAmount={order?.ui.srcAmountUi}
            srcToken={order?.ui.srcToken}
            dstToken={order?.ui.dstToken}
          >
            <OrderSummary.Tokens />
            <Separator />
            <OrderSummary.Details>
              <CreatedAt />
              <OrderSummary.Details.Expiry />
              {!singleChunk && <Filled />}
              {!singleChunk && <OrderSummary.Details.ChunkSize />}
              {!singleChunk && <OrderSummary.Details.ChunksAmount />}
              {!singleChunk && <OrderSummary.Details.MinDestAmount />}
              {!singleChunk && <OrderSummary.Details.TradeInterval />}
              <OrderSummary.Details.Recipient />
            </OrderSummary.Details>
            <CancelOrderButton />
          </OrderSummary>
        </StyledOrderPreview>
      </Container>
    </Fade>
  );
};

const Container = styled(StyledColumnFlex)({});

export const CancelOrderButton = () => {
  const { isLoading, mutateAsync } = useCancelOrder();
  const { order, onOrderCanceled } = useOrderHistoryContext();
  const translations = useTwapContext().translations;

  const onSubmit = useCallback(
    async (id: number) => {
      try {
        await mutateAsync(id);
        onOrderCanceled();
      } catch (error) {}
    },
    [mutateAsync, onOrderCanceled]
  );

  if (!order || order.ui.status !== Status.Open) return null;

  return (
    <StyledCancelOrderButton
      loading={isLoading}
      onClick={() => {
        onSubmit(order.order.id);
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

const CreatedAt = () => {
  const { order } = useOrderHistoryContext();

  return (
    <OrderSummary.Details.DetailRow title="Created At">
      <StyledText>{order?.ui.createdAtUi}</StyledText>
    </OrderSummary.Details.DetailRow>
  );
};

const Filled = () => {
  const { order } = useOrderHistoryContext();

  const progress = order?.ui.progress || 0;
  const dstAmount = order?.ui.dstAmount || 0;

  return (
    <OrderSummary.Details.DetailRow title="Filled">
      <StyledText>
        {`${dstAmount} ${order?.ui.dstToken?.symbol}`}
        <small>{` (${progress}%)`}</small>
      </StyledText>
    </OrderSummary.Details.DetailRow>
  );
};

const StyledOrderPreview = styled(StyledColumnFlex)({
  width: "100%",
});
