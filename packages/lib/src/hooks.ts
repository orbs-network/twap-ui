import { Order, Paraswap, TokenData, TokensValidation, TWAPLib } from "@orbs-network/twap";
import { useOrdersContext, useTwapContext } from "./context";
import Web3 from "web3";
import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import BN from "bignumber.js";
import { InitLibProps, OrderUI } from "./types";
import _ from "lodash";
import { analytics } from "./analytics";
import { eqIgnoreCase, setWeb3Instance, switchMetaMaskNetwork, zeroAddress } from "@defi.org/web3-candies";
import { parseOrderUi, useTwapStore } from "./store";
import { REFETCH_BALANCE, REFETCH_GAS_PRICE, REFETCH_ORDER_HISTORY, REFETCH_USD, STALE_ALLOWANCE } from "./consts";
import { QueryKeys } from "./enums";

/**
 * Actions
 */

export const useResetStoreAndQueries = () => {
  const resetTwapStore = useTwapStore((state) => state.reset);
  const client = useQueryClient();

  return () => {
    client.invalidateQueries();
    resetTwapStore();
  };
};

const useResetStoreWithLibAndQueries = () => {
  const resetTwapStore = useTwapStore((state) => state.resetWithLib);
  const client = useQueryClient();

  return () => {
    client.invalidateQueries();
    resetTwapStore();
  };
};

export const useWrapToken = () => {
  const lib = useTwapStore((state) => state.lib);
  const srcAmount = useTwapStore((state) => state.getSrcAmount());
  const srcToken = useTwapStore((state) => state.srcToken);
  const dstToken = useTwapStore((state) => state.dstToken);

  const { priorityFeePerGas, maxFeePerGas } = useGasPriceQuery();

  const setSrcToken = useTwapStore((state) => state.setSrcToken);
  const resetTwapStore = useTwapStore((state) => state.reset);

  return useMutation(
    async () => {
      analytics.onWrapClick(srcAmount);
      return lib!.wrapNativeToken(srcAmount, priorityFeePerGas, maxFeePerGas);
    },
    {
      onSuccess: () => {
        analytics.onWrapSuccess();
        if (lib?.validateTokens(srcToken!, dstToken!) === TokensValidation.wrapOnly) {
          resetTwapStore();
          return;
        }
        setSrcToken(lib!.config.wToken);
      },
      onError: (error: Error) => {
        console.log(error.message);
        analytics.onWrapError(error.message);
      },
    }
  );
};

export const useUnwrapToken = () => {
  const lib = useTwapStore((state) => state.lib);
  const { priorityFeePerGas, maxFeePerGas } = useGasPriceQuery();
  const resetTwapStore = useTwapStore((state) => state.reset);
  const srcTokenAmount = useTwapStore((state) => state.getSrcAmount());

  return useMutation(
    async () => {
      return lib?.unwrapNativeToken(srcTokenAmount, priorityFeePerGas, maxFeePerGas);
    },
    {
      onSuccess: () => {
        resetTwapStore();
      },
    }
  );
};

export const useApproveToken = () => {
  const lib = useTwapStore((state) => state.lib);
  const srcAmount = useTwapStore((state) => state.getSrcAmount());
  const { priorityFeePerGas, maxFeePerGas } = useGasPriceQuery();
  const srcToken = useTwapStore((state) => state.srcToken);
  const { refetch } = useHasAllowanceQuery();

  return useMutation(
    async () => {
      analytics.onApproveClick(srcAmount);
      await lib?.approve(srcToken!, srcAmount, priorityFeePerGas, maxFeePerGas);
      await refetch();
    },
    {
      onSuccess: async () => {
        analytics.onApproveSuccess();
      },
      onError: (error: Error) => {
        analytics.onApproveError(error.message);
      },
    }
  );
};

