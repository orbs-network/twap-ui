import { Abi, eqIgnoreCase, erc20, estimateGasPrice, isNativeAddress, setWeb3Instance } from "@defi.org/web3-candies";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import BN from "bignumber.js";
import { useCallback, useMemo, useRef } from "react";
import { feeOnTransferDetectorAddresses, AMOUNT_TO_BORROW, REFETCH_GAS_PRICE, STALE_ALLOWANCE, REFETCH_BALANCE, REFETCH_ORDER_HISTORY } from "../consts";
import { useTwapContext } from "../context/context";
import { QueryKeys } from "../enums";
import FEE_ON_TRANSFER_ABI from "../abi/FEE_ON_TRANSFER.json";
import { amountBNV2, compact, getTheGraphUrl, groupBy, logger, orderBy } from "../utils";
import { HistoryOrder, OrdersData, Status, Token } from "../types";
import { useGetHasAllowance, useGetTokenFromParsedTokensList, useNetwork } from "./hooks";
import { ordersStore } from "../store";
import { getGraphOrders } from "../order-history";
import { useSrcAmount } from "./lib";

export const useMinNativeTokenBalance = (minNativeTokenBalance?: string) => {
  const { web3, account, config } = useTwapContext();
  const network = useNetwork();
  const key = ["useHasMinNativeTokenBalance", account, config.chainId, minNativeTokenBalance];
  const queryClient = useQueryClient();
  const query = useQuery(
    key,
    async () => {
      const balance = await web3!.eth.getBalance(account!);
      return BN(balance).gte(amountBNV2(network?.native.decimals, minNativeTokenBalance!));
    },
    {
      enabled: !!web3 && !!minNativeTokenBalance && !!account && !!config && !!network,
      staleTime: Infinity,
    },
  );

  const ensureData = useCallback(() => {
    return queryClient.ensureQueryData<ReturnType<typeof query.refetch>>(key);
  }, [queryClient, key]);

  return {
    ...query,
    ensureData,
  };
};

const useGetContract = () => {
  const web3 = useTwapContext().web3;

  return useCallback(
    (abi: Abi, address: string) => {
      if (!web3) return undefined;
      return new web3.eth.Contract(abi as any, address);
    },
    [web3],
  );
};

export const useFeeOnTransfer = (tokenAddress?: string) => {
  const { config } = useTwapContext();

  const address = useMemo(() => {
    if (!config.chainId) return undefined;
    return feeOnTransferDetectorAddresses[config.chainId as keyof typeof feeOnTransferDetectorAddresses];
  }, [config.chainId]);

  const network = useNetwork();

  const getContract = useGetContract();

  return useQuery({
    queryFn: async () => {
      try {
        const contract = getContract(FEE_ON_TRANSFER_ABI as any, address!);
        if (!contract) {
          return null;
        }
        const res = await contract?.methods.validate(tokenAddress, network?.wToken.address, AMOUNT_TO_BORROW).call();
        return {
          buyFee: res.buyFeeBps,
          sellFee: res.sellFeeBps,
          hasFeeOnTranfer: BN(res.buyFeeBps).gt(0) || BN(res.sellFeeBps).gt(0),
        };
      } catch (error) {
        return null;
      }
    },
    queryKey: ["useFeeOnTransfer", tokenAddress, config.chainId, address],
    enabled: !!tokenAddress && !!config && !!address && !!network,
    staleTime: Infinity,
  });
};

export const useGasPrice = () => {
  const { web3, maxFeePerGas: contextMax, priorityFeePerGas: contextTip } = useTwapContext();
  const { isLoading, data } = useQuery([QueryKeys.GET_GAS_PRICE, contextTip, contextMax], () => estimateGasPrice(undefined, undefined, web3), {
    enabled: !!web3,
    refetchInterval: REFETCH_GAS_PRICE,
  });

  const priorityFeePerGas = BN.max(data?.fast.tip || 0, contextTip || 0);
  const maxFeePerGas = BN.max(data?.fast.max || 0, contextMax || 0, priorityFeePerGas);

  return {
    isLoading,
    maxFeePerGas,
    priorityFeePerGas,
  };
};

const useAllowance = () => {
  const { srcToken, config, account } = useTwapContext();
  const srcAmount = useSrcAmount().amount;
  const getHasAllowance = useGetHasAllowance();

  const query = useQuery(
    [QueryKeys.GET_ALLOWANCE, config.chainId, srcToken?.address, srcAmount],
    async () => {
      return getHasAllowance(srcToken!, srcAmount);
    },
    {
      enabled: !!srcToken && BN(srcAmount).gt(0) && !!account && !!config,
      staleTime: STALE_ALLOWANCE,
      refetchOnWindowFocus: true,
    },
  );

  return { ...query, isLoading: query.isLoading && query.fetchStatus !== "idle" };
};

