import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import BN from "bignumber.js";
import { OrderStatus, Order, OrderType, getOrderLimitPriceRate, getOrderExcecutionRate } from "@orbs-network/twap-sdk";
import { useOrderHistoryContext, useSelectedOrder } from "./context";
import moment from "moment";
import { StyledText } from "../../../styles";
import { Token, TwapOrder } from "../../../types";
import Button from "../../../components/base/Button";
import { useFormatNumber } from "../../../hooks/useFormatNumber";
import { useTwapContext } from "../../../context";
import { useAmountUi, useOrderName } from "../../../hooks/widget-hooks";
import { HiArrowLeft } from "@react-icons/all-files/hi/HiArrowLeft";
import { TokensDisplay } from "@orbs-network/swap-ui";
import { OrderDetails } from "../../../components/order-details";
import styled from "styled-components";

export const HistoryOrderPreview = () => {
  const order = useSelectedOrder();
  const { useToken, components, translations: t, icons } = useTwapContext();

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

  const name = useOrderName(order?.type === OrderType.TWAP_MARKET, order?.chunks);

  if (!order) return null;

  if (components.OrderHistorySelectedOrder) {
    return <components.OrderHistorySelectedOrder order={order} onBackClick={closePreview} />;
  }

  return (
    <StyledSelected className="twap-orders__selected-order">
      <div className="twap-orders__selected-order-header">
        <div style={{ cursor: "pointer" }} onClick={closePreview} className="twap-orders__selected-order-header-back-icon">
          {icons?.selectedOrderBack || <HiArrowLeft />}
        </div>
        <StyledText className="twap-orders__selected-order-header-title">
          #{order?.id} {name} {t.order}
        </StyledText>
      </div>
      <TokensDisplay
        SrcTokenLogo={components.TokenLogo && <components.TokenLogo token={srcToken} />}
        DstTokenLogo={components.TokenLogo && <components.TokenLogo token={dstToken} />}
        fromTitle={t.from}
        inToken={srcToken}
        toTitle={t.to}
        outToken={dstToken}
      />

      <div className="twap-orders__selected-order-bottom">
        <OrderDetails.FillDelaySummary chunks={order.chunks} fillDelayMillis={order.fillDelayMillis} />

        <div className="twap-orders__selected-order-accordions">
          <AccordionContainer title={t.excecutionSummary} onClick={() => handleChange("panel1")} expanded={expanded === "panel1"}>
            <ExcecutionSummary order={order} />
          </AccordionContainer>
          <AccordionContainer title={t.orderInfo} expanded={expanded === "panel2"} onClick={() => handleChange("panel2")}>
            <OrderInfo order={order} />
          </AccordionContainer>
        </div>
        <CancelOrderButton order={order} />
      </div>
    </StyledSelected>
  );
};

const StyledSelected = styled("div")({
  ".twap-orders__selected-order-header": {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
  },
});
const AccordionContainer = ({ expanded, onClick, children, title }: { expanded: boolean; onClick: () => void; children: ReactNode; title: string }) => {
  return (
    <div className="twap-orders__selected-order-accordion">
      <div onClick={onClick} className="twap-orders__selected-order-accordion-trigger">
        <StyledText>{title}</StyledText>
        <IoIosArrowDown style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }} />
      </div>
      {expanded && <div className="twap-orders__selected-order-accordion-details">{children}</div>}
    </div>
  );
};

const OrderInfo = ({ order }: { order: TwapOrder }) => {
  const { useToken } = useTwapContext();

  const srcToken = useToken?.(order?.srcTokenAddress);
  const dstToken = useToken?.(order?.dstTokenAddress);
  const srcChunkAmountUi = useAmountUi(srcToken?.decimals, order.srcAmountPerChunk);
  const dstMinAmountOutUi = useAmountUi(dstToken?.decimals, order.dstMinAmountPerChunk);
  const fillDelayMillis = order.fillDelayMillis;

  return (
    <OrderDetails>
      <LimitPrice order={order} />
      <CreatedAt order={order} />
      <OrderDetails.Expiry deadline={order?.deadline} />
      <AmountIn order={order} />
      <OrderDetails.ChunkSize chunks={order?.chunks} srcChunkAmount={srcChunkAmountUi} srcToken={srcToken} />
      <OrderDetails.ChunksAmount chunks={order?.chunks} />
      <OrderDetails.MinDestAmount totalChunks={order?.chunks} dstToken={dstToken} isMarketOrder={order?.isMarketOrder} dstMinAmountOut={dstMinAmountOutUi} />
      <OrderDetails.TradeInterval chunks={order.chunks} fillDelayMillis={fillDelayMillis} />
      <OrderDetails.Recipient />
      <OrderDetails.TxHash txHash={order?.txHash} />
    </OrderDetails>
  );
};

const ExcecutionSummary = ({ order }: { order: Order }) => {
  return (
    <OrderDetails>
      <OrderStatusComponent order={order} />
      <AmountInFilled order={order} />
      <AmountOutFilled order={order} />
      <Progress order={order} />
      <AvgExcecutionPrice order={order} />
    </OrderDetails>
  );
};

