import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import BN from "bignumber.js";
import { OrderStatus } from "@orbs-network/twap-sdk";
import { Token } from "../../../types";
import { TokensDisplay } from "@orbs-network/swap-ui";
import { OrderDetails } from "../../../components/order-details";
import { useTwapStore } from "../../../useTwapStore";
import { useCancelOrderMutation } from "../../../hooks/use-cancel-order";
import { useDateFormat, useFormatNumber } from "../../../hooks/helper-hooks";
import { useHistoryOrder } from "../../../hooks/use-history-order";
import { useTranslations } from "../../../hooks/use-translations";
import { useTwapContext } from "../../../context/twap-context";

type Order = NonNullable<ReturnType<typeof useHistoryOrder>>;

type ContextType = {
  order: Order;
};

const Context = createContext({} as ContextType);

const useOrderContext = () => {
  return useContext(Context);
};

export const OrderPreview = () => {
  const selectedOrderID = useTwapStore((s) => s.state.selectedOrderID);
  const order = useHistoryOrder(selectedOrderID);

  const t = useTranslations();
  const [expanded, setExpanded] = useState<string | false>("panel1");
  const components = useTwapContext();
  const { TokenLogo } = components.components;

  useEffect(() => {
    setExpanded("panel1");
  }, [order.id.value]);

  const handleChange = (panel: string) => {
    setExpanded(expanded === panel ? false : panel);
  };

  if (!order) return null;

  return (
    <Context.Provider value={{ order }}>
      <div className="twap-orders__selected-order">
        <TokensDisplay
          SrcTokenLogo={TokenLogo && <TokenLogo token={order.data.srcToken} />}
          DstTokenLogo={TokenLogo && <TokenLogo token={order.data.dstToken} />}
          fromTitle={t("from")}
          inToken={order.data.srcToken}
          toTitle={t("to")}
          outToken={order.data.dstToken}
        />

        <OrderDetails.Container>
          <div className="twap-orders__selected-order-bottom">
            <div className="twap-orders__selected-order-accordions">
              <AccordionContainer title={t("excecutionSummary")} onClick={() => handleChange("panel1")} expanded={expanded === "panel1"}>
                <ExcecutionSummary />
              </AccordionContainer>
              <AccordionContainer title={t("orderInfo")} expanded={expanded === "panel2"} onClick={() => handleChange("panel2")}>
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
      <TriggerPricePerChunk />
      <OrderDetails.Recipient />
    </OrderDetails>
  );
};

const ChunkSize = () => {
  const { order } = useOrderContext();
  return (
    <OrderDetails.TradeSize
      tradeSize={order.display.tradeSize.value}
      srcToken={order.data.srcToken}
      label={order.display.tradeSize.label}
      tooltip={order.display.tradeSize.tooltip}
      trades={order.display.totalTrades.value}
    />
  );
};

const ChunksAmount = () => {
  const { order } = useOrderContext();
  return <OrderDetails.TradesAmount trades={order.display.totalTrades.value} label={order.display.totalTrades.label} tooltip={order.display.totalTrades.tooltip} />;
};

const MinDestAmount = () => {
  const { order } = useOrderContext();

  return (
    <OrderDetails.MinDestAmount
      dstToken={order.data.dstToken}
      dstMinAmountOut={order.display.minDestAmountPerTrade.value}
      label={order.display.minDestAmountPerTrade.label}
      tooltip={order.display.minDestAmountPerTrade.tooltip}
    />
  );
};

const Expiry = () => {
  const { order } = useOrderContext();
  return <OrderDetails.Deadline deadline={order.display.deadline.value} label={order.display.deadline.label} tooltip={order.display.deadline.tooltip} />;
};

const TradeInterval = () => {
  const { order } = useOrderContext();
  return (
    <OrderDetails.TradeInterval
      fillDelayMillis={order.display.tradeInterval.value}
      chunks={order.display.totalTrades.value}
      label={order.display.tradeInterval.label}
      tooltip={order.display.tradeInterval.tooltip}
    />
  );
};