export const useBalance = (token?: Token, onSuccess?: (value: BN) => void, staleTime?: number) => {
  const { web3, account } = useTwapContext();

  const query = useQuery(
    [QueryKeys.GET_BALANCE, account, token?.address],
    () => {
      setWeb3Instance(web3);
      if (isNativeAddress(token!.address)) return web3!.eth.getBalance(account!).then(BN);
      else return erc20(token!.symbol, token!.address, token!.decimals).methods.balanceOf(account!).call().then(BN);
    },
    {
      enabled: !!web3 && !!token && !!account,
      onSuccess,
      refetchInterval: REFETCH_BALANCE,
      staleTime,
    },
  );
  return { ...query, isLoading: query.isLoading && query.fetchStatus !== "idle" && !!token };
};

const useOrderHistoryKey = () => {
  const { config, account } = useTwapContext();

  return [QueryKeys.GET_ORDER_HISTORY, account, config.exchangeAddress, config.chainId];
};

const useAddNewOrder = () => {
  const QUERY_KEY = useOrderHistoryKey();
  const queryClient = useQueryClient();
  const config = useTwapContext().config;

  return useCallback(
    (order: HistoryOrder) => {
      try {
        if (!config) return;
        ordersStore.addOrder(config.chainId, order);
        queryClient.setQueryData(QUERY_KEY, (prev?: OrdersData) => {
          const updatedOpenOrders = prev?.Open ? [order, ...prev.Open] : [order];
          if (!prev) {
            return {
              Open: updatedOpenOrders,
            };
          }
          return {
            ...prev,
            Open: updatedOpenOrders,
          };
        });
      } catch (error) {}
    },
    [QUERY_KEY, queryClient, config],
  );
};

const useUpdateOrderStatusToCanceled = () => {
  const QUERY_KEY = useOrderHistoryKey();
  const queryClient = useQueryClient();
  const config = useTwapContext().config;

  return useCallback(
    (orderId: number) => {
      try {
        ordersStore.cancelOrder(config.chainId, orderId);
        queryClient.setQueryData(QUERY_KEY, (prev?: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            [Status.Open]: prev[Status.Open].map((o: HistoryOrder) => {
              if (o.id === orderId) {
                return {
                  ...o,
                  status: Status.Canceled,
                };
              }
              return o;
            }),
          };
        });
      } catch (error) {
        console.error(error);
      }
    },
    [QUERY_KEY, queryClient, config],
  );
};

export const useOrdersHistory = () => {
  const { tokens, state, config, account } = useTwapContext();

  const QUERY_KEY = useOrderHistoryKey();
  const getTokensFromTokensList = useGetTokenFromParsedTokensList();

  const query = useQuery<OrdersData>(
    QUERY_KEY,
    async ({ signal }) => {
      const endpoint = getTheGraphUrl(config.chainId);
      if (!endpoint) {
        return [];
      }
      let orders = await getGraphOrders(endpoint, account!, signal);

      try {
        const ids = orders.map((o) => o.id);
        let chainOrders = ordersStore.orders[config.chainId];

        chainOrders.forEach((o: any) => {
          if (!ids.includes(Number(o.id))) {
            orders.push(o);
          } else {
            ordersStore.deleteOrder(config.chainId, o.id);
          }
        });
      } catch (error) {}
      logger("all orders", orders);

      orders = orders.filter((o) => eqIgnoreCase(config.exchangeAddress, o.exchange || ""));
      logger("filtered orders by exchange address", config.exchangeAddress, orders);
      orders = orders.map((order) => {
        return {
          ...order,
          srcToken: getTokensFromTokensList(order.srcTokenAddress),
          dstToken: getTokensFromTokensList(order.dstTokenAddress),
        };
      });
      let result = compact(orders.filter((o) => o.srcToken && o.dstToken));
      result = orderBy(result, (o) => o.createdAt, "desc");
      result = groupBy(result, "status");

      return result as any;
    },
    {
      enabled: !!config && tokens?.length > 10 && !state.showConfirmation && !!account,
      refetchInterval: REFETCH_ORDER_HISTORY,
      onError: (error: any) => console.log(error),
      refetchOnWindowFocus: true,
      retry: 5,
      staleTime: Infinity,
    },
  );

  return { ...query, orders: query.data || {}, isLoading: query.isLoading && query.fetchStatus !== "idle" };
};

export const query = {
  useFeeOnTransfer,
  useGasPrice,
  useMinNativeTokenBalance,
  useBalance,
  useOrdersHistory,
  useAllowance,
  useAddNewOrder,
  useUpdateOrderStatusToCanceled,
};
