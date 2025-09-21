import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import BN from "bignumber.js";
import { OrderStatus, Order, OrderType, getOrderLimitPriceRate, getOrderExcecutionRate, getOrderFillDelayMillis } from "@orbs-network/twap-sdk";
import { useOrderHistoryContext, useSelectedOrder } from "./context";
import moment from "moment";
import { Token } from "../../types";
import { useFormatNumber } from "../../hooks/useFormatNumber";
import { useTwapContext } from "../../context";
import { useAmountUi, useOrderName } from "../../hooks/logic-hooks";
import { HiArrowLeft } from "@react-icons/all-files/hi/HiArrowLeft";
import { SwapStatus, TokensDisplay } from "@orbs-network/swap-ui";
import { OrderDetails } from "../../components/order-details";
import { useCancelOrder } from "../../hooks/use-cancel-order";

export const HistoryOrderPreview = () => {
  const order = useSelectedOrder();
  const context = useTwapContext();
  const { useToken, translations: t, config, components } = context;
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

  const component = (
    <div className="twap-orders__selected-order">
      <div className="twap-orders__selected-order-header">
        <div style={{ cursor: "pointer" }} onClick={closePreview} className="twap-orders__selected-order-header-back-icon">
          <HiArrowLeft />
        </div>
        <p className="twap-orders__selected-order-header-title">
          {name} {t.order}
        </p>
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
        <OrderDetails.FillDelaySummary chunks={order.chunks} fillDelayMillis={getOrderFillDelayMillis(order, config)} />

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
    </div>
  );

  if (context?.OrderHistory?.SelectedOrder) {
    return (
      <context.OrderHistory.SelectedOrder order={order} onBackClick={closePreview}>
        {component}
      </context.OrderHistory.SelectedOrder>
    );
  }

  return component;
};

const AccordionContainer = ({ expanded, onClick, children, title }: { expanded: boolean; onClick: () => void; children: ReactNode; title: string }) => {
  return (
    <div className="twap-orders__selected-order-accordion">
      <div onClick={onClick} className="twap-orders__selected-order-accordion-trigger">
        <p>{title}</p>
        <IoIosArrowDown style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }} />
      </div>
      {expanded && <div className="twap-orders__selected-order-accordion-details">{children}</div>}
    </div>
  );
};

const OrderInfo = ({ order }: { order: Order }) => {
  const { useToken, config } = useTwapContext();

  const srcToken = useToken?.(order?.srcTokenAddress);
  const dstToken = useToken?.(order?.dstTokenAddress);
  const srcChunkAmountUi = useAmountUi(srcToken?.decimals, order.srcAmountPerChunk);
  const dstMinAmountOutUi = useAmountUi(dstToken?.decimals, order.dstMinAmountPerChunk);
  const fillDelayMillis = getOrderFillDelayMillis(order, config);

  return (
    <OrderDetails>
      <OrderDetails.DetailRow title="ID">
        <p>{order.id}</p>
      </OrderDetails.DetailRow>
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

export const CancelOrderButton = ({ order }: { order: Order }) => {
  const context = useTwapContext();
  const cancelOrder = useCancelOrder(order);

  const onCancelOrder = useCallback(async () => {
    return cancelOrder.callback();
  }, [cancelOrder]);

  if (!order || order.status !== OrderStatus.Open) return null;

  return (
    <context.OrderHistory.CancelOrderButton
      order={order}
      isLoading={cancelOrder.status === SwapStatus.LOADING}
      error={cancelOrder.error}
      txHash={cancelOrder.txHash}
      status={cancelOrder.status}
      onClick={onCancelOrder}
      className="twap-cancel-order"
    />
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
    <OrderDetails.DetailRow title={t.createdAt} className="twap-order-details__detail-row-created-at">
      <p>{createdAtUi}</p>
    </OrderDetails.DetailRow>
  );
};

const AmountOutFilled = ({ order }: { order: Order }) => {
  const { useToken, translations: t } = useTwapContext();
  const dstToken = useToken?.(order?.dstTokenAddress);
  const dstAmountUi = useAmountUi(dstToken?.decimals, order.filledDstAmount);
  const amount = useFormatNumber({ value: dstAmountUi, decimalScale: 3 });

  if (BN(order.filledDstAmount || 0).isZero()) return null;

  return (
    <OrderDetails.DetailRow title={t.amountReceived} className="twap-order-details__detail-row-amount-received">
      <p>
        {amount || "-"} {dstToken?.symbol}
      </p>
    </OrderDetails.DetailRow>
  );
};

const AmountIn = ({ order }: { order: Order }) => {
  const { useToken, translations: t } = useTwapContext();

  const srcToken = useToken?.(order?.srcTokenAddress);
  const srcAmountUi = useAmountUi(srcToken?.decimals, order.srcAmount);
  const amount = useFormatNumber({ value: srcAmountUi, decimalScale: 3 });

  return (
    <OrderDetails.DetailRow title={t.amountOut} className="twap-order-details__detail-row-amount-out">
      <p>
        {amount || 0} {srcToken?.symbol}
      </p>
    </OrderDetails.DetailRow>
  );
};

const AmountInFilled = ({ order }: { order: Order }) => {
  const { useToken, translations: t } = useTwapContext();

  const srcToken = useToken?.(order?.srcTokenAddress);
  const srcFilledAmountUi = useAmountUi(srcToken?.decimals, order.filledSrcAmount);
  const amount = useFormatNumber({ value: srcFilledAmountUi, decimalScale: 3 });

  return (
    <OrderDetails.DetailRow title={t.amountSent} className="twap-order-details__detail-row-amount-sent">
      <p>
        {amount || "-"} {srcToken?.symbol}
      </p>
    </OrderDetails.DetailRow>
  );
};
const OrderStatusComponent = ({ order }: { order: Order }) => {
  const { translations: t } = useTwapContext();
  const text = !order ? "" : order.status;

  return (
    <OrderDetails.DetailRow title={t.status} className="twap-order-details__detail-row-status">
      <p>{text}</p>
    </OrderDetails.DetailRow>
  );
};

const Progress = ({ order }: { order: Order }) => {
  const { translations: t } = useTwapContext();
  const progress = useFormatNumber({ value: order?.progress, decimalScale: 2 });
  if (order?.chunks === 1) return null;
  return (
    <OrderDetails.DetailRow title={t.progress} className="twap-order-details__detail-row-progress">
      <p>{progress || 0}%</p>
    </OrderDetails.DetailRow>
  );
};

const LimitPrice = ({ order }: { order: Order }) => {
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

  if (BN(order.filledDstAmount || 0).isZero()) return null;

  const excecutionPrice = useMemo(() => {
    if (!srcToken || !dstToken) return;
    return getOrderExcecutionRate(order, srcToken.decimals, dstToken.decimals);
  }, [order, srcToken, dstToken]);

  return <Price title={order?.chunks === 1 ? t.finalExcecutionPrice : t.AverageExecutionPrice} price={excecutionPrice} srcToken={srcToken} dstToken={dstToken} />;
};

const Price = ({ price, srcToken, dstToken, title }: { price?: string; srcToken?: Token; dstToken?: Token; title: string }) => {
  const _price = useFormatNumber({ value: price, decimalScale: 3 });
  return (
    <OrderDetails.DetailRow title={title} className="twap-order-details__detail-row-price">
      {BN(price || 0).isZero() ? (
        <p>-</p>
      ) : (
        <p>
          1 {srcToken?.symbol} = {_price} {dstToken?.symbol}
        </p>
      )}
    </OrderDetails.DetailRow>
  );
};