export const useCreateOrder = () => {
  const { maxFeePerGas, priorityFeePerGas } = useGasPriceQuery();
  const store = useTwapStore();
  const reset = useResetStoreWithLibAndQueries();
  const { askDataParams } = useTwapContext();

  return useMutation(
    async () => {
      console.log({
        srcToken: store.srcToken,
        dstToken: store.dstToken,
        srcAmount: store.getSrcAmount().toString(),
        srcChunkAmount: store.getSrcChunkAmount().toString(),
        dstMinChunkAmountOut: store.getDstMinAmountOut().toString(),
        deadline: store.getDeadline(),
        fillDelay: store.getFillDelayMillis(),
        srcUsd: store.srcUsd.toString(),
        priorityFeePerGas: priorityFeePerGas?.toString(),
        maxFeePerGas: maxFeePerGas?.toString(),
      });
      analytics.onConfirmationCreateOrderClick();
      store.setLoading(true);

      const dstToken = {
        ...store.dstToken!,
        address: store.lib!.validateTokens(store.srcToken!, store.dstToken!) === TokensValidation.dstTokenZero ? zeroAddress : store.dstToken!.address,
      };
      const fillDelayMillis = store.getFillDelayMillis() / 1000;
      return store.lib!.submitOrder(
        store.srcToken!,
        dstToken,
        store.getSrcAmount(),
        store.getSrcChunkAmount(),
        store.getDstMinAmountOut(),
        store.getDeadline(),
        fillDelayMillis,
        store.srcUsd,
        askDataParams,
        priorityFeePerGas,
        maxFeePerGas
      );
    },
    {
      onSuccess: async () => {
        analytics.onCreateOrderSuccess();
        reset();
        store.setWaitingForNewOrder(true);
      },
      onError: (error: Error) => {
        analytics.onCreateOrderError(error.message);
        if ((error as any).code === 4001) {
          analytics.onCreateOrderRejected();
        }
      },

      onSettled: () => {
        store.setLoading(false);
      },
    }
  );
};

export const useInitLib = () => {
  const setTwapLib = useTwapStore((state) => state.setLib);
  const setWrongNetwork = useTwapStore((state) => state.setWrongNetwork);
  const reset = useResetStoreAndQueries();

  return async (props: InitLibProps) => {
    reset();
    if (!props.provider || !props.account) {
      setTwapLib(undefined);
      setWrongNetwork(false);
      return;
    }

    const chain = props.connectedChainId || (await new Web3(props.provider).eth.getChainId());
    const wrongChain = props.config.chainId !== chain;
    setWrongNetwork(wrongChain);
    setTwapLib(wrongChain ? undefined : new TWAPLib(props.config, props.account!, props.provider));
  };
};

export const useChangeNetwork = () => {
  const { config, provider: _provider, account } = useTwapContext();
  const [loading, setLoading] = useState(false);
  const initLib = useInitLib();
  const setInvalidChain = useTwapStore((state) => state.setWrongNetwork);

  const changeNetwork = async (onSuccess: () => void, onError: () => void) => {
    setWeb3Instance(new Web3(_provider));
    try {
      await switchMetaMaskNetwork(config.chainId);
      onSuccess();
    } catch (error) {
      onError();
    }
  };

  const onChangeNetwork = async () => {
    const onSuccess = () => {
      setInvalidChain(false);
      setLoading(false);
      initLib({ config, provider: _provider, account });
    };
    const onError = () => {
      setLoading(false);
    };
    setLoading(true);
    changeNetwork(onSuccess, onError);
  };
  return {
    changeNetwork: onChangeNetwork,
    loading,
  };
};

export const useMarketPrice = () => {
  const [inverted, setInverted] = useState(false);
  const { leftToken, rightToken, marketPriceUi: marketPrice, loading } = useTwapStore((state) => state.getMarketPrice(inverted));

  return {
    leftToken,
    rightToken,
    marketPrice,
    toggleInverted: () => setInverted(!inverted),
    loading,
  };
};

export const useLimitPrice = () => {
  const [inverted, setInverted] = useState(false);
  const translations = useTwapContext().translations;

  const { isLimitOrder, toggleLimitOrder, setLimitPrice, marketPriceUi } = useTwapStore((state) => ({
    isLimitOrder: state.isLimitOrder,
    toggleLimitOrder: state.toggleLimitOrder,
    setLimitPrice: state.setLimitPriceUi,
    marketPriceUi: state.getMarketPrice(false).marketPriceUi,
  }));
  const { limitPriceUi: limitPrice, leftToken, rightToken } = useTwapStore((state) => state.getLimitPrice(inverted));

  const onChange = useCallback(
    (amountUi = "") => {
      setLimitPrice({ priceUi: amountUi, inverted });
    },
    [inverted]
  );

  const onToggleLimit = useCallback(() => {
    setInverted(false);
    toggleLimitOrder();
    analytics.onLimitToggleClick(!isLimitOrder);
  }, [marketPriceUi, isLimitOrder]);

  const toggleInverted = useCallback(() => {
    setInverted(!inverted);
  }, [inverted]);

  const loading = useLoadingState();

  return {
    onToggleLimit,
    toggleInverted,
    onChange,
    limitPrice,
    leftToken,
    rightToken,
    warning: !leftToken || !rightToken ? translations.selectTokens : undefined,
    isLimitOrder,
    isLoading: loading.srcUsdLoading && loading.dstUsdLoading,
  };
};

