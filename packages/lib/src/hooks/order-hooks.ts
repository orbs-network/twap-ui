import { groupOrdersByStatus, LensAbi, Order, RawOrder } from "@orbs-network/twap-sdk";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import { REFETCH_ORDER_HISTORY } from "../consts";
import moment from "moment";
import { useTwapContext } from "../context";
import { Token } from "../types";

const useKey = () => {
  const { config, account } = useTwapContext();
  return useMemo(() => ["useTwapOrderHistoryManager", account, config.exchangeAddress, config.chainId], [account, config]);
};

export const useAddNewOrder = () => {
  const { account, twapSDK, config } = useTwapContext();
  const { refetch } = useAccountOrders();

  const { mutateAsync: callback } = useMutation({
    mutationFn: async ({
      Contract_id,
      transactionHash,
      params,
      srcToken,
      dstToken,
    }: {
      Contract_id: number;
      transactionHash: string;
      params: string[];
      srcToken: Token;
      dstToken: Token;
    }) => {
      const rawOrder: RawOrder = {
        maker: account!,
        Contract_id,
        srcTokenSymbol: srcToken!.symbol,
        ask_srcToken: srcToken!.address,
        ask_dstToken: dstToken!.address,
        dstTokenSymbol: dstToken!.symbol,
        dollarValueIn: "",
        blockNumber: 0,
        ask_srcAmount: params[3],
        transactionHash,
        ask_dstMinAmount: params[5],
        exchange: config.exchangeAddress,
        timestamp: moment().utc().valueOf(),
        ask_deadline: Number(params[6]),
        dex: "",
        ask_fillDelay: Number(params[8]),
        ask_srcBidAmount: params[4],
      };

      twapSDK.addNewOrder(account!, rawOrder);
      await refetch();
    },
  });

  return callback;
};

export const useAccountOrders = () => {
  const { config, isWrongChain, account, twapSDK, publicClient } = useTwapContext();
  const queryKey = useKey();
  const enabled = Boolean(config && account && !isWrongChain);
  const query = useQuery(
    queryKey,
    async ({ signal }) => {
      if (!account) return [];
      try {
        return await twapSDK.getUserOrders({ account: account!, signal });
      } catch (error) {
        if ((error as any).message === "no endpoint found") {
          // fetch on-chain orders
          const lensOrders = (await publicClient?.readContract({
            address: twapSDK.config.lensAddress as `0x${string}`,
            functionName: "makerOrders",
            args: [account],
            abi: LensAbi,
          })) as any[];
          const orders: Order[] = lensOrders.map((it: any): Order => {
            const rawOrder: RawOrder = {
              Contract_id: Number(it.id),
              srcTokenSymbol: "",
              dollarValueIn: "",
              blockNumber: 0,
              maker: it.maker,
              dstTokenSymbol: "",
              ask_fillDelay: it.ask.fillDelay,
              exchange: twapSDK.config.exchangeAddress,
              dex: "",
              ask_deadline: it.ask.deadline,
              timestamp: it.time * 1000,
              ask_srcAmount: it.ask.srcAmount,
              ask_dstMinAmount: it.ask.dstMinAmount.toString(),
              ask_srcBidAmount: it.ask.srcBidAmount.toString(),
              transactionHash: "",
              ask_srcToken: it.ask.srcToken,
              ask_dstToken: it.ask.dstToken,
            };
            const status = () => {
              if (it.status === 1) return "cancelled";
              if (it.status === 2) return "completed";
              if (it.status === 3) return 'expired'
              return "pending";
            }
            const order = new Order(rawOrder, [], status());            
            return order;
          });

          return orders.sort((a, b) => b.createdAt - a.createdAt);
        }
      }
    },
    {
      enabled,
      refetchInterval: REFETCH_ORDER_HISTORY,
      refetchOnWindowFocus: true,
      retry: 3,
      staleTime: Infinity,
    }
  );

  return useMemo(() => {
    return {
      ...query,
      isLoading: enabled ? query.isLoading : false,
    };
  }, [query, enabled]);
};

export const useAddCancelledOrder = () => {
  const { account, twapSDK } = useTwapContext();
  const { refetch } = useAccountOrders();
  return useCallback(
    async (orderId: number) => {
      if (!account) return;
      twapSDK.addCancelledOrder(account, orderId);
      await refetch();
    },
    [account, twapSDK, refetch]
  );
};

export const useGroupedByStatusOrders = () => {
  const { data: orders } = useAccountOrders();
  return useMemo(() => groupOrdersByStatus(orders || []), [orders]);
};
