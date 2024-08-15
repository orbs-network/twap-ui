import moment from "moment";
import { useCallback, useMemo } from "react";
import { HistoryOrder, OrdersData } from "../types";
import BN from "bignumber.js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEstimatedDelayBetweenChunksMillis } from "./hooks";
import { amountUi, getTheGraphUrl, groupBy, orderBy } from "../utils";
import { useOrdersContext } from "../providers/orders-provider";
import { eqIgnoreCase } from "@defi.org/web3-candies";
import { REFETCH_ORDER_HISTORY } from "../consts";
import { ordersStore } from "../store/orders-store";
import { getOrders } from "../api/orders-api";

export const useOrders = () => {
  const { config, account } = useOrdersContext();
  const queryClient = useQueryClient();
  const queryKey = ["useOrdersHistoryTWAP", account, config?.exchangeAddress, config?.chainId];

  const query = useQuery(
    queryKey,
    async ({ signal }) => {
      const endpoint = getTheGraphUrl(config!.chainId);
      if (!endpoint) {
        return [];
      }
      let orders = await getOrders(endpoint, account!, signal);

      try {
        const ids = orders.map((o) => o.id);
        let chainOrders = ordersStore.orders[config!.chainId];

        chainOrders.forEach((o: any) => {
          if (!ids.includes(Number(o.id))) {
            orders.push(o);
          } else {
            ordersStore.deleteOrder(config!.chainId, o.id);
          }
        });
      } catch (error) {}
      orders = orders.filter((o) => eqIgnoreCase(config!.exchangeAddress, o.exchange || ""));

      orders = orderBy(orders, (o) => o.createdAt, "desc");
      orders = groupBy(orders, "status");

      return orders as any;
    },
    {
      enabled: !!config && !!account,
      refetchInterval: REFETCH_ORDER_HISTORY,
      refetchOnWindowFocus: true,
      retry: 5,
      staleTime: Infinity,
    },
  );

  const addOrder = useCallback(
    (order: HistoryOrder) => {
      try {
        if (!config) return;
        ordersStore.addOrder(config.chainId, order);
        queryClient.setQueryData(queryKey, (prev?: OrdersData) => {
          const updatedOpenOrders = prev?.Open ? [order, ...prev.Open] : [order];
          if (!prev) {
            return {
              Open: updatedOpenOrders,
            };
          }
          return {
            ...prev,
            Open: updatedOpenOrders,
          };
        });
      } catch (error) {}
    },
    [queryKey, queryClient, config],
  );

  return useMemo(() => {
    return { ...query, addOrder };
  }, [query, addOrder]);
};

export const useParseOrderUi = (order?: HistoryOrder) => {
  const config = useOrdersContext()?.config;
  const estimatedDelayBetweenChunksMillis = useEstimatedDelayBetweenChunksMillis();

  return useMemo(() => {
    if (!config || !order) return;
    const { srcToken, dstToken, srcAmount, srcBidAmount, dstMinAmount, srcFilledAmount, fillDelay, createdAt, deadline, dollarValueOut, progress } = order;
    if (!srcToken || !dstToken) return;
    const isMarketOrder = BN(dstMinAmount || 0).lte(1);
    const srcChunkAmountUi = amountUi(srcToken.decimals, srcBidAmount) || "0";
    const dstMinAmountOutUi = amountUi(dstToken.decimals, dstMinAmount) || "0";
    const dstAmount = amountUi(dstToken.decimals, order.dstAmount) || "0";
    const srcFilledAmountUi = amountUi(srcToken.decimals, srcFilledAmount) || "0";
    const totalChunks = order.totalChunks || 0;

    return {
      id: order.id,
      createdAt,
      createdAtUi: moment(createdAt * 1000).format("ll HH:mm"),
      deadlineUi: moment(deadline * 1000).format("ll HH:mm"),
      isMarketOrder,
      srcAmountUi: amountUi(srcToken.decimals, srcAmount) || "0",
      srcAmountUsdUi: order.dollarValueIn || "0",
      srcChunkAmountUi,
      srcFilledAmountUi,
      dstMinAmountOutUi,
      fillDelay: (fillDelay || 0) * 1000 + estimatedDelayBetweenChunksMillis,
      deadline: deadline * 1000,
      prefix: isMarketOrder ? "~" : "~",
      dstAmount,
      dstAmountUsd: dollarValueOut || "0",
      progress,
      srcToken,
      dstToken,
      totalChunks,
      status: order.status,
      txHash: order.txHash,
      limitPrice: isMarketOrder ? undefined : BN(dstMinAmountOutUi).div(srcChunkAmountUi).toString() || "0",
      excecutionPrice: BN(dstAmount).gt(0) && BN(srcFilledAmountUi).gt(0) ? BN(dstAmount).div(srcFilledAmountUi).toString() : undefined,
    };
  }, [config, order, estimatedDelayBetweenChunksMillis]);
};

export const useOrderById = (id?: number) => {
  const { data } = useOrders();

  const order = useMemo(() => {
    if (!data) return;
    return Object.keys(data)
      .flatMap((key) => data[key as keyof typeof data])
      .find((it: any) => it.id === id);
  }, [data, id]);

  return useParseOrderUi(order);
};
