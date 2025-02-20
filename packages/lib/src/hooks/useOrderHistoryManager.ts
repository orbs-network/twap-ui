import { groupOrdersByStatus, Order, OrderStatus } from "@orbs-network/twap-sdk";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import { REFETCH_ORDER_HISTORY } from "../consts";
import { useWidgetContext } from "../widget/widget-context";

export const useOrderHistoryManager = () => {
  const { account, twap, updateState, isWrongChain } = useWidgetContext();

  const { config } = useWidgetContext();
  const queryClient = useQueryClient();
  const QUERY_KEY = useMemo(() => ["useTwapOrderHistoryManager", account, config.exchangeAddress, config.chainId], [account, config]);

  const query = useQuery(QUERY_KEY, async ({ signal }) => twap.orders.getUserOrders({ account: account!, signal }), {
    enabled: !!config && !!account && !isWrongChain,
    refetchInterval: REFETCH_ORDER_HISTORY,
    refetchOnWindowFocus: true,
    retry: 3,
    staleTime: Infinity,
  });

  const updateOrdersData = useCallback(
    (orders?: Order[]) => {
      orders && queryClient.setQueryData(QUERY_KEY, orders);
    },
    [QUERY_KEY, queryClient]
  );

  const { mutateAsync: waitForNewOrder } = useMutation({
    mutationFn: async (orderId?: number) => {
      if (!account) return;
      try {
        updateState({ newOrderLoading: true });
        const orders = await twap.orders.waitForCreatedOrder({ orderId, account, currentOrdersLength: query.data?.length });
        updateOrdersData(orders);
      } catch (error) {
        console.error(error);
      } finally {
        updateState({ newOrderLoading: false });
      }
    },
  });

  const onOrderCancelled = useCallback(
    (orderId: number) => {
      const data = query.data?.map((order) => {
        if (order.id === orderId) {
          return { ...order, status: OrderStatus.Canceled };
        }
        return order;
      });
      updateOrdersData(data);
    },
    [query.data, updateOrdersData]
  );

  const groupedOrdersByStatus = useMemo(() => {
    if (!query.data) return {};
    return groupOrdersByStatus(query.data);
  }, [query.data]);

  return {
    orders: query.data,
    refetchOrders: query.refetch,
    ordersLoading: !account || isWrongChain ? false : query.isLoading,
    waitForNewOrder,
    onOrderCancelled,
    groupedOrdersByStatus,
  };
};