export const useCustomActions = () => {
  const onPercentClick = useTwapStore((store) => store.setSrcAmountPercent);

  return { onPercentClick };
};

export const useCancelOrder = () => {
  const lib = useTwapStore((state) => state.lib);
  const { refetch } = useOrdersHistoryQuery();
  const { priorityFeePerGas, maxFeePerGas } = useGasPriceQuery();
  return useMutation(
    async (orderId: number) => {
      analytics.onCancelOrderClick(orderId);
      return lib?.cancelOrder(orderId, priorityFeePerGas, maxFeePerGas);
    },
    {
      onSuccess: (_result, orderId) => {
        analytics.onCancelOrderClick(orderId);
        refetch();
      },
      onError: (error: Error) => {
        analytics.onCancelOrderError(error.message);
      },
    }
  );
};

export const useHistoryPrice = (order: OrderUI) => {
  const [inverted, setInverted] = useState(false);

  const price = inverted ? BN(1).div(order.ui.dstPriceFor1Src) : order.ui.dstPriceFor1Src;
  return {
    inverted,
    toggleInverted: () => setInverted(!inverted),
    price,
    priceUi: price.toFormat(),
    leftToken: inverted ? order.ui.dstToken : order.ui.srcToken,
    rightToken: !inverted ? order.ui.dstToken : order.ui.srcToken,
  };
};

export const useLoadingState = () => {
  const srcToken = useTwapStore((store) => store.srcToken);
  const dstToken = useTwapStore((store) => store.dstToken);
  const srcUSD = useSrcUsd();
  const dstUSD = useDstUsd();
  const srcBalance = useSrcBalance();
  const dstBalance = useDstBalance();

  return {
    srcUsdLoading: (srcToken && !srcUSD.data) || srcUSD.isLoading,
    dstUsdLoading: (dstToken && !dstUSD.data) || dstUSD.isLoading,
    srcBalanceLoading: srcBalance.isLoading,
    dstBalanceLoading: dstBalance.isLoading,
  };
};

export const useSrcUsd = () => {
  const state = useTwapStore();
  return useUsdValueQuery(state.srcToken, state.setSrcUsd);
};

export const useDstUsd = () => {
  const state = useTwapStore();
  return useUsdValueQuery(state.dstToken, state.setDstUsd);
};

export const useSrcBalance = () => {
  const state = useTwapStore();
  return useBalanceQuery(state.srcToken, state.setSrcBalance);
};

export const useDstBalance = () => {
  const state = useTwapStore();
  return useBalanceQuery(state.dstToken, state.setDstBalance);
};

/**
 * Queries
 */

export const useHasAllowanceQuery = () => {
  const { lib, amount, srcToken } = useTwapStore((state) => ({
    lib: state.lib,
    amount: state.getSrcAmount(),
    srcToken: state.srcToken,
  }));
  const query = useQuery([QueryKeys.GET_ALLOWANCE, lib?.config.chainId, srcToken?.address, amount.toString()], () => lib!.hasAllowance(srcToken!, amount), {
    enabled: !!lib && !!srcToken && amount.gt(0),
    staleTime: STALE_ALLOWANCE,
    refetchOnWindowFocus: true,
  });
  return { ...query, isLoading: query.isLoading && query.fetchStatus !== "idle" };
};

