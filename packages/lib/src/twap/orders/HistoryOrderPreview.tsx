import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import BN from "bignumber.js";
import { OrderStatus } from "@orbs-network/twap-sdk";
import moment from "moment";
import { Token } from "../../types";
import { useFormatNumber } from "../../hooks/useFormatNumber";
import { useTwapContext } from "../../context";
import { TokensDisplay } from "@orbs-network/swap-ui";
import { OrderDetails } from "../../components/order-details";
import { useTwapStore } from "../../useTwapStore";
import { useOrderHistoryContext } from "./context";
import { useCancelOrderMutation } from "../../hooks/use-cancel-order";
import { useOrderHistoryPanel, usePreviewOrder } from "../../hooks/use-panels";

type Order = NonNullable<ReturnType<typeof usePreviewOrder>>;

type ContextType = {
  order: Order;
};

const Context = createContext({} as ContextType);

const useOrderContext = () => {
  return useContext(Context);
};

export const HistoryOrderPreview = () => {
  const { previewOrder: order } = useOrderHistoryPanel();
  const context = useTwapContext();
  const { translations: t } = context;
  const [expanded, setExpanded] = useState<string | false>("panel1");
  const selectedOrderID = useTwapStore((s) => s.state.selectedOrderID);
  const { TokenLogo, Label } = useOrderHistoryContext();

  useEffect(() => {
    setExpanded("panel1");
  }, [selectedOrderID]);

  const handleChange = (panel: string) => {
    setExpanded(expanded === panel ? false : panel);
  };

  if (!order) return null;

  return (
    <Context.Provider value={{ order }}>
      <div className="twap-orders__selected-order">
        <TokensDisplay
          SrcTokenLogo={TokenLogo && <TokenLogo token={order.srcToken} />}
          DstTokenLogo={TokenLogo && <TokenLogo token={order.dstToken} />}
          fromTitle={t.from}
          inToken={order.srcToken}
          toTitle={t.to}
          outToken={order.dstToken}
        />

        <OrderDetails.Container Label={Label}>
          <div className="twap-orders__selected-order-bottom">
            <div className="twap-orders__selected-order-accordions">
              <AccordionContainer title={t.excecutionSummary} onClick={() => handleChange("panel1")} expanded={expanded === "panel1"}>
                <ExcecutionSummary />
              </AccordionContainer>
              <AccordionContainer title={t.orderInfo} expanded={expanded === "panel2"} onClick={() => handleChange("panel2")}>
                <OrderInfo />
              </AccordionContainer>
            </div>
            <CancelOrderButton />
          </div>
        </OrderDetails.Container>
      </div>
    </Context.Provider>
  );
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

const OrderInfo = () => {
  return (
    <OrderDetails>
      <OrderID />
      <LimitPrice />
      <CreatedAt />
      <Expiry />
      <AmountIn />
      <ChunkSize />
      <ChunksAmount />
      <MinDestAmount />
      <TradeInterval />
      <OrderDetails.Recipient />
    </OrderDetails>
  );
};

const ChunkSize = () => {
  const { order } = useOrderContext();
  return <OrderDetails.ChunkSize srcChunkAmount={order.details.chunkSize.value} srcToken={order?.srcToken} />;
};

const ChunksAmount = () => {
  const { order } = useOrderContext();
  return <OrderDetails.ChunksAmount chunks={order.details.chunksAmount.value} />;
};

const MinDestAmount = () => {
  const { order } = useOrderContext();
  if (!order.details.minDestAmountPerChunk.value) return null;
  return <OrderDetails.MinDestAmount totalChunks={order.details.chunksAmount.value} dstToken={order?.dstToken} dstMinAmountOut={order.details.minDestAmountPerChunk.value} />;
};

const Expiry = () => {
  const { order } = useOrderContext();
  return <OrderDetails.Expiry deadline={order.details.deadline.value} />;
};

const TradeInterval = () => {
  const { order } = useOrderContext();
  return <OrderDetails.TradeInterval fillDelayMillis={order.details.tradeInterval.value} chunks={order.details.chunksAmount.value} />;
};

const OrderID = () => {
  const { order } = useOrderContext();

  return <OrderDetails.OrderID id={order?.id || ""} />;
};

const ExcecutionSummary = () => {
  return (
    <OrderDetails>
      <OrderStatusComponent />
      <AmountInFilled />
      <AmountOutFilled />
      <Progress />
      <AvgExcecutionPrice />
    </OrderDetails>
  );
};

const AmountOutFilled = () => {
  const { order } = useOrderContext();
  const amount = useFormatNumber({ value: order.details.amountOutFilled.value, decimalScale: 3 });
  if (!order.details.amountOutFilled.value) return null;
  return (
    <OrderDetails.DetailRow title={order.details.amountOutFilled.label}>
      <p>
        {amount || "-"} {order?.dstToken?.symbol}
      </p>
    </OrderDetails.DetailRow>
  );
};

export const CancelOrderButton = () => {
  const { order } = useOrderContext();
  const { Button } = useOrderHistoryContext();
  const { mutateAsync: cancelOrder, isLoading } = useCancelOrderMutation();
  const { callbacks } = useOrderHistoryContext();

  const onCancelOrder = useCallback(async () => {
    return cancelOrder({ orderIds: [order?.id || ""], callbacks });
  }, [cancelOrder, order, callbacks]);

  if (!order || order.status !== OrderStatus.Open) return null;

  return (
    <Button loading={isLoading} onClick={onCancelOrder} disabled={isLoading} className="twap-cancel-order">
      Cancel
    </Button>
  );
};

const CreatedAt = () => {
  const { order } = useOrderContext();
  const { translations: t } = useTwapContext();
  const { dateFormat } = useOrderHistoryContext();
  const createdAtUi = useMemo(() => {
    if (!order?.createdAt) return "";
    if (dateFormat) return dateFormat(order?.createdAt);

    return moment(order?.createdAt).format("DD/MM/YYYY HH:mm");
  }, [order?.createdAt, dateFormat]);
  return (
    <OrderDetails.DetailRow title={t.createdAt}>
      <p>{createdAtUi}</p>
    </OrderDetails.DetailRow>
  );
};

const AmountIn = () => {
  const { order } = useOrderContext();
  const { translations: t } = useTwapContext();

  const amount = useFormatNumber({ value: order.details.amountIn.value, decimalScale: 3 });

  return (
    <OrderDetails.DetailRow title={t.amountOut}>
      <p>
        {amount || 0} {order?.srcToken?.symbol}
      </p>
    </OrderDetails.DetailRow>
  );
};

const AmountInFilled = () => {
  const { order } = useOrderContext();
  const amount = useFormatNumber({ value: order.details.amountInFilled.value, decimalScale: 3 });

  return (
    <OrderDetails.DetailRow title={order.details.amountInFilled.label}>
      <p>
        {amount || "-"} {order?.srcToken?.symbol}
      </p>
    </OrderDetails.DetailRow>
  );
};
const OrderStatusComponent = () => {
  const { order } = useOrderContext();
  const { translations: t } = useTwapContext();
  const text = !order ? "" : order.status;

  return (
    <OrderDetails.DetailRow title={t.status}>
      <p>{text}</p>
    </OrderDetails.DetailRow>
  );
};

const Progress = () => {
  const { order } = useOrderContext();
  const progress = useFormatNumber({ value: order.details.progress.value, decimalScale: 2 });

  return (
    <OrderDetails.DetailRow title={order.details.progress.label}>
      <p>{progress || 0}%</p>
    </OrderDetails.DetailRow>
  );
};

const LimitPrice = () => {
  const { order } = useOrderContext();
  const { translations: t } = useTwapContext();

  if (!order.details.limitPrice.value) return null;

  return <Price title={t.limitPrice} price={order.details.limitPrice.value} srcToken={order?.srcToken} dstToken={order?.dstToken} />;
};

const AvgExcecutionPrice = () => {
  const { order } = useOrderContext();
  if (!order.details.excecutionPrice.value) return null;
  return <Price title={order.details.excecutionPrice.label} price={order.details.excecutionPrice.value} srcToken={order?.srcToken} dstToken={order?.dstToken} />;
};

const Price = ({ price, srcToken, dstToken, title }: { price?: string; srcToken?: Token; dstToken?: Token; title: string }) => {
  const _price = useFormatNumber({ value: price, decimalScale: 3 });
  return (
    <OrderDetails.DetailRow title={title}>
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