const TriggerPricePerChunk = () => {
  const { order } = useOrderContext();
  return (
    <OrderDetails.TriggerPrice
      dstToken={order.data.dstToken}
      price={order.display.triggerPricePerTrade.value}
      label={order.display.triggerPricePerTrade.label}
      tooltip={order.display.triggerPricePerTrade.tooltip}
    />
  );
};

const OrderID = () => {
  const { order } = useOrderContext();

  return <OrderDetails.OrderID id={order.id.value || ""} />;
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
  const amount = useFormatNumber({ value: order.amountOutFilled.value, decimalScale: 3 });
  if (!order.amountOutFilled.value) return null;
  return (
    <OrderDetails.DetailRow title={order.amountOutFilled.label}>
      <p>
        {amount || "-"} {order.data.dstToken?.symbol}
      </p>
    </OrderDetails.DetailRow>
  );
};

export const CancelOrderButton = () => {
  const { order } = useOrderContext();
  const { mutateAsync: cancelOrder, isLoading } = useCancelOrderMutation();
  const { components } = useTwapContext();
  const Button = components.Button;

  const onCancelOrder = useCallback(async () => {
    return cancelOrder({ orders: [order.original] });
  }, [cancelOrder, order]);

  if (!order || order.original.status !== OrderStatus.Open) return null;
  if (!Button) return null;

  return (
    <Button loading={isLoading} onClick={onCancelOrder} disabled={isLoading} className="twap-cancel-order">
      Cancel
    </Button>
  );
};

const CreatedAt = () => {
  const { order } = useOrderContext();
  const t = useTranslations();
  const createdAtUi = useDateFormat(order.createdAt.value);
  return (
    <OrderDetails.DetailRow title={t("createdAt") || ""}>
      <p>{createdAtUi}</p>
    </OrderDetails.DetailRow>
  );
};

const AmountIn = () => {
  const { order } = useOrderContext();
  const t = useTranslations();

  const amount = useFormatNumber({ value: order.display.srcAmount.value, decimalScale: 3 });

  return (
    <OrderDetails.DetailRow title={t("amountOut") || ""}>
      <p>
        {amount || 0} {order.data.srcToken?.symbol}
      </p>
    </OrderDetails.DetailRow>
  );
};

const AmountInFilled = () => {
  const { order } = useOrderContext();
  const amount = useFormatNumber({ value: order.amountInFilled.value, decimalScale: 3 });

  return (
    <OrderDetails.DetailRow title={order.amountInFilled.label}>
      <p>
        {amount || "-"} {order.data.srcToken?.symbol}
      </p>
    </OrderDetails.DetailRow>
  );
};

const useOrderStatusText = () => {
  const { order } = useOrderContext();
  const t = useTranslations();
  return useMemo(() => {
    switch (order.original.status) {
      case OrderStatus.Open:
        return t("Open") || "";
      case OrderStatus.Completed:
        return t("Completed") || "";
      case OrderStatus.Expired:
        return t("Expired") || "";
      case OrderStatus.Canceled:
        return t("Canceled") || "";

        break;

      default:
        break;
    }
  }, [order.original.status, t]);
};

const OrderStatusComponent = () => {
  const t = useTranslations();
  const text = useOrderStatusText();

  return (
    <OrderDetails.DetailRow title={t("status") || ""}>
      <p>{text}</p>
    </OrderDetails.DetailRow>
  );
};

const Progress = () => {
  const { order } = useOrderContext();
  const progress = useFormatNumber({ value: order.progress.value, decimalScale: 2 });

  return (
    <OrderDetails.DetailRow title={order.progress.label}>
      <p>{progress || 0}%</p>
    </OrderDetails.DetailRow>
  );
};

const LimitPrice = () => {
  const { order } = useOrderContext();
  const t = useTranslations();

  if (!order.display.limitPrice.value) return null;

  return <Price title={t("limitPrice") || ""} price={order.display.limitPrice.value} srcToken={order.data.srcToken} dstToken={order.data.dstToken} />;
};

const AvgExcecutionPrice = () => {
  const { order } = useOrderContext();
  if (!order.excecutionPrice.value) return null;
  return <Price title={order.excecutionPrice.label} price={order.excecutionPrice.value} srcToken={order.data.srcToken} dstToken={order.data.dstToken} />;
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
