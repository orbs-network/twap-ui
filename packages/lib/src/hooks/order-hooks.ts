import { buildOrder, Config, getOrderFillDelayMillis, Order, OrderStatus } from "@orbs-network/twap-sdk";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import { REFETCH_ORDER_HISTORY } from "../consts";
import moment from "moment";
import { useTwapContext } from "../context";
import { TwapOrder, Token } from "../types";
import { useCancelOrder } from "./send-transactions-hooks";

const useKey = (config: Config) => {
  const { account } = useTwapContext();
  return useMemo(() => ["useTwapOrderHistoryManager", account, config.exchangeAddress, config.chainId], [account, config]);
};

export const usePersistedOrdersStore = (config: Config) => {
  const { account } = useTwapContext();

  const queryKey = useKey(config);
  const queryClient = useQueryClient();
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
    (orderId: number, txHash: string, params: string[], srcToken: Token, dstToken: Token) => {
      const _order = buildOrder({
        srcAmount: params[3],
        srcTokenAddress: srcToken!.address,
        dstTokenAddress: dstToken!.address,
        srcAmountPerChunk: params[4],
        deadline: Number(params[6]) * 1000,
        dstMinAmountPerChunk: params[5],
        tradeDollarValueIn: "",
        blockNumber: 0,
        id: orderId,
        fillDelay: Number(params[8]),
        createdAt: moment().utc().valueOf(),
        txHash,
        maker: account!,
        exchange: config.exchangeAddress,
        twapAddress: config.twapAddress,
        srcTokenSymbol: srcToken.symbol,
        dstTokenSymbol: dstToken.symbol,
        chainId: config.chainId,
      });

      const order: TwapOrder = {
        ..._order,
        fillDelayMillis: getOrderFillDelayMillis(_order, config),
      };

      const orders = getCreatedOrders();
      if (orders.some((o) => o.id === order.id)) return;
      orders.push(order);
      localStorage.setItem(ordersKey, JSON.stringify(orders));
      queryClient.setQueryData(queryKey, (orders?: TwapOrder[]) => {
        return !orders ? [order] : [order, ...orders];
      });
    },
    [getCreatedOrders, ordersKey, queryClient, queryKey],
  );
  const addCancelledOrderId = useCallback(
    (orderId: number) => {
      const cancelledOrderIds = getCancelledOrderIds();
      if (!cancelledOrderIds.includes(orderId)) {
        // `.includes()` is more readable for arrays
        cancelledOrderIds.push(orderId);
        localStorage.setItem(cancelledOrderIdsKey, JSON.stringify(cancelledOrderIds));
        queryClient.setQueryData(queryKey, (orders?: TwapOrder[]) => {
          if (!orders) return [];
          return orders.map((order) => {
            if (order.id === orderId) {
              return { ...order, status: OrderStatus.Canceled };
            }
            return order;
          });
        });
      }
    },
    [getCancelledOrderIds, cancelledOrderIdsKey, queryClient, queryKey],
  );
  const deleteCreatedOrder = useCallback(
    (id: number) => {
      const orders = getCreatedOrders().filter((order) => order.id !== id);
      localStorage.setItem(ordersKey, JSON.stringify(orders));
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

const useOrdersQuery = (config: Config) => {
  const { account, twapSDK, publicClient } = useTwapContext();
  const queryKey = useKey(config);
  const { getCreatedOrders, getCancelledOrderIds, deleteCreatedOrder, deleteCancelledOrderId } = usePersistedOrdersStore(config);
  const query = useQuery(
    queryKey,
    async ({ signal }) => {
      if (!publicClient) throw new Error("publicClient is not defined");
      const orders = await twapSDK.getOrders(account!, signal);
      // we add orders to the local storage if they are not in the orders array

      getCreatedOrders().forEach((localStorageOrder) => {
        if (orders.some((order) => order.id === localStorageOrder.id)) {
          console.log(`removing order: ${localStorageOrder.id}`);
          deleteCreatedOrder(localStorageOrder.id);
        } else {
          console.log(`adding order: ${localStorageOrder.id}`);
          orders.unshift(localStorageOrder);
        }
      });

      const canceledOrders = new Set(getCancelledOrderIds());

      return orders.map((order): TwapOrder => {
        let status = order.status;
        if (canceledOrders.has(order.id)) {
          if (status !== OrderStatus.Canceled) {
            console.log(`Cancelled added: ${order.id}`);
            status = OrderStatus.Canceled;
          } else {
            console.log(`Cancelled removed: ${order.id}`);
            deleteCancelledOrderId(order.id);
          }
        }
        return { ...order, fillDelayMillis: getOrderFillDelayMillis(order, config) };
      });
    },
    {
      enabled: Boolean(config && account),
      refetchInterval: REFETCH_ORDER_HISTORY,
      refetchOnWindowFocus: true,
      retry: 3,
      staleTime: Infinity,
    },
  );

  return {
    ...query,
    isLoading: Boolean(account && query.isLoading),
  };
};

export const useOrders = (config?: Config) => {
  const { config: contextConfig } = useTwapContext();
  const { data: orders, isLoading, error, refetch, isRefetching } = useOrdersQuery(config ?? contextConfig);
  const { mutateAsync: cancelOrder } = useCancelOrder();

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

const filterAndSortOrders = (orders: TwapOrder[], status: OrderStatus) => {
  return orders.filter((order) => order.status === status).sort((a, b) => b.createdAt - a.createdAt);
};
