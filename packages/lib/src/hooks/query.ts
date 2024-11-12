import { Abi, eqIgnoreCase, erc20, estimateGasPrice, isNativeAddress, setWeb3Instance } from "@defi.org/web3-candies";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import BN from "bignumber.js";
import { useCallback, useMemo, useRef } from "react";
import { feeOnTransferDetectorAddresses, AMOUNT_TO_BORROW, REFETCH_GAS_PRICE, STALE_ALLOWANCE, REFETCH_BALANCE, REFETCH_ORDER_HISTORY } from "../consts";
import { useTwapContext } from "../context/context";
import { QueryKeys } from "../enums";
import FEE_ON_TRANSFER_ABI from "../abi/FEE_ON_TRANSFER.json";
import { Token } from "../types";
import { useGetHasAllowance, useNetwork } from "./hooks";
import { ordersStore } from "../store";
import { useSrcAmount } from "./lib";
import { Order, OrderStatus, getAllOrders, getOrderById } from "@orbs-network/twap-sdk";
import { amountBNV2 } from "../utils";

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
    }
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
    [web3]
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
        if (!address) return null;
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
    enabled: !!tokenAddress && !!config && !!network,
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
    }
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
    }
  );
  return { ...query, isLoading: query.isLoading && query.fetchStatus !== "idle" && !!token };
};

const useOrderHistoryKey = () => {
  const { config, account } = useTwapContext();

  return [QueryKeys.GET_ORDER_HISTORY, account, config.exchangeAddress, config.chainId];
};

export const useOrderQuery = (orderId?: number) => {
  const chainId = useTwapContext().config.chainId;
  return useQuery(
    ["useOrderQuery", chainId, chainId],
    async ({ signal }) => {
      if (!orderId) return null;
      const result = await getOrderById({ orderId: 79202, chainId: 56, signal });
      return result;
    },
    {
      enabled: !!orderId && !!chainId,
    }
  );
};

const useUpdateOrderStatusToCanceled = () => {
  const QUERY_KEY = useOrderHistoryKey();
  const queryClient = useQueryClient();
  const config = useTwapContext().config;
  const { data: orders, updateData } = useOrdersHistory();

  return useCallback(
    (orderId: number) => {
      ordersStore.cancelOrder(config.chainId, orderId);
      const updatedOrders = orders?.map((order: Order) => (order.id === orderId ? { ...order, status: OrderStatus.Canceled } : order)) as Order[];
      if (updatedOrders) {
        updateData(updatedOrders);
      }
    },
    [QUERY_KEY, queryClient, config]
  );
};

export const useAllOrders = () => {
  const { config } = useTwapContext();
  return useInfiniteQuery(
    ["useAllOrders", config.chainId],
    async ({ signal, pageParam = 0 }) => {
      return getAllOrders({ signal, page: pageParam, limit: 5, chainId: config.chainId });
    },
    {
      getNextPageParam: (lastPage, pages) => {
        return lastPage.length > 0 ? pages.length : undefined; // Return next page number or undefined if no more pages
      },
      getPreviousPageParam: (firstPage) => {
        return firstPage ? undefined : 0; // Modify based on how you paginate backwards
      },
      refetchInterval: REFETCH_ORDER_HISTORY,
      retry: 3,
    }
  );
};
export const useOrdersHistory = () => {
  const { state, config, account, twapSDK } = useTwapContext();

  const QUERY_KEY = useOrderHistoryKey();
  const queryClient = useQueryClient();
  const query = useQuery(
    QUERY_KEY,
    async ({ signal }) => {
      let result: Order[] = [];
      try {
        result = await twapSDK.getUserOrders({ account: account!, signal });
      } catch (error) {
        console.log({ error });
      }

      return result;
    },
    {
      enabled: !!config && !state.showConfirmation && !!account,
      refetchInterval: REFETCH_ORDER_HISTORY,
      onError: (error: any) => console.log(error),
      refetchOnWindowFocus: true,
      retry: 5,
      staleTime: Infinity,
    }
  );

  const updateData = useCallback(
    (orders?: Order[]) => {
      if (!orders) return;
      queryClient.setQueryData(QUERY_KEY, orders);
    },
    [QUERY_KEY, queryClient]
  );

  return useMemo(() => {
    return {
      ...query,
      updateData,
    };
  }, [query, updateData]);
};
export const query = {
  useFeeOnTransfer,
  useGasPrice,
  useMinNativeTokenBalance,
  useBalance,
  useOrdersHistory,
  useAllowance,
  useUpdateOrderStatusToCanceled,
  useAllOrders,
};
