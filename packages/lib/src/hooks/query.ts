import { block, contract, eqIgnoreCase, estimateGasPrice, findBlock, getPastEvents, isNativeAddress, web3 } from "@defi.org/web3-candies";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import BN from "bignumber.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { feeOnTransferDetectorAddresses, AMOUNT_TO_BORROW, REFETCH_GAS_PRICE, STALE_ALLOWANCE, REFETCH_USD, REFETCH_BALANCE, REFETCH_ORDER_HISTORY } from "../consts";
import { useTwapContext } from "../context";
import { QueryKeys } from "../enums";
import FEE_ON_TRANSFER_ABI from "../abi/FEE_ON_TRANSFER.json";
import { amountBN, supportsTheGraphHistory } from "../utils";
import { useTwapStore } from "../store";
import { Status, TokenData } from "@orbs-network/twap";
import _ from "lodash";
import { getOrderFills } from "../helper";
import { OrdersData, ParsedOrder } from "../types";

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
      } catch (error) {}
    },
    queryKey: ["useFeeOnTransfer", tokenAddress, lib?.config.chainId, address],
    enabled: !!tokenAddress && !!lib && !!address,
    staleTime: Infinity,
  });
};

export const useGasPrice = () => {
  const { maxFeePerGas: contextMax, priorityFeePerGas: contextTip, lib } = useTwapContext();
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
  const { amount, srcToken } = useTwapStore((state) => ({
    amount: state.getSrcAmount(),
    srcToken: state.srcToken,
  }));

  const lib = useTwapContext().lib;
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
  console.log(query.error);

  return { ...query, isLoading: query.isLoading && query.fetchStatus !== "idle" };
};

