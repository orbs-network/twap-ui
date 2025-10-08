import { getOrderFillDelayMillis, Order } from "@orbs-network/twap-sdk";
import { useMemo } from "react";
import { useTwapContext } from "../context/twap-context";
import { useAmountUi } from "./helper-hooks";
import { useOrders, useOrderName, useOrderLimitPrice, useOrderAvgExcecutionPrice } from "./order-hooks";
import { useBaseOrder } from "./use-base-order";
import { useFormatNumber } from "./useFormatNumber";
import { useOrderHistoryContext } from "../context/order-history-context";

export const useHistoryOrder = (orderId?: string) => {
  const { orders } = useOrders();
  const { useToken } = useOrderHistoryContext();
  const { translations: t, config } = useTwapContext();
  const order = useMemo(() => orders?.all.find((order) => order.id === orderId), [orders, orderId]) || ({} as Order);
  const title = useOrderName(order);
  const srcToken = useToken?.(order?.srcTokenAddress);
  const dstToken = useToken?.(order?.dstTokenAddress);
  const selectedOrderLimitPrice = useOrderLimitPrice(srcToken, dstToken, order);
  const excecutionPrice = useFormatNumber({ value: useOrderAvgExcecutionPrice(srcToken, dstToken, order) });
  const srcFilledAmount = useFormatNumber({ value: useAmountUi(srcToken?.decimals, order?.srcAmountFilled) });
  const dstFilledAmount = useFormatNumber({ value: useAmountUi(dstToken?.decimals, order?.dstAmountFilled) });
  const progress = useFormatNumber({ value: order?.progress, decimalScale: 2 });
  const extendedOrder = useBaseOrder({
    srcToken,
    dstToken,
    limitPrice: selectedOrderLimitPrice,
    deadline: order?.deadline,
    srcAmount: order?.srcAmount,
    srcAmountPerTrade: order?.srcAmountPerTrade,
    totalTrades: order?.totalTradesAmount,
    minDestAmountPerTrade: order?.dstMinAmountPerTrade,
    tradeInterval: order?.totalTradesAmount === 1 || !order || !config?.twapConfig ? undefined : getOrderFillDelayMillis(order, config.twapConfig!),
    triggerPricePerTrade: order?.triggerPricePerTrade,
    maker: order?.maker,
  });

  return useMemo(() => {
    return {
      original: order,

      ...extendedOrder,
      title,
      createdAt: {
        label: t.createdAt,
        value: order?.createdAt,
      },
      id: {
        label: t.id,
        value: order?.id,
      },
      amountInFilled: {
        label: t.amountSent,
        value: srcFilledAmount,
        token: srcToken,
      },
      amountOutFilled: {
        label: t.amountReceived,
        value: dstFilledAmount,
        token: dstToken,
      },
      progress: {
        label: t.progress,
        value: order?.totalTradesAmount === 1 ? undefined : progress,
      },
      excecutionPrice: {
        label: order?.totalTradesAmount === 1 ? t.finalExcecutionPrice : t.AverageExecutionPrice,
        value: excecutionPrice,
        sellToken: srcToken,
        buyToken: dstToken,
      },
      version: {
        label: t.version,
        value: order?.version,
      },
    };
  }, [order, t, excecutionPrice, srcFilledAmount, dstFilledAmount, progress, title, srcToken, dstToken, extendedOrder]);
};
