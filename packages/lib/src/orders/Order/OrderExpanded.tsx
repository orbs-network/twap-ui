import { styled } from "@mui/material";
import { Status } from "@orbs-network/twap";
import { ReactNode, useCallback, useMemo } from "react";
import { Label, Spinner } from "../../components/base";
import { useTwapContext } from "../../context";
import { useAmountUi, useCancelOrder, useFormatNumber, useHistoryPrice, useNetwork } from "../../hooks";
import { useTwapStore } from "../../store";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { fillDelayText } from "../../utils";
import { OrderProgress, OrderStatus, useOrderExcecutionPrice } from "./Components";
import { useListOrderContext } from "./context";
import BN from "bignumber.js";
import moment from "moment";
import { ArrowsIcon, ExplorerIcon } from "./icons";
import { InvertPrice, OrderDetailsRow } from "../../components";

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
  const translations = useTwapContext().translations;
  const { order } = useListOrderContext();

  return (
    <OrderDetailsRow label={`${translations.deadline}`} tooltip={translations.maxDurationTooltip}>
      {moment(order?.deadline).format("MMM DD, YYYY HH:mm")}
    </OrderDetailsRow>
  );
};

const TradeInterval = () => {
  const { order } = useListOrderContext();
  const { minimumDelayMinutes, lib } = useTwapStore((state) => {
    return {
      minimumDelayMinutes: state.getMinimumDelayMinutes(),
      lib: state.lib,
    };
  });

  const translations = useTwapContext().translations;

  if (!lib?.config) return null;

  return (
    <OrderDetailsRow label={`${translations.tradeInterval}`} tooltip={translations.tradeIntervalTootlip.replace("{{minutes}}", minimumDelayMinutes.toString())}>
      {fillDelayText(order.getFillDelay(lib?.config), translations)}
    </OrderDetailsRow>
  );
};

const SizePerTrade = () => {
  const translations = useTwapContext().translations;
  const { order, srcToken } = useListOrderContext();

  const srcChunkAmountUi = useAmountUi(srcToken?.decimals, order.srcBidAmount);
  const srcChunkAmountUiF = useFormatNumber({ value: srcChunkAmountUi, disableDynamicDecimals: true });

  return (
    <OrderDetailsRow label={`${translations.tradeSize}`} tooltip={translations.tradeSizeTooltip}>
      {srcChunkAmountUiF} {srcToken?.symbol}
    </OrderDetailsRow>
  );
};

const TotalTrades = () => {
  const translations = useTwapContext().translations;
  const { order } = useListOrderContext();

  return (
    <OrderDetailsRow label={`${translations.totalTrades}`} tooltip={translations.totalTradesTooltip}>
      {order.totalChunks}
    </OrderDetailsRow>
  );
};

const MinAmountOut = () => {
  const { order, dstToken } = useListOrderContext();

  const dstMinAmountOutUi = useAmountUi(dstToken?.decimals, order.dstMinAmount);

  const dstMinAmountOut = useMemo(() => {
    if (!dstMinAmountOutUi || !order.totalChunks) return "0";
    return BN(dstMinAmountOutUi).multipliedBy(order.totalChunks).toString();
  }, [dstMinAmountOutUi, order.totalChunks]);

  const amountF = useFormatNumber({ value: dstMinAmountOut, decimalScale: 4 });

  return (
    <OrderDetailsRow label="Minimum received" className="twap-order-details-min-amount-out">
      {amountF} {dstToken?.symbol}
    </OrderDetailsRow>
  );
};

const Filled = () => {
  const { order, srcToken } = useListOrderContext();
  const srcFilledAmountUI = useAmountUi(srcToken?.decimals, order.srcFilledAmount);
  const srcAmountUI = useAmountUi(srcToken?.decimals, order.srcAmount);
  const srcFilledAmountUiF = useFormatNumber({ value: srcFilledAmountUI, decimalScale: 4 });
  const srcAmountUiF = useFormatNumber({ value: srcAmountUI, decimalScale: 4 });

  return (
    <OrderDetailsRow label="Filled" className="twap-order-details-filled">
      <StyledText>
        {"("}
        {`${srcFilledAmountUiF || "0"}`}
        <span>{`/${srcAmountUiF}`}</span>
        {")"}
      </StyledText>
      <OrderProgress order={order} />
    </OrderDetailsRow>
  );
};

export default OrderExpanded;

const OrderPrice = () => {
  const order = useListOrderContext().order;
  const { srcToken, dstToken, price } = useOrderExcecutionPrice(order);

  return (
    <OrderDetailsRow className="twap-order-price" label="Price">
      {!price ? "-" : <InvertPrice price={price} srcToken={srcToken} dstToken={dstToken} />}
    </OrderDetailsRow>
  );
};

export const CancelOrderButton = ({ orderId, className = "" }: { orderId: number; className?: string }) => {
  const { isLoading, mutateAsync } = useCancelOrder();
  const translations = useTwapContext().translations;
  const { setExpand, onCancelSuccess } = useListOrderContext();

  const onCancel = useCallback(async (e: any) => {
    e.stopPropagation();
    try {
      await mutateAsync(orderId);
      setExpand(false);
      onCancelSuccess?.(orderId);
    } catch (error) {}
  }, [orderId, mutateAsync, setExpand]);

  return (
    <StyledCancelOrderButton
      onClick={onCancel}
      className={`${className} twap-cancel-order ${isLoading ? "twap-cancel-order-loading" : ""}`}
    >
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

export const StyledContainer = styled("div")({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  "& *": {
    color: "inherit",
  },
});