export const CancelOrderButton = ({ order }: { order: TwapOrder }) => {
  const { cancelOrder } = useOrderHistoryContext();
  const translations = useTwapContext().translations;

  const onCancelOrder = useCallback(async () => {
    return cancelOrder(order);
  }, [cancelOrder, order]);

  if (!order || order.status !== OrderStatus.Open) return null;

  return (
    <Button onClick={onCancelOrder} className="twap-cancel-order">
      {translations.cancelOrder}
    </Button>
  );
};

const CreatedAt = ({ order }: { order: Order }) => {
  const { dateFormat, translations: t } = useTwapContext();
  const createdAtUi = useMemo(() => {
    if (!order?.createdAt) return "";
    if (dateFormat) return dateFormat(order?.createdAt);

    return moment(order?.createdAt).format("DD/MM/YYYY HH:mm");
  }, [order?.createdAt, dateFormat]);
  return (
    <OrderDetails.DetailRow title={t.createdAt}>
      <StyledText>{createdAtUi}</StyledText>
    </OrderDetails.DetailRow>
  );
};

const AmountOutFilled = ({ order }: { order: Order }) => {
  const { useToken, translations: t } = useTwapContext();
  const dstToken = useToken?.(order?.dstTokenAddress);
  const dstAmountUi = useAmountUi(dstToken?.decimals, order.filledDstAmount);
  const amount = useFormatNumber({ value: dstAmountUi, decimalScale: 3 });

  return (
    <OrderDetails.DetailRow title={t.amountReceived}>
      <StyledText>
        {amount || "-"} {dstToken?.symbol}
      </StyledText>
    </OrderDetails.DetailRow>
  );
};

const AmountIn = ({ order }: { order: Order }) => {
  const { useToken, translations: t } = useTwapContext();

  const srcToken = useToken?.(order?.srcTokenAddress);
  const srcAmountUi = useAmountUi(srcToken?.decimals, order.srcAmount);
  const amount = useFormatNumber({ value: srcAmountUi, decimalScale: 3 });

  return (
    <OrderDetails.DetailRow title={t.amountOut}>
      <StyledText>
        {amount || 0} {srcToken?.symbol}
      </StyledText>
    </OrderDetails.DetailRow>
  );
};

const AmountInFilled = ({ order }: { order: TwapOrder }) => {
  const { useToken, translations: t } = useTwapContext();

  const srcToken = useToken?.(order?.srcTokenAddress);
  const srcFilledAmountUi = useAmountUi(srcToken?.decimals, order.filledSrcAmount);
  const amount = useFormatNumber({ value: srcFilledAmountUi, decimalScale: 3 });

  return (
    <OrderDetails.DetailRow title={t.amountSent}>
      <StyledText>
        {amount || "-"} {srcToken?.symbol}
      </StyledText>
    </OrderDetails.DetailRow>
  );
};
const OrderStatusComponent = ({ order }: { order: TwapOrder }) => {
  const { translations: t } = useTwapContext();
  const text = !order ? "" : order.status;

  return (
    <OrderDetails.DetailRow title={t.status}>
      <StyledText>{text}</StyledText>
    </OrderDetails.DetailRow>
  );
};

const Progress = ({ order }: { order: TwapOrder }) => {
  const { translations: t } = useTwapContext();
  const progress = useFormatNumber({ value: order?.progress, decimalScale: 2 });
  if (order?.chunks === 1) return null;
  return (
    <OrderDetails.DetailRow title={t.progress}>
      <StyledText>{progress || 0}%</StyledText>
    </OrderDetails.DetailRow>
  );
};

const LimitPrice = ({ order }: { order: TwapOrder }) => {
  const { useToken, translations: t } = useTwapContext();
  const srcToken = useToken?.(order.srcTokenAddress);
  const dstToken = useToken?.(order.dstTokenAddress);

  const limitPrice = useMemo(() => {
    if (!srcToken || !dstToken) return;
    return getOrderLimitPriceRate(order, srcToken?.decimals, dstToken?.decimals);
  }, [order, srcToken, dstToken]);

  if (order?.isMarketOrder) return null;
  return <Price title={t.limitPrice} price={limitPrice} srcToken={srcToken} dstToken={dstToken} />;
};

const AvgExcecutionPrice = ({ order }: { order: Order }) => {
  const { translations: t, useToken } = useTwapContext();
  const srcToken = useToken?.(order.srcTokenAddress);
  const dstToken = useToken?.(order.dstTokenAddress);

  const excecutionPrice = useMemo(() => {
    if (!srcToken || !dstToken) return;
    return getOrderExcecutionRate(order, srcToken.decimals, dstToken.decimals);
  }, [order, srcToken, dstToken]);

  return <Price title={order?.chunks === 1 ? t.finalExcecutionPrice : t.AverageExecutionPrice} price={excecutionPrice} srcToken={srcToken} dstToken={dstToken} />;
};

const Price = ({ price, srcToken, dstToken, title }: { price?: string; srcToken?: Token; dstToken?: Token; title: string }) => {
  const _price = useFormatNumber({ value: price, decimalScale: 3 });
  return (
    <OrderDetails.DetailRow title={title}>
      {BN(price || 0).isZero() ? (
        <StyledText>-</StyledText>
      ) : (
        <StyledText>
          1 {srcToken?.symbol} = {_price} {dstToken?.symbol}
        </StyledText>
      )}
    </OrderDetails.DetailRow>
  );
};