export const usePriceUSD = (address?: string, onSuccess?: (value: BN, isLoading: boolean) => void) => {
  const context = useTwapContext();

  const { lib } = context;

  const _address = address && isNativeAddress(address) ? lib?.config.wToken.address : address;

  const usd = context.usePriceUSD?.(_address);

  const [priceUsdPointer, setPriceUsdPointer] = useState(0);

  useEffect(() => {
    if (context.priceUsd) {
      setPriceUsdPointer((prev) => prev + 1);
    }
  }, [context.priceUsd, setPriceUsdPointer]);

  const query = useQuery(
    [QueryKeys.GET_USD_VALUE, _address, priceUsdPointer],
    async () => {
      const res = await context.priceUsd!(_address!);
      return new BN(res);
    },
    {
      enabled: !!lib && !!_address && !!context.priceUsd,
      refetchInterval: REFETCH_USD,
    }
  );
  const value = new BN(query.data || usd || 0).toString();
  const isLoading = context.priceUsd ? query.isLoading && query.fetchStatus !== "idle" : !usd;
  useEffect(() => {
    onSuccess?.(BN(value), isLoading);
  }, [value, _address, isLoading, onSuccess]);

  return {
    value: new BN(value),
    isLoading,
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

export const useOrdersHistory = () => {
  const tokenList = useTwapContext().parsedTokens;
  const { updateState, showConfirmation } = useTwapStore((state) => ({
    updateState: state.updateState,
    showConfirmation: state.showConfirmation,
    srcToken: state.srcToken,
  }));
  const lib = useTwapContext().lib;
  const QUERY_KEY = [QueryKeys.GET_ORDER_HISTORY, lib?.maker, lib?.config.chainId];

  const query = useQuery<OrdersData>(
    QUERY_KEY,
    async ({ signal }) => {
      const isTheGrapth = supportsTheGraphHistory(lib?.config.chainId);
      let fills = {} as any;
      let orders = [] as any;

      if (isTheGrapth) {
        [orders, fills] = await Promise.all([lib!.getAllOrders(), getOrderFills(lib!.maker, lib!.config.chainId, signal)]);
      } else {
        orders = await lib!.getAllOrders();
      }

      const parsedOrders = _.map(orders, (o): ParsedOrder => {
        const dstAmount = fills?.[o.id]?.dstAmountOut;
        const srcFilled = fills?.[o.id]?.srcAmountIn;
        const dollarValueIn = fills?.[o.id]?.dollarValueIn;
        const dollarValueOut = fills?.[o.id]?.dollarValueOut;

        const srcAmountIn = o.ask.srcAmount;
        const bscProgress =
          !srcFilled || !srcAmountIn
            ? 0
            : BN(srcFilled || "0")
                .dividedBy(srcAmountIn || "0")
                .toNumber();
        const _progress = isTheGrapth ? bscProgress : lib!.orderProgress(o);
        const progress = !_progress ? 0 : _progress < 0.99 ? _progress * 100 : 100;
        const status = () => {
          if (progress === 100) return Status.Completed;
          if (isTheGrapth) {
            // Temporary fix to show open order until the graph is synced.
            if ((o.status === 2 && progress < 100) || o.status > Date.now() / 1000) return Status.Open;
          }
          return lib!.status(o);
        };

        const dstToken = tokenList.find((t) => eqIgnoreCase(o.ask.dstToken, t.address));
        return {
          order: o,
          ui: {
            totalChunks: o.ask.srcAmount.div(o.ask.srcBidAmount).integerValue(BN.ROUND_CEIL).toNumber(),
            status: status(),
            srcToken: tokenList.find((t) => eqIgnoreCase(o.ask.srcToken, t.address)),
            dstToken,
            dstAmount,
            progress,
            srcFilledAmount: srcFilled,
            dollarValueIn,
            dollarValueOut,
          },
        };
      }).filter((o) => o.ui.srcToken && o.ui.dstToken);
      updateState({ waitingForOrdersUpdate: false });
      return _.chain(_.compact(parsedOrders))
        .orderBy((o: ParsedOrder) => o.order.time, "desc")
        .groupBy((o: ParsedOrder) => o.ui.status)
        .value();
    },
    {
      enabled: !!lib && _.size(tokenList) > 0 && !showConfirmation,
      refetchInterval: REFETCH_ORDER_HISTORY,
      onError: (error: any) => console.log(error),
      refetchOnWindowFocus: true,
      retry: 5,
      staleTime: Infinity,
    }
  );
  return { ...query, orders: query.data || {}, isLoading: query.isLoading && query.fetchStatus !== "idle" };
};

export const useOrderPastEvents = (order?: ParsedOrder, enabled?: boolean) => {
  const lib = useTwapContext().lib;
  const [haveValue, setHaveValue] = useState(false);

  const _enabled = haveValue ? true : !!enabled;
  const disableEvents = supportsTheGraphHistory(lib?.config.chainId);

  return useQuery(
    ["useOrderPastEvents", order?.order.id, lib?.maker, order?.ui.progress],
    async () => {
      const orderEndDate = Math.min(order!.order.ask.deadline, (await block()).timestamp);
      const [orderStartBlock, orderEndBlock] = await Promise.all([findBlock(order!.order.time * 1000), findBlock(orderEndDate * 1000)]);
      const events = await getPastEvents({
        contract: lib!.twap,
        eventName: "OrderFilled",
        filter: {
          maker: lib!.maker,
          id: order!.order.id,
        },
        fromBlock: orderStartBlock.number,
        toBlock: orderEndBlock.number,
        // maxDistanceBlocks: 2_000,
      });

      const dstAmountOut = _.reduce(
        events,
        (sum, event) => {
          return sum.plus(event.returnValues.dstAmountOut);
        },
        BN(0)
      );

      return dstAmountOut;
    },
    {
      enabled: !!lib && !!_enabled && !!order && !disableEvents,
      retry: 5,
      staleTime: Infinity,
      onSuccess: () => setHaveValue(true),
    }
  );
};

export const query = {
  useFeeOnTransfer,
  useGasPrice,
  useMinNativeTokenBalance,
  usePriceUSD,
  useBalance,
  useOrdersHistory,
  useOrderPastEvents,
  useAllowance,
};
