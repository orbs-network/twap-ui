import { contract, eqIgnoreCase, estimateGasPrice, isNativeAddress, web3 } from "@defi.org/web3-candies";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import BN from "bignumber.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { feeOnTransferDetectorAddresses, AMOUNT_TO_BORROW, REFETCH_GAS_PRICE, STALE_ALLOWANCE, REFETCH_USD, REFETCH_BALANCE, REFETCH_ORDER_HISTORY } from "../consts";
import { useTwapContext } from "../context/context";
import { QueryKeys } from "../enums";
import FEE_ON_TRANSFER_ABI from "../abi/FEE_ON_TRANSFER.json";
import { amountBN, logger } from "../utils";
import { Configs, Status, TokenData, TWAPLib } from "@orbs-network/twap";
import _ from "lodash";
import { getOrders, waitForOrder } from "../helper";
import { HistoryOrder, OrdersData, TwapLibProps } from "../types";
import { useSrcAmount } from "./hooks";
import { stateActions } from "../context/actions";
import moment from "moment";

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

export const useFeeOnTransfer = (tokenAddress?: string) => {
  const { lib } = useTwapContext();

  const address = useMemo(() => {
    const chainId = lib?.config.chainId;
    if (!chainId) return undefined;
    return feeOnTransferDetectorAddresses[chainId as keyof typeof feeOnTransferDetectorAddresses];
  }, [lib?.config.chainId]);

  return useQuery({
    queryFn: async () => {
      try {
        const _contract = contract(FEE_ON_TRANSFER_ABI as any, address!);
        if (!_contract) {
          return null;
        }
        const res = await _contract?.methods.validate(tokenAddress, lib?.config.wToken.address, AMOUNT_TO_BORROW).call();
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
  const { dappProps, lib } = useTwapContext();
  const { maxFeePerGas: contextMax, priorityFeePerGas: contextTip } = dappProps;
  const { isLoading, data } = useQuery([QueryKeys.GET_GAS_PRICE, contextTip, contextMax], () => estimateGasPrice(), {
    enabled: !!lib,
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
  const { lib, state } = useTwapContext();
  const { srcToken } = state;
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

export const usePriceUSD = (address?: string) => {
  const context = useTwapContext();

  const { lib, isWrongChain, dappProps } = context;

  const _address = address && isNativeAddress(address) ? lib?.config.wToken.address : address;

  const usd = dappProps.usePriceUSD?.(_address);

  const [priceUsdPointer, setPriceUsdPointer] = useState(0);

  useEffect(() => {
    if (dappProps.priceUsd) {
      setPriceUsdPointer((prev) => prev + 1);
    }
  }, [dappProps.priceUsd, setPriceUsdPointer]);

  const query = useQuery(
    [QueryKeys.GET_USD_VALUE, _address, priceUsdPointer],
    async () => {
      const res = await dappProps.priceUsd!(_address!);
      return new BN(res);
    },
    {
      enabled: !!lib && !!_address && !!dappProps.priceUsd,
      refetchInterval: REFETCH_USD,
    }
  );
  const value = new BN(query.data || usd || 0).toString();
  const isLoading = dappProps.priceUsd ? query.isLoading && query.fetchStatus !== "idle" : !usd;

  return {
    value: new BN(value),
    isLoading: !dappProps.account || isWrongChain ? false : isLoading,
  };
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

const filterByDex = (lib: TWAPLib, orders: HistoryOrder[]) => {
  let dex = "";

  switch (lib.config.partner) {
    case Configs.SushiArb.partner:
    case Configs.SushiBase.partner:
      dex = "sushiswap";
      break;

    default:
      break;
  }

  if (dex) {
    return orders.filter((order) => order.dex === dex);
  }
  return orders;
};

export const useOrdersHistory = () => {
  const { dappProps, state } = useTwapContext();
  const { parsedTokens } = dappProps;
  const lib = useTwapContext().lib;
  const QUERY_KEY = [QueryKeys.GET_ORDER_HISTORY, lib?.maker, lib?.config.partner, lib?.config.chainId];

  const query = useQuery<OrdersData>(
    QUERY_KEY,
    async ({ signal }) => {
      let orders = await getOrders(lib!, signal);
      orders = filterByDex(lib!, orders).map((order) => {
        const srcToken = _.find(parsedTokens, (t) => eqIgnoreCase(t.address, order.srcTokenAddress || ""));
        const dstToken = _.find(parsedTokens, (t) => eqIgnoreCase(t.address, order.dstTokenAddress || ""));
        return {
          ...order,
          srcToken,
          dstToken,
        };
      });

      return _.chain(_.compact(orders.filter((o) => o.srcToken && o.dstToken)))
        .orderBy((o) => o.createdAt, "desc")
        .groupBy((o) => o.status)
        .value();
    },
    {
      enabled: !!lib && _.size(parsedTokens) > 0 && !state.showConfirmation,
      refetchInterval: state.waitForOrderId ? undefined : REFETCH_ORDER_HISTORY,
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
  usePriceUSD,
  useBalance,
  useOrdersHistory,
  useAllowance,
};