const useUsdValueQuery = (token?: TokenData, onSuccess?: (value: BN) => void) => {
  const lib = useTwapStore((state) => state.lib);
  const query = useQuery([QueryKeys.GET_USD_VALUE, token?.address], () => Paraswap.priceUsd(lib!.config.chainId, token!), {
    enabled: !!lib && !!token,
    onSuccess,
    refetchInterval: REFETCH_USD,
  });

  return { ...query, isLoading: query.isLoading && query.fetchStatus !== "idle" };
};
export const useBalanceQuery = (token?: TokenData, onSuccess?: (value: BN) => void, staleTime?: number) => {
  const lib = useTwapStore((state) => state.lib);

  const query = useQuery([QueryKeys.GET_BALANCE, lib?.maker, token?.address], () => lib!.makerBalance(token!), {
    enabled: !!lib && !!token,
    onSuccess,
    refetchInterval: REFETCH_BALANCE,
    staleTime,
  });
  return { ...query, isLoading: query.isLoading && query.fetchStatus !== "idle" };
};

const useGasPriceQuery = () => {
  const { maxFeePerGas, priorityFeePerGas } = useTwapContext();
  const lib = useTwapStore((state) => state.lib);

  const { isLoading, data } = useQuery([QueryKeys.GET_GAS_PRICE, priorityFeePerGas, maxFeePerGas], () => Paraswap.gasPrices(lib!.config.chainId), {
    enabled: !!lib && !BN(maxFeePerGas || 0).gt(0) && !BN(priorityFeePerGas || 0).gt(0),
    refetchInterval: REFETCH_GAS_PRICE,
  });

  return { isLoading, maxFeePerGas: BN.max(data?.instant || 0, maxFeePerGas || 0, priorityFeePerGas || 0), priorityFeePerGas: BN.max(data?.low || 0, priorityFeePerGas || 0) };
};

const defaultFetcher = (chainId: number, token: TokenData) => {
  return Paraswap.priceUsd(chainId, token);
};

export const useOrdersHistoryQuery = (fetcher: (chainId: number, token: TokenData) => Promise<BN> = defaultFetcher) => {
  const tokenList = useOrdersContext().tokenList;
  const waitingForNewOrder = useTwapStore((state) => state.waitingForNewOrder);
  const setWaitingForNewOrder = useTwapStore((state) => state.setWaitingForNewOrder);
  const lib = useTwapStore((state) => state.lib);

  const fetchUsdValues = (token: TokenData) => {
    return fetcher(lib!.config.chainId, token);
  };
  const prepareOrderUSDValues = usePrepareOrderUSDValues(fetchUsdValues);
  const query = useQuery(
    [QueryKeys.GET_ORDER_HISTORY, lib?.maker, lib?.config.chainId],
    async () => {
      const rawOrders = (await lib!.getAllOrders()).filter((o) => eqIgnoreCase(o.ask.exchange, lib!.config.exchangeAddress));

      const tokenWithUsdByAddress = await prepareOrderUSDValues(tokenList, rawOrders);
      const parsedOrders = rawOrders.map((o: Order) => parseOrderUi(lib!, tokenWithUsdByAddress, o));
      return _.chain(parsedOrders)
        .orderBy((o: OrderUI) => o.order.ask.deadline, "desc")
        .groupBy((o: OrderUI) => o.ui.status)
        .value();
    },
    {
      enabled: !!lib && !!tokenList && tokenList.length > 0,
      refetchInterval: REFETCH_ORDER_HISTORY,
      onSettled: () => {
        setWaitingForNewOrder(false);
      },
    }
  );

  return { ...query, orders: query.data || {}, isLoading: (query.isLoading && query.fetchStatus !== "idle") || waitingForNewOrder };
};

export const usePrepareOrderUSDValues = (fetchUsd: (token: TokenData) => Promise<BN>) => {
  const client = useQueryClient();

  return async (allTokens: TokenData[] = [], rawOrders: Order[]) => {
    const relevantTokens = allTokens.filter((t) => rawOrders.find((o) => eqIgnoreCase(t.address, o.ask.srcToken) || eqIgnoreCase(t.address, o.ask.dstToken)));
    const uniqueRelevantTokens = _.uniqBy(relevantTokens, "address");
    const usdValues = await Promise.all(
      uniqueRelevantTokens.map((token) => {
        return client.ensureQueryData({
          queryKey: [QueryKeys.GET_USD_VALUE, token.address],
          queryFn: () => fetchUsd(token),
        });
      })
    );
    return _.mapKeys(
      uniqueRelevantTokens.map((t, i) => ({ token: t, usd: usdValues[i] || BN(0) })),
      (t) => Web3.utils.toChecksumAddress(t.token.address)
    );
  };
};
