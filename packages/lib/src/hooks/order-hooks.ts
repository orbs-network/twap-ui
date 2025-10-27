import { getOrderFillDelayMillis, getAccountOrders, Order, OrderStatus, OrderType } from "@orbs-network/twap-sdk";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import { REFETCH_ORDER_HISTORY } from "../consts";
import { useTwapContext } from "../context/twap-context";
import { Token } from "../types";
import { useCancelOrderMutation } from "./use-cancel-order";
import { useTwapStore } from "../useTwapStore";
import { getOrderExcecutionRate, getOrderLimitPriceRate } from "../utils";

export const useOrderName = (order?: Order) => {
  const { translations: t } = useTwapContext();
  return useMemo(() => {
    if (!order) return t.twapMarket;
    if (order.type === OrderType.TRIGGER_PRICE_MARKET) {
      return t.triggerPriceMarket;
    }
    if (order.type === OrderType.TRIGGER_PRICE_LIMIT) {
      return t.triggerPriceLimit;
    }
    if (order.type === OrderType.TWAP_MARKET) {
      return t.twapMarket;
    }
    if (order.type === OrderType.TWAP_LIMIT) {
      return t.twapLimit;
    }
    return t.twapMarket;
  }, [t, order?.type]);
};

const useOrdersQueryKey = () => {
  const { account, config, chainId } = useTwapContext();
  return useMemo(() => ["useTwapOrderHistoryManager", account, config?.partner, chainId], [account, config, chainId]);
};

export const usePersistedOrdersStore = () => {
  const { account, config, chainId } = useTwapContext();

  const cancelledOrderIdsKey = `cancelled-orders-${account}-${config?.partner}-${chainId}`;
  const getCancelledOrderIds = useCallback((): string[] => {
    const res = localStorage.getItem(cancelledOrderIdsKey);
    if (!res) return [];
    return JSON.parse(res);
  }, [cancelledOrderIdsKey]);

  const addCancelledOrderId = useCallback(
    (orderId: string) => {
      const cancelledOrderIds = getCancelledOrderIds();
      if (!cancelledOrderIds.includes(orderId)) {
        // `.includes()` is more readable for arrays
        cancelledOrderIds.push(orderId);
        localStorage.setItem(cancelledOrderIdsKey, JSON.stringify(cancelledOrderIds));
      }
    },
    [getCancelledOrderIds, cancelledOrderIdsKey],
  );

  const deleteCancelledOrderId = useCallback(
    (orderId: string) => {
      const cancelledOrderIds = getCancelledOrderIds().filter((id) => id !== orderId);
      localStorage.setItem(cancelledOrderIdsKey, JSON.stringify(cancelledOrderIds));
    },
    [getCancelledOrderIds, cancelledOrderIdsKey],
  );

  return {
    getCancelledOrderIds,
    addCancelledOrderId,
    deleteCancelledOrderId,
  };
};

export const useOptimisticAddOrder = () => {
  const queryClient = useQueryClient();
  const { account } = useTwapContext();
  const queryKey = useOrdersQueryKey();
  return useCallback(
    (order: Order) => {
      queryClient.setQueryData(queryKey, (orders?: Order[]) => {
        if (!orders) return [order];
        if (orders?.some((o) => o.id === order.id)) return orders;
        return [order, ...orders];
      });
    },
    [queryClient, queryKey, account],
  );
};

export const useOptimisticCancelOrder = () => {
  const queryClient = useQueryClient();
  const queryKey = useOrdersQueryKey();
  const persistedOrdersStore = usePersistedOrdersStore();
  return useCallback(
    (orderIds: string[]) => {
      orderIds.forEach((orderId) => {
        persistedOrdersStore.addCancelledOrderId(orderId);
      });

      queryClient.setQueryData(queryKey, (orders?: Order[]) => {
        if (!orders) return [];
        return orders.map((order) => {
          if (orderIds.includes(order.id)) {
            return { ...order, status: OrderStatus.Canceled };
          }
          return order;
        });
      });
    },
    [queryClient, queryKey, persistedOrdersStore.addCancelledOrderId],
  );
};

const useHandlePersistedCancelledOrders = () => {
  const { getCancelledOrderIds, deleteCancelledOrderId } = usePersistedOrdersStore();
  return useCallback(
    (orders: Order[]) => {
      const cancelledOrderIds = new Set(getCancelledOrderIds());
      orders.forEach((order, index) => {
        if (cancelledOrderIds.has(order.id)) {
          if (order.status !== OrderStatus.Canceled) {
            console.log(`Marking order as cancelled: ${order.id}`);
            orders[index] = { ...order, status: OrderStatus.Canceled };
          } else {
            console.log(`Removing cancelled ID for already-cancelled order: ${order.id}`);
            deleteCancelledOrderId(order.id);
          }
        }
      });
    },
    [getCancelledOrderIds, deleteCancelledOrderId],
  );
};

