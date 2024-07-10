import { Fade, styled } from "@mui/material";
import { useTwapContext } from "../../context/context";
import { useCancelOrder } from "../../hooks/useTransactions";
import { StyledColumnFlex, StyledText } from "../../styles";
import { Button } from "../base";
import { Separator } from "../Components";
import { Status } from "@orbs-network/twap";
import { useOrderHistoryContext } from "./context";
import { useFormatNumberV2, useOrderById } from "../../hooks";
import { OrderUI } from "../../types";
import { OrderDisplay } from "../OrderDisplay";

export const SelectedOrder = () => {
  const { selectedOrderId } = useOrderHistoryContext();
  const order = useOrderById(selectedOrderId);

  if (!order) return null;
  const singleChunk = order.totalChunks === 1;

  return (
    <Fade in={true}>
      <Container className="twap-orders-selected-order">
        <OrderDisplay>
          <OrderDisplay.Tokens>
            <OrderDisplay.SrcToken token={order.srcToken} amount={order.srcAmountUi} />
            <OrderDisplay.DstToken token={order.dstToken} amount={order.dstAmount} />
          </OrderDisplay.Tokens>
          <Separator />
          <OrderDisplay.DetailsContainer>
            <CreatedAt order={order} />
            <OrderDisplay.Expiry deadline={order.deadline} />
            {!singleChunk && <Filled order={order} />}
            {!singleChunk && <OrderDisplay.ChunkSize srcChunkAmount={order.srcChunkAmountUi} srcToken={order.srcToken} />}
            {!singleChunk && <OrderDisplay.ChunksAmount chunks={order.totalChunks} />}
            {!singleChunk && <OrderDisplay.MinDestAmount dstToken={order.dstToken} isMarketOrder={order.isMarketOrder} dstMinAmountOut={order.dstMinAmountOutUi} />}
            {!singleChunk && <OrderDisplay.TradeInterval />}
            <OrderDisplay.Recipient />
            <OrderDisplay.TxHash txHash={order.txHash} />
          </OrderDisplay.DetailsContainer>
          <CancelOrderButton order={order} />
        </OrderDisplay>
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
    <OrderDisplay.DetailRow title="Created At">
      <StyledText>{order?.createdAtUi}</StyledText>
    </OrderDisplay.DetailRow>
  );
};

const Filled = ({ order }: { order: OrderUI }) => {
  const progress = useFormatNumberV2({ value: order?.progress, decimalScale: 2 });
  const dstAmount = useFormatNumberV2({ value: order?.dstAmount, decimalScale: 2 });

  return (
    <OrderDisplay.DetailRow title="Filled">
      <StyledText>
        {`${dstAmount || 0} ${order?.dstToken?.symbol}`}
        <small>{` (${progress || 0}%)`}</small>
      </StyledText>
    </OrderDisplay.DetailRow>
  );
};
