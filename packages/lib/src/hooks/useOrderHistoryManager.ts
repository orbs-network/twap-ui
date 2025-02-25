import { groupOrdersByStatus, RawOrder } from "@orbs-network/twap-sdk";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import { REFETCH_ORDER_HISTORY } from "../consts";
import { useWidgetContext } from "../widget/widget-context";
import moment from "moment";

export const useOrderHistoryManager = () => {
  const { config, isWrongChain, srcToken, dstToken, account, twap } = useWidgetContext();

  const QUERY_KEY = useMemo(() => ["useTwapOrderHistoryManager", account, config.exchangeAddress, config.chainId], [account, config]);

  const query = useQuery(QUERY_KEY, async ({ signal }) => twap.orders.getUserOrders({ account: account!, signal }), {
    enabled: !!config && !!account && !isWrongChain,
    refetchInterval: REFETCH_ORDER_HISTORY,
    refetchOnWindowFocus: true,
    retry: 3,
    staleTime: Infinity,
  });

  const { mutateAsync: addNewOrder } = useMutation({
    mutationFn: async ({ Contract_id, transactionHash }: { Contract_id: number; transactionHash: string }) => {
      const rawOrder: RawOrder = {
        maker: account!,
        Contract_id,
        srcTokenSymbol: srcToken!.symbol,
        ask_srcToken: srcToken!.address,
        ask_dstToken: dstToken!.address,
        dstTokenSymbol: dstToken!.symbol,
        dollarValueIn: "",
        blockNumber: 0,
        ask_srcAmount: twap.submitOrderArgs.params[3],
        transactionHash,
        ask_dstMinAmount: twap.derivedState.destTokenMinAmount,
        exchange: config.exchangeAddress,
        timestamp: moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
        ask_deadline: Number(twap.submitOrderArgs.params[6]),
        dex: "",
        ask_fillDelay: Number(twap.submitOrderArgs.params[8]),
        ask_srcBidAmount: twap.submitOrderArgs.params[4],
      };
      twap.orders.addNewOrder(account!, rawOrder);
      await query.refetch();
    },
  });

  const addCancelledOrder = useCallback(
    async (orderId: number) => {
      if (!account) return;
      twap.orders.addCancelledOrder(account, orderId);
      await query.refetch();
    },
    [account, twap, query],
  );

  const groupedOrdersByStatus = useMemo(() => {
    if (!query.data) return {};
    return groupOrdersByStatus(query.data);
  }, [query.data]);

  return {
    orders: query.data,
    refetchOrders: query.refetch,
    ordersLoading: !account || isWrongChain ? false : query.isLoading,
    addNewOrder,
    addCancelledOrder,
    groupedOrdersByStatus,
  };
};
