import { styled } from "@mui/material";
import { Status } from "@orbs-network/twap";
import { ReactNode, useMemo } from "react";
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

  return <Row label="Status">{<OrderStatus order={order} />}</Row>;
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

  if(!expanded) return null;
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
    <Row label={`${translations.deadline}`} tooltip={translations.maxDurationTooltip}>
      {moment(order?.deadline).format("MMM DD, YYYY HH:mm")}
    </Row>
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
    <Row label={`${translations.tradeInterval}`} tooltip={translations.tradeIntervalTootlip.replace("{{minutes}}", minimumDelayMinutes.toString())}>
      {fillDelayText(order.getFillDelay(lib?.config), translations)}
    </Row>
  );
};

const SizePerTrade = () => {
  const translations = useTwapContext().translations;
  const { order, srcToken } = useListOrderContext();

  const srcChunkAmountUi = useAmountUi(srcToken?.decimals, order.srcBidAmount);
  const srcChunkAmountUiF = useFormatNumber({ value: srcChunkAmountUi, disableDynamicDecimals: true });

  return (
    <Row label={`${translations.tradeSize}`} tooltip={translations.tradeSizeTooltip}>
      {srcChunkAmountUiF} {srcToken?.symbol}
    </Row>
  );
};

const TotalTrades = () => {
  const translations = useTwapContext().translations;
  const { order } = useListOrderContext();

  return (
    <Row label={`${translations.totalTrades}`} tooltip={translations.totalTradesTooltip}>
      {order.totalChunks}
    </Row>
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
    <Row label="Minimum received" className="twap-order-details-min-amount-out">
      {amountF} {dstToken?.symbol}
    </Row>
  );
};

const Filled = () => {
  const { order, srcToken } = useListOrderContext();
  const srcFilledAmountUI = useAmountUi(srcToken?.decimals, order.srcFilledAmount);
  const srcAmountUI = useAmountUi(srcToken?.decimals, order.srcAmount);
  const srcFilledAmountUiF = useFormatNumber({ value: srcFilledAmountUI, decimalScale: 4 });
  const srcAmountUiF = useFormatNumber({ value: srcAmountUI, decimalScale: 4 });

  return (
    <Row label="Filled" className="twap-order-details-filled">
      <StyledText>
        {"("}
        {`${srcFilledAmountUiF || "0"}`}
        <span>{`/${srcAmountUiF}`}</span>
        {")"}
      </StyledText>
      <OrderProgress order={order} />
    </Row>
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
  "& .twap-token-logo": {
    width: 21,
    height: 21,
  },
});

export const StyledDetailRow = styled(StyledRowFlex)({
  justifyContent: "space-between",
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

const OrderPrice = () => {
  const order = useListOrderContext().order;
  const { leftToken, rightToken, onInvert, price } = useOrderExcecutionPrice(order);

  const content = useMemo(() => {
    if (!price) return "-";

    return (
      <>
        1 {leftToken?.symbol} <ArrowsIcon onClick={onInvert} /> {price} {rightToken?.symbol}
      </>
    );
  }, [price, leftToken, rightToken, onInvert]);

  return (
    <Row className="twap-order-price" label="Price">
      {content}
    </Row>
  );
};

export const CancelOrderButton = ({ orderId, className = "" }: { orderId: number; className?: string }) => {
  const { isLoading, mutate } = useCancelOrder();
  const translations = useTwapContext().translations;

  return (
    <StyledCancelOrderButton
      onClick={(e: any) => {
        e.stopPropagation();
        mutate(orderId);
      }}
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

export const StyledContainer = styled('div')({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  "& *": {
    color: "inherit",
  },
});
