import { groupOrdersByStatus, Order } from "@orbs-network/twap-sdk";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import { REFETCH_ORDER_HISTORY } from "../consts";
import { QueryKeys } from "../enums";
import { useWidgetContext } from "../widget/widget-context";

export const useOrderHistoryManager = () => {
  const { account, twap, updateState } = useWidgetContext();
  const { config } = useWidgetContext();
  const queryClient = useQueryClient();
  const QUERY_KEY = useMemo(() => [QueryKeys.GET_ORDER_HISTORY, account, config.exchangeAddress, config.chainId], [account, config]);

  const query = useQuery(QUERY_KEY, async ({ signal }) => twap.orders.getUserOrders({ account: account!, signal }), {
    enabled: !!config && !!account,
    refetchInterval: REFETCH_ORDER_HISTORY,
    refetchOnWindowFocus: true,
    retry: 3,
    staleTime: Infinity,
  });

  const updateOrdersData = useCallback(
    (orders?: Order[]) => {
      orders && queryClient.setQueryData(QUERY_KEY, orders);
    },
    [QUERY_KEY, queryClient],
  );

  const { mutateAsync: waitForNewOrder } = useMutation({
    mutationFn: async (orderId?: number) => {
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

  const { mutateAsync: waitForOrderCancellation, isLoading: orderCancellationLoading } = useMutation({
    mutationFn: async (orderId: number) => {
      const orders = await twap.orders.waitForCancelledOrder({ orderId, account });
      updateOrdersData(orders);
    },
  });

  const groupedOrdersByStatus = useMemo(() => {
    if (!query.data) return {};
    return groupOrdersByStatus(query.data);
  }, [query.data]);

  return {
    orders: query.data,
    refetchOrders: query.refetch,
    ordersLoading: query.isLoading,
    waitForNewOrder,
    waitForOrderCancellation,
    orderCancellationLoading,
    groupedOrdersByStatus,
  };
};