export const useOrdersQuery = () => {
  const { account, config, chainId, callbacks } = useTwapContext();
  const queryKey = useOrdersQueryKey();
  const queryClient = useQueryClient();
  const handlePersistedCancelledOrders = useHandlePersistedCancelledOrders();
  const query = useQuery(
    queryKey,
    async ({ signal }) => {
      const orders = await getAccountOrders({ signal, chainId: chainId!, config: config?.twapConfig, account: account! });
      handlePersistedCancelledOrders(orders);
      let isProgressUpdated = false;
      const prevOrders = queryClient.getQueryData(queryKey) as Order[];
      const updatedOrders: Order[] = [];

      if (prevOrders) {
        prevOrders.forEach((prevOrder) => {
          const currentOrder = orders.find((o) => o.id === prevOrder.id);
          if (currentOrder && currentOrder.progress !== prevOrder.progress) {
            isProgressUpdated = true;
            updatedOrders.push(currentOrder);
          }
        });
      }

      if (isProgressUpdated) {
        callbacks?.onOrdersProgressUpdate?.(updatedOrders);
        callbacks?.refetchBalances?.();
      }

      return orders.map((order) => {
        if (config?.twapConfig) {
          return { ...order, fillDelayMillis: getOrderFillDelayMillis(order, config.twapConfig) };
        }
        return order;
      });
    },
    {
      enabled: Boolean(account && chainId && config),
      refetchInterval: REFETCH_ORDER_HISTORY,
      refetchOnWindowFocus: true,
      retry: false,
      staleTime: Infinity,
    },
  );

  return {
    ...query,
    isLoading: Boolean(account && query.isLoading),
  };
};

export const useOrders = () => {
  const { data: orders, isLoading, error, refetch, isRefetching } = useOrdersQuery();
  const { mutateAsync: cancelOrder } = useCancelOrderMutation();

  return useMemo(() => {
    return {
      orders: {
        all: orders ?? [],
        open: filterAndSortOrders(orders ?? [], OrderStatus.Open),
        completed: filterAndSortOrders(orders ?? [], OrderStatus.Completed),
        expired: filterAndSortOrders(orders ?? [], OrderStatus.Expired),
        canceled: filterAndSortOrders(orders ?? [], OrderStatus.Canceled),
      },
      isLoading,
      error,
      refetch: () => refetch().then((it) => it.data),
      cancelOrder,
      isRefetching,
    };
  }, [orders, isLoading, error, refetch, cancelOrder, isRefetching]);
};

export const useOrderToDisplay = () => {
  const selectedStatus = useTwapStore((s) => s.state.orderHistoryStatusFilter);
  const { orders } = useOrders();
  return useMemo(() => {
    if (!selectedStatus) {
      return orders.all;
    }

    return orders.all.filter((order) => order.status.toLowerCase() === selectedStatus.toLowerCase()) || [];
  }, [selectedStatus, orders]);
};

const filterAndSortOrders = (orders: Order[], status: OrderStatus) => {
  return orders.filter((order) => order.status === status).sort((a, b) => b.createdAt - a.createdAt);
};

export const useOrderLimitPrice = (srcToken?: Token, dstToken?: Token, order?: Order) => {
  return useMemo(() => {
    if (!srcToken || !dstToken || !order || order?.isMarketPrice) return;
    return getOrderLimitPriceRate(order, srcToken?.decimals, dstToken?.decimals);
  }, [order, srcToken, dstToken]);
};

export const useOrderAvgExcecutionPrice = (srcToken?: Token, dstToken?: Token, order?: Order) => {
  return useMemo(() => {
    if (!srcToken || !dstToken || !order) return;
    return getOrderExcecutionRate(order, srcToken.decimals, dstToken.decimals);
  }, [order, srcToken, dstToken]);
};

export const useSelectedOrderIdsToCancel = () => {
  const updateState = useTwapStore((s) => s.updateState);
  const orderIdsToCancel = useTwapStore((s) => s.state.orderIdsToCancel);
  return useCallback(
    (id: string) => {
      if (orderIdsToCancel?.includes(id)) {
        updateState({ orderIdsToCancel: orderIdsToCancel?.filter((orderId) => orderId !== id) });
      } else {
        updateState({ orderIdsToCancel: [...(orderIdsToCancel || []), id] });
      }
    },
    [updateState, orderIdsToCancel],
  );
};
