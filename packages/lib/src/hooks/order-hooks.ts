import { buildOrder, getOrderExcecutionRate, getOrderFillDelayMillis, getOrderLimitPriceRate, getUserOrders, Order, OrderStatus } from "@orbs-network/twap-sdk";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import { REFETCH_ORDER_HISTORY } from "../consts";
import moment from "moment";
import { useTwapContext } from "../context";
import { Token } from "../types";
import { useCancelOrderMutation } from "./use-cancel-order";

export const useGetOrderName = () => {
  const { translations: t, module } = useTwapContext();
  return useCallback(
    (isMarketOrder = false, chunks = 1) => {
      // if (module === Module.STOP_LOSS) {
      //   return t.stopLoss;
      // }
      // if (module === Module.TAKE_PROFIT) {
      //   return t.takeProfit;
      // }
      if (isMarketOrder) {
        return t.twapMarket;
      }
      if (chunks === 1) {
        return t.limit;
      }
      return t.twapLimit;
    },
    [t, module],
  );
};

export const useOrderName = (isMarketOrder = false, chunks = 1) => {
  const getOrderName = useGetOrderName();
  return useMemo(() => {
    return getOrderName(isMarketOrder, chunks);
  }, [getOrderName, isMarketOrder, chunks]);
};

const useOrdersQueryKey = () => {
  const { account, config } = useTwapContext();
  return useMemo(() => ["useTwapOrderHistoryManager", account, config.exchangeAddress, config.chainId], [account, config]);
};

export const usePersistedOrdersStore = () => {
  const { account, config } = useTwapContext();

  const cancelledOrderIdsKey = `cancelled-orders-${account}-${config.exchangeAddress}`;

  const getCancelledOrderIds = useCallback((): number[] => {
    const res = localStorage.getItem(cancelledOrderIdsKey);
    if (!res) return [];
    return JSON.parse(res);
  }, [cancelledOrderIdsKey]);

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

  const deleteCancelledOrderId = useCallback(
    (orderId: number) => {
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

      queryClient.setQueryData(queryKey, (orders?: Order[]) => {
        if (!orders) return [order];
        if (orders?.some((o) => o.id === order.id)) return orders;
        return [order, ...orders];
      });
    },
    [queryClient, queryKey, config, account],
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
  const { getCancelledOrderIds, deleteCancelledOrderId } = usePersistedOrdersStore();
  const { config } = useTwapContext();
  return useCallback(
    (orders: Order[]) => {
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
    [getCancelledOrderIds, deleteCancelledOrderId, config],
  );
};

const useOrdersQuery = () => {
  const { account, config } = useTwapContext();
  const queryKey = useOrdersQueryKey();
  const handlePersistedOrders = useHandlePersistedOrders();
  const query = useQuery(
    queryKey,
    async ({ signal }) => {
      const orders = await getUserOrders({ signal, config, account: account! });

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
  const { mutateAsync: cancelOrder } = useCancelOrderMutation();

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

export const useOrderLimitPrice = (srcToken?: Token, dstToken?: Token, order?: Order) => {
  return useMemo(() => {
    if (!srcToken || !dstToken || !order || order?.isMarketOrder) return;
    return getOrderLimitPriceRate(order, srcToken?.decimals, dstToken?.decimals);
  }, [order, srcToken, dstToken]);
};

export const useOrderAvgExcecutionPrice = (srcToken?: Token, dstToken?: Token, order?: Order) => {
  return useMemo(() => {
    if (!srcToken || !dstToken || !order) return;
    return getOrderExcecutionRate(order, srcToken.decimals, dstToken.decimals);
  }, [order, srcToken, dstToken]);
};
