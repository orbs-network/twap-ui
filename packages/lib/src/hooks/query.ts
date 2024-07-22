import { Abi, eqIgnoreCase, estimateGasPrice, isNativeAddress, web3 } from "@defi.org/web3-candies";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import BN from "bignumber.js";
import { useCallback, useMemo, useRef } from "react";
import { feeOnTransferDetectorAddresses, AMOUNT_TO_BORROW, REFETCH_GAS_PRICE, STALE_ALLOWANCE, REFETCH_BALANCE, REFETCH_ORDER_HISTORY } from "../consts";
import { useTwapContext } from "../context/context";
import { QueryKeys } from "../enums";
import FEE_ON_TRANSFER_ABI from "../abi/FEE_ON_TRANSFER.json";
import { amountBN, compact, groupBy, logger, orderBy } from "../utils";
import { TokenData } from "@orbs-network/twap";
import { getOrders } from "../helper";
import { HistoryOrder, OrdersData } from "../types";
import { useGetTokenFromParsedTokensList, useSrcAmount } from "./hooks";
import { ordersStore } from "../store";

export const useMinNativeTokenBalance = (minNativeTokenBalance?: string) => {
  const lib = useTwapContext().lib;

  return useQuery(
    ["useHasMinNativeTokenBalance", lib?.maker, lib?.config.chainId, minNativeTokenBalance],
    async () => {
      const balance = await web3().eth.getBalance(lib!.maker);
      return BN(balance).gte(amountBN(lib?.config.nativeToken, minNativeTokenBalance!));
    },
    {
      enabled: !!lib?.maker && !!minNativeTokenBalance,
      staleTime: Infinity,
    }
  );
};

const useGetContract = () => {
  const web3 = useTwapContext().web3;

  return useCallback(
    (abi: Abi, address: string) => {
      if (!web3) return undefined;
      return new web3.eth.Contract(abi as any, address);
    },
    [web3]
  );
};

export const useFeeOnTransfer = (tokenAddress?: string) => {
  const { lib } = useTwapContext();

  const address = useMemo(() => {
    const chainId = lib?.config.chainId;
    if (!chainId) return undefined;
    return feeOnTransferDetectorAddresses[chainId as keyof typeof feeOnTransferDetectorAddresses];
  }, [lib?.config.chainId]);

  const getContract = useGetContract();

  return useQuery({
    queryFn: async () => {
      try {
        const contract = getContract(FEE_ON_TRANSFER_ABI as any, address!);
        if (!contract) {
          return null;
        }
        const res = await contract?.methods.validate(tokenAddress, lib?.config.wToken.address, AMOUNT_TO_BORROW).call();
        return {
          buyFee: res.buyFeeBps,
          sellFee: res.sellFeeBps,
          hasFeeOnTranfer: BN(res.buyFeeBps).gt(0) || BN(res.sellFeeBps).gt(0),
        };
      } catch (error) {
        return null;
      }
    },
    queryKey: ["useFeeOnTransfer", tokenAddress, lib?.config.chainId, address],
    enabled: !!tokenAddress && !!lib && !!address,
    staleTime: Infinity,
  });
};

export const useGasPrice = () => {
  const { dappProps, lib, web3 } = useTwapContext();
  const { maxFeePerGas: contextMax, priorityFeePerGas: contextTip } = dappProps;
  const { isLoading, data } = useQuery([QueryKeys.GET_GAS_PRICE, contextTip, contextMax], () => estimateGasPrice(undefined, undefined, web3), {
    enabled: !!lib && !!web3,
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
  const { lib, srcToken } = useTwapContext();
  const amount = useSrcAmount().srcAmountBN;

  const wToken = lib?.config.wToken;
  const query = useQuery(
    [QueryKeys.GET_ALLOWANCE, lib?.config.chainId, srcToken?.address, amount.toString()],
    async () => {
      const isNative = srcToken && isNativeAddress(srcToken?.address);
      return lib!.hasAllowance(isNative ? wToken! : srcToken!, amount);
    },
    {
      enabled: !!lib && !!srcToken && amount.gt(0) && !!wToken,
      staleTime: STALE_ALLOWANCE,
      refetchOnWindowFocus: true,
    }
  );

  return { ...query, isLoading: query.isLoading && query.fetchStatus !== "idle" };
};

export const useBalance = (token?: TokenData, onSuccess?: (value: BN) => void, staleTime?: number) => {
  const lib = useTwapContext().lib;
  const key = [QueryKeys.GET_BALANCE, lib?.maker, token?.address];

  const address = useRef("");
  const client = useQueryClient();

  const query = useQuery(
    key,
    () => {
      if (address.current !== token?.address) {
        onSuccess?.(client.getQueryData(key) || BN(0));
        address.current = token?.address || "";
      }
      return lib!.makerBalance(token!);
    },
    {
      enabled: !!lib && !!token,
      onSuccess,
      refetchInterval: REFETCH_BALANCE,
      staleTime,
    }
  );
  return { ...query, isLoading: query.isLoading && query.fetchStatus !== "idle" && !!token };
};

const useOrderHistoryKey = () => {
  const lib = useTwapContext().lib;

  return [QueryKeys.GET_ORDER_HISTORY, lib?.maker, lib?.config.exchangeAddress, lib?.config.chainId];
};

const useAddNewOrder = () => {
  const QUERY_KEY = useOrderHistoryKey();
  const queryClient = useQueryClient();
  const lib = useTwapContext().lib;

  return useCallback(
    (order: HistoryOrder) => {
      try {
        if (!lib) return;
        ordersStore.addOrder(lib.config.chainId, order);
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
    [QUERY_KEY, queryClient, lib]
  );
};

export const useOrdersHistory = () => {
  const { dappProps, state } = useTwapContext();
  const { parsedTokens } = dappProps;
  const lib = useTwapContext().lib;
  const QUERY_KEY = useOrderHistoryKey();
  const getTokensFromTokensList = useGetTokenFromParsedTokensList();
  const query = useQuery<OrdersData>(
    QUERY_KEY,
    async ({ signal }) => {
      let orders = await getOrders(lib!, signal);
      logger("all orders", orders);
      try {
        const ids = orders.map((o) => o.id);
        let chainOrders = ordersStore.orders[lib!.config.chainId];
        chainOrders.forEach((o: any) => {
          if (!ids.includes(o.id)) {
            orders.push(o);
          } else {
            ordersStore.deleteOrder(lib!.config.chainId, o.id);
          }
        });
      } catch (error) {}
      orders = orders.filter((o) => eqIgnoreCase(lib!.config.exchangeAddress, o.exchange || ""));
      logger("filtered orders by exchange address", lib!.config.exchangeAddress, orders);
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
      enabled: !!lib && parsedTokens?.length > 10 && !state.showConfirmation,
      refetchInterval: REFETCH_ORDER_HISTORY,
      onError: (error: any) => console.log(error),
      refetchOnWindowFocus: true,
      retry: 5,
      staleTime: Infinity,
    }
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
};
