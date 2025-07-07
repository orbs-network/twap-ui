import { buildOrder, getOrderFillDelayMillis, LensAbi, Order, OrderStatus } from "@orbs-network/twap-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import { REFETCH_ORDER_HISTORY } from "../consts";
import moment from "moment";
import { useTwapContext } from "../context";
import { Token } from "../types";
import { useCancelOrder } from "./send-transactions-hooks";
import { isSupportedByTheGraph } from "@orbs-network/twap-sdk/dist/lib/utils";
import { getOrderProgress, parseRawStatus } from "@orbs-network/twap-sdk/dist/lib/orders";

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
        id: orderId,
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
        return !orders ? [order] : [order, ...orders];
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
          if (order.id === orderId) {
            return { ...order, status: OrderStatus.Canceled };
          }
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
          deleteCreatedOrder(localStorageOrder.id);
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
            deleteCancelledOrderId(order.id);
          }
        }
      });
    },
    [getCreatedOrders, deleteCreatedOrder, getCancelledOrderIds, deleteCancelledOrderId, config],
  );
};

const useGetOrderFromLens = () => {
  const { publicClient, account, config } = useTwapContext();
  return useMutation({
    mutationFn: async () => {
      const result = await publicClient?.readContract({
        address: config.lensAddress as `0x${string}`,
        abi: LensAbi,
        functionName: "makerOrders",
        args: [account],
      });
      return (result as any[])
        .map((o) => {
          const progress = getOrderProgress(o.ask.srcAmount.toString(), o.srcFilledAmount.toString());

          return buildOrder({
            id: o.id.toString(),
            createdAt: o.time * 1000,
            srcTokenAddress: o.ask.srcToken,
            dstTokenAddress: o.ask.dstToken,
            srcAmountPerChunk: o.ask.srcBidAmount.toString(),
            deadline: o.ask.deadline * 1000,
            dstMinAmountPerChunk: o.ask.dstMinAmount.toString(),
            status: parseRawStatus(progress, o.status),
            filledSrcAmount: o.srcFilledAmount.toString(),
            srcAmount: o.ask.srcAmount.toString(),
            tradeDollarValueIn: "",
            fillDelay: o.ask.fillDelay,
            txHash: "",
            maker: account!,
            exchange: o.ask.exchange,
            twapAddress: config.twapAddress,
            chainId: config.chainId,
          });
        })
        .sort((a, b) => b.createdAt - a.createdAt);
    },
  });
};

const useOrdersQuery = () => {
  const { account, twapSDK, publicClient, config } = useTwapContext();
  const { mutateAsync: getOrderFromLens } = useGetOrderFromLens();
  const queryKey = useOrdersQueryKey();
  const handlePersistedOrders = useHandlePersistedOrders();
  const query = useQuery(
    queryKey,
    async ({ signal }) => {
      if (!publicClient) throw new Error("publicClient is not defined");
      let orders: Order[] = [];
      if (isSupportedByTheGraph(config.chainId)) {
        orders = await twapSDK.getOrders(account!, signal);
      } else {
        orders = await getOrderFromLens();
      }

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

const filterAndSortOrders = (orders: Order[], status: OrderStatus) => {
  return orders.filter((order) => order.status === status).sort((a, b) => b.createdAt - a.createdAt);
};
