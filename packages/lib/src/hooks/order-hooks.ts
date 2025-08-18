import { buildOrder, getOrderFillDelayMillis, getUserOrders, Order, OrderStatus } from "@orbs-network/twap-sdk";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import { REFETCH_ORDER_HISTORY } from "../consts";
import moment from "moment";
import { useTwapContext } from "../context";
import { Module, Token } from "../types";
import { useCancelOrder } from "./use-cancel-order";
import { useTwapStore } from "../useTwapStore";
import { getOrderType } from "../utils";
import { useChunks } from "./use-chunks";
import { useOrderHistoryContext } from "../twap/orders/context";

export const useOrderType = () => {
  const { chunks } = useChunks();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  return useMemo(() => getOrderType(isMarketOrder || false, chunks), [chunks, isMarketOrder]);
};

export const useOrderName = (isMarketOrder = false, chunks = 1) => {
  const { translations: t, module } = useTwapContext();
  return useMemo(() => {
    if (module === Module.STOP_LOSS) {
      return t.stopLoss;
    }
    if (module === Module.TAKE_PROFIT) {
      return t.takeProfit;
    }
    if (isMarketOrder) {
      return t.twapMarket;
    }
    if (chunks === 1) {
      return t.limit;
    }
    return t.twapLimit;
  }, [t, isMarketOrder, chunks, module]);
};

const useOrdersQueryKey = () => {
  const { account, config } = useTwapContext();
  return useMemo(() => ["useTwapOrderHistoryManager", account, config.exchangeAddress, config.chainId], [account, config]);
};

export const usePersistedOrdersStore = () => {
  const { account, config } = useTwapContext();

  const ordersKey = `orders-${account}-${config.exchangeAddress}`;
  const cancelledOrderIdsKey = `cancelled-orders-${account}-${config.exchangeAddress}`;

  const getCreatedOrders = useCallback((): Order[] => {
    const res = localStorage.getItem(ordersKey);
    if (!res) return [];
    return JSON.parse(res);
  }, [ordersKey]);

  const getCancelledOrderIds = useCallback((): number[] => {
    const res = localStorage.getItem(cancelledOrderIdsKey);
    if (!res) return [];
    return JSON.parse(res);
  }, [cancelledOrderIdsKey]);

  const addCreatedOrder = useCallback(
    (order: Order) => {
      const orders = getCreatedOrders();
      if (orders.some((o) => o.id === order.id)) return;
      orders.push(order);
      localStorage.setItem(ordersKey, JSON.stringify(orders));
    },
    [getCreatedOrders, ordersKey],
  );
  const addCancelledOrderId = useCallback(
    (orderId: number) => {
      const cancelledOrderIds = getCancelledOrderIds();
      if (!cancelledOrderIds.includes(orderId)) {
        // `.includes()` is more readable for arrays
        cancelledOrderIds.push(orderId);
        localStorage.setItem(cancelledOrderIdsKey, JSON.stringify(cancelledOrderIds));
      }
    },
    [getCancelledOrderIds, cancelledOrderIdsKey],
  );
  const deleteCreatedOrder = useCallback(
    (id: number) => {
      // const orders = getCreatedOrders().filter((order) => order.id !== id);
      // localStorage.setItem(ordersKey, JSON.stringify(orders));
    },
    [getCreatedOrders, ordersKey],
  );
  const deleteCancelledOrderId = useCallback(
    (orderId: number) => {
      const cancelledOrderIds = getCancelledOrderIds().filter((id) => id !== orderId);
      localStorage.setItem(cancelledOrderIdsKey, JSON.stringify(cancelledOrderIds));
    },
    [getCancelledOrderIds, cancelledOrderIdsKey],
  );

  return {
    getCreatedOrders,
    getCancelledOrderIds,
    addCreatedOrder,
    addCancelledOrderId,
    deleteCreatedOrder,
    deleteCancelledOrderId,
  };
};

export const useOptimisticAddOrder = () => {
  const persistedOrdersStore = usePersistedOrdersStore();
  const queryClient = useQueryClient();
  const { account, config } = useTwapContext();
  const queryKey = useOrdersQueryKey();
  return useCallback(
    (orderId: number, txHash: string, params: string[], srcToken: Token, dstToken: Token) => {
      const order = buildOrder({
        srcAmount: params[3],
        srcTokenAddress: srcToken!.address,
        dstTokenAddress: dstToken!.address,
        srcAmountPerChunk: params[4],
        deadline: Number(params[6]) * 1000,
        dstMinAmountPerChunk: params[5],
        tradeDollarValueIn: "",
        blockNumber: 0,
        id: "",
        fillDelay: Number(params[8]),
        createdAt: moment().utc().valueOf(),
        txHash,
        maker: account!,
        exchange: config.exchangeAddress,
        twapAddress: config.twapAddress,
        chainId: config.chainId,
        status: OrderStatus.Open,
      });

      persistedOrdersStore.addCreatedOrder(order);
      queryClient.setQueryData(queryKey, (orders?: Order[]) => {
        if (!orders) return [order];
        if (orders?.some((o) => o.id === order.id)) return orders;
        return [order, ...orders];
      });
    },
    [persistedOrdersStore.addCreatedOrder, queryClient, queryKey, config, account],
  );
};

