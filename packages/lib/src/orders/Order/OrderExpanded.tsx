import { styled } from "@mui/material";
import { Status } from "@orbs-network/twap";
import { ReactNode, useCallback, useMemo } from "react";
import { Label, Spinner } from "../../components/base";
import { useTwapContext } from "../../context";
import { useAmountUi, useCancelOrder, useFormatNumber, useNetwork } from "../../hooks";
import { useTwapStore } from "../../store";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { fillDelayText } from "../../utils";
import { OrderProgress, OrderStatus } from "./Components";
import { useListOrderContext } from "./context";
import BN from "bignumber.js";
import { ExplorerIcon } from "./icons";
import {  OrderDetails, OrderDetailsRow } from "../../components";
import { useOrderPrice } from "./hooks";

const OrderExpanded = () => {
  return (
    <StyledColumnFlex className="twap-order-expanded">
      <StyledContainer className="twap-order-expanded-details">
        <OrderStatusComponent />
        <OrderPrice />
        <Filled />
        <MinAmountOut />
        <TotalTrades />
        <SizePerTrade />
        <TradeInterval />
        <Expiry />
      </StyledContainer>
      <OrderBottom />
    </StyledColumnFlex>
  );
};

const OrderStatusComponent = () => {
  const { order } = useListOrderContext();

  if (order.status === Status.Open) return null;

  return <OrderDetailsRow label="Status">{<OrderStatus order={order} />}</OrderDetailsRow>;
};

const OrderBottom = () => {
  return (
    <StyledRowFlex className="twap-order-expanded-bottom">
      <ViewOnExplorer />
      <CancelButton />
    </StyledRowFlex>
  );
};

const ViewOnExplorer = () => {
  const { order, expanded } = useListOrderContext();

  const explorer = useNetwork()?.explorer;

  const url = `${explorer}/tx/${order.txHash}`;

  if (!expanded) return null;
  return (
    <StyledViewOnExplorer href={url} target="_blank" className="twap-order-tx-hash">
      <StyledRowFlex gap={5} className="twap-order-tx-hash-content">
        {order.status !== Status.Open ? <StyledText>View on explorer</StyledText> : null}
        <ExplorerIcon />
      </StyledRowFlex>
    </StyledViewOnExplorer>
  );
};

const StyledViewOnExplorer = styled("a")({
  gap: 5,
  textDecoration: "none",
  ".twap-order-tx-hash-content": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    position: "relative",
    zIndex: 1,
  },
  svg: {
    width: 24,
    height: 24,
    color: "white",
  },
});

const CancelButton = () => {
  const { order } = useListOrderContext();

  if (order.status !== Status.Open) return null;

  return <CancelOrderButton orderId={order.id} />;
};

const Expiry = () => {
  const { order } = useListOrderContext();

  return <OrderDetails.Expiry format="MMM DD, YYYY HH:mm" expiryMillis={order.deadline} />;
};

const TradeInterval = () => {
  const { order } = useListOrderContext();
  const lib = useTwapStore((state) => state.lib);
  const tradeIntervalMillis = useMemo(() => (!lib ? 0 : order.getFillDelay(lib?.config)), [lib]);

  return <OrderDetails.TradeInterval tradeIntervalMillis={tradeIntervalMillis} />;
};

const SizePerTrade = () => {
  const { order, srcToken } = useListOrderContext();
  const srcChunkAmountUi = useAmountUi(srcToken?.decimals, order.srcBidAmount);
  if (order.totalChunks === 1) return null;

  return <OrderDetails.SizePerTrade sizePerTrade={srcChunkAmountUi} symbol={srcToken?.symbol} />;
};

const TotalTrades = () => {
  const { order } = useListOrderContext();

  if (order.totalChunks === 1) return null;
  return <OrderDetails.TotalTrades totalTrades={order.totalChunks} />;
};

const MinAmountOut = () => {
  const { order, dstToken } = useListOrderContext();
  const dstMinAmountOutUi = useAmountUi(dstToken?.decimals, order.dstMinAmount);
  const dstMinAmountOut = useMemo(() => {
    if (!dstMinAmountOutUi || !order.totalChunks) return "0";
    return BN(dstMinAmountOutUi).multipliedBy(order.totalChunks).toString();
  }, [dstMinAmountOutUi, order.totalChunks]);

  return <OrderDetails.MinReceived isMarketOrder={order.isMarketOrder} minReceived={dstMinAmountOut} symbol={dstToken?.symbol} />;
};

const Filled = () => {
  const { order, srcToken } = useListOrderContext();
  const srcFilledAmountUI = useAmountUi(srcToken?.decimals, order.srcFilledAmount);
  const srcAmountUI = useAmountUi(srcToken?.decimals, order.srcAmount);
  const srcFilledAmountUiF = useFormatNumber({ value: srcFilledAmountUI, decimalScale: 4 });
  const srcAmountUiF = useFormatNumber({ value: srcAmountUI, decimalScale: 4 });

  return (
    <OrderDetails.Row label="Filled" className="twap-order-details-filled">
      <StyledText>
        {"("}
        {`${srcFilledAmountUiF || "0"}`}
        <span>{`/${srcAmountUiF}`}</span>
        {")"}
      </StyledText>
      <OrderProgress order={order} />
    </OrderDetails.Row>
  );
};

export default OrderExpanded;

const OrderPrice = () => {
  const price = useOrderPrice();
  const { srcToken, dstToken } = useListOrderContext();
  return <OrderDetails.Price srcToken={srcToken} dstToken={dstToken} price={price} />;
};

export const CancelOrderButton = ({ orderId, className = "" }: { orderId: number; className?: string }) => {
  const { isLoading, mutateAsync } = useCancelOrder();
  const { translations, onCancelOrderSuccess } = useTwapContext();

  const onCancel = useCallback(
    async (e: any) => {
      e.stopPropagation();
      try {
        await mutateAsync(orderId);
        onCancelOrderSuccess?.(orderId);
      } catch (error) {}
    },
    [orderId, mutateAsync, onCancelOrderSuccess]
  );

  return (
    <StyledCancelOrderButton onClick={onCancel} className={`${className} twap-cancel-order ${isLoading ? "twap-cancel-order-loading" : ""}`}>
      <div className="twap-cancel-order-content">
        {isLoading && (
          <div className="twap-cancel-order-spinner">
            <Spinner />
          </div>
        )}
        <StyledText style={{ opacity: isLoading ? 0 : 1 }}>{translations.cancelOrder}</StyledText>
      </div>
    </StyledCancelOrderButton>
  );
};

export const StyledCancelOrderButton = styled("button")({
  position: "relative",
  padding: 0,
  ".twap-cancel-order-content": {
    width: "100%",
    height: "100%",
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  ".twap-cancel-order-spinner": {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    ".twap-spinner": {
      width: "100%!important",
      height: "100%!important",
    },
  },
});

export const StyledContainer = styled(OrderDetails)({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  "& *": {
    color: "inherit",
  },
});
