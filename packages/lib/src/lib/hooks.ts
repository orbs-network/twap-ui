import { buildOrder, Config, getOrderFillDelayMillis, LensAbi, Order, OrderStatus, TwapSDK } from "@orbs-network/twap-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import { REFETCH_ORDER_HISTORY } from "../consts";
import moment from "moment";
import { PublicClient, Token } from "../types";
import { isSupportedByTheGraph } from "@orbs-network/twap-sdk/dist/lib/utils";
import { getOrderProgress, parseRawStatus } from "@orbs-network/twap-sdk/dist/lib/orders";

const useOrdersQueryKey = (config: Config, account?: string) => {
  return useMemo(() => ["useTwapOrderHistoryManager", account, config.exchangeAddress, config.chainId], [account, config]);
};

export const usePersistedOrdersStore = (config: Config, account?: string) => {
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

export const useOptimisticAddOrder = (config: Config, account?: string) => {
  const persistedOrdersStore = usePersistedOrdersStore(config, account);
  const queryClient = useQueryClient();
  const queryKey = useOrdersQueryKey(config, account);
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
      });

      persistedOrdersStore.addCreatedOrder(order);
      queryClient.setQueryData(queryKey, (orders?: Order[]) => {
        return !orders ? [order] : [order, ...orders];
      });
    },
    [persistedOrdersStore.addCreatedOrder, queryClient, queryKey, config, account],
  );
};

export const useOptimisticCancelOrder = (config: Config, account?: string) => {
  const queryClient = useQueryClient();
  const queryKey = useOrdersQueryKey(config, account);
  const persistedOrdersStore = usePersistedOrdersStore(config, account);
  return useCallback(
    (orderId: number) => {
      queryClient.setQueryData(queryKey, (orders?: Order[]) => {
        if (!orders) return [];
        persistedOrdersStore.addCancelledOrderId(orderId);
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

const useHandlePersistedOrders = (config: Config, account?: string) => {
  const { getCreatedOrders, getCancelledOrderIds, deleteCreatedOrder, deleteCancelledOrderId } = usePersistedOrdersStore(config, account);
  return useCallback(
    (orders: Order[]) => {
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

      orders.forEach((order) => {
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
      });
    },
    [getCreatedOrders, deleteCreatedOrder, getCancelledOrderIds, deleteCancelledOrderId, config],
  );
};

const useGetOrderFromLens = (config: Config, publicClient?: PublicClient, account?: string) => {
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

export const useOrdersQuery = (sdk: TwapSDK, publicClient?: PublicClient, account?: string) => {
  const { mutateAsync: getOrderFromLens } = useGetOrderFromLens(sdk.config, publicClient, account);
  const queryKey = useOrdersQueryKey(sdk.config, account);
  const handlePersistedOrders = useHandlePersistedOrders(sdk.config, account);
  const query = useQuery(
    queryKey,
    async ({ signal }) => {
      if (!publicClient) throw new Error("publicClient is not defined");
      let orders: Order[] = [];
      if (isSupportedByTheGraph(sdk.config.chainId)) {
        orders = await sdk.getOrders(account!, signal);
      } else {
        orders = await getOrderFromLens();
      }

      handlePersistedOrders(orders);
      return orders.map((order) => {
        return { ...order, fillDelayMillis: getOrderFillDelayMillis(order, sdk.config) };
      });
    },
    {
      enabled: Boolean(sdk.config && account),
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