export const useOptimisticCancelOrder = () => {
  const queryClient = useQueryClient();
  const queryKey = useOrdersQueryKey();
  const persistedOrdersStore = usePersistedOrdersStore();
  return useCallback(
    (orderId: number) => {
      persistedOrdersStore.addCancelledOrderId(orderId);

      queryClient.setQueryData(queryKey, (orders?: Order[]) => {
        if (!orders) return [];
        return orders.map((order) => {
          // if (order.id === orderId) {
          //   return { ...order, status: OrderStatus.Canceled };
          // }
          return order;
        });
      });
    },
    [queryClient, queryKey, persistedOrdersStore.addCancelledOrderId],
  );
};

const useHandlePersistedOrders = () => {
  const { getCreatedOrders, getCancelledOrderIds, deleteCreatedOrder, deleteCancelledOrderId } = usePersistedOrdersStore();
  const { config } = useTwapContext();
  return useCallback(
    (orders: Order[]) => {
      getCreatedOrders().forEach((localStorageOrder) => {
        if (orders.some((order) => order.id.toString() === localStorageOrder.id.toString())) {
          console.log(`removing order: ${localStorageOrder.id}`);
          // deleteCreatedOrder(localStorageOrder.id);
        } else {
          console.log(`adding order: ${localStorageOrder.id}`);
          orders.unshift(localStorageOrder);
        }
      });
      const cancelledOrderIds = new Set(getCancelledOrderIds());

      orders.forEach((order, index) => {
        if (cancelledOrderIds.has(Number(order.id))) {
          if (order.status !== OrderStatus.Canceled) {
            console.log(`Marking order as cancelled: ${order.id}`);
            orders[index] = { ...order, status: OrderStatus.Canceled };
          } else {
            console.log(`Removing cancelled ID for already-cancelled order: ${order.id}`);
            // deleteCancelledOrderId(order.id);
          }
        }
      });
    },
    [getCreatedOrders, deleteCreatedOrder, getCancelledOrderIds, deleteCancelledOrderId, config],
  );
};

const useOrdersQuery = () => {
  const { account, config } = useTwapContext();
  const queryKey = useOrdersQueryKey();
  const handlePersistedOrders = useHandlePersistedOrders();
  const query = useQuery(
    queryKey,
    async ({ signal }) => {
      const orders: Order[] = await getUserOrders(config, account!, signal);
      console.log({ orders });

      handlePersistedOrders(orders);

      return orders.map((order) => {
        return { ...order, fillDelayMillis: getOrderFillDelayMillis(order, config) };
      });
    },
    {
      enabled: Boolean(config && account),
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
  const { callback: cancelOrder } = useCancelOrder();

  return useMemo(() => {
    return {
      orders: {
        all: orders ?? [],
        [OrderStatus.Open]: filterAndSortOrders(orders ?? [], OrderStatus.Open),
        [OrderStatus.Completed]: filterAndSortOrders(orders ?? [], OrderStatus.Completed),
        [OrderStatus.Expired]: filterAndSortOrders(orders ?? [], OrderStatus.Expired),
        [OrderStatus.Canceled]: filterAndSortOrders(orders ?? [], OrderStatus.Canceled),
      },
      isLoading,
      error,
      refetch: () => refetch().then((it) => it.data),
      cancelOrder,
      isRefetching,
    };
  }, [orders, isLoading, error, refetch, cancelOrder, isRefetching]);
};

const filterAndSortOrders = (orders: Order[], status: OrderStatus) => {
  return orders.filter((order) => order.status === status).sort((a, b) => b.createdAt - a.createdAt);
};

export const useOrderHistoryPanel = () => {
  const { orders, isLoading: orderLoading, refetch, isRefetching } = useOrders();
  const cancelOrder = useCancelOrder();
  const { isOpen, onClose, onOpen } = useOrderHistoryContext();

  return {
    orders,
    isLoading: orderLoading,
    refetch,
    isRefetching,
    isOpen,
    onClose,
    onOpen,
    cancelOrder: cancelOrder.callback,
    openOrdersCount: orders?.OPEN?.length || 0,
    cancelOrderStatus: cancelOrder.status,
    cancelOrderTxHash: cancelOrder.txHash,
    cancelOrderError: cancelOrder.error,
    cancelOrderId: cancelOrder.orderId,
  };
};
