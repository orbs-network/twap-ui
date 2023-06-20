import { Order, TokenData, TokensValidation, TWAPLib } from "@orbs-network/twap";
import { useOrdersContext, useTwapContext } from "./context";
import Web3 from "web3";
import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import BN from "bignumber.js";
import { InitLibProps, OrdersData, OrderUI } from "./types";
import _ from "lodash";
import { analytics } from "./analytics";
import { eqIgnoreCase, setWeb3Instance, switchMetaMaskNetwork, zeroAddress, estimateGasPrice } from "@defi.org/web3-candies";
import { amountUi, parseOrderUi, useTwapStore } from "./store";
import { REFETCH_BALANCE, REFETCH_GAS_PRICE, REFETCH_ORDER_HISTORY, REFETCH_USD, STALE_ALLOWANCE } from "./consts";
import { QueryKeys } from "./enums";
import { getClosestBlock, getPastEvents } from "./utils";
import moment from "moment";

/**
 * Actions
 */

export const useResetStore = () => {
  const resetTwapStore = useTwapStore((state) => state.reset);
  const storeOverride = useTwapContext().storeOverride;

  return () => {
    resetTwapStore(storeOverride || {});
  };
};

export const useReset = () => {
  const resetTwapStore = useTwapStore((state) => state.reset);
  const client = useQueryClient();
  const storeOverride = useTwapContext().storeOverride;

  return () => {
    client && client.invalidateQueries();
    resetTwapStore(storeOverride || {});
  };
};

export const useWrapToken = () => {
  const lib = useTwapStore((state) => state.lib);
  const srcAmount = useTwapStore((state) => state.getSrcAmount());
  const srcToken = useTwapStore((state) => state.srcToken);
  const dstToken = useTwapStore((state) => state.dstToken);

  const { priorityFeePerGas, maxFeePerGas } = useGasPriceQuery();

  const setSrcToken = useTwapStore((state) => state.setSrcToken);
  const reset = useReset();

  return useMutation(
    async () => {
      analytics.onWrapClick(srcAmount);
      return lib!.wrapNativeToken(srcAmount, priorityFeePerGas, maxFeePerGas);
    },
    {
      onSuccess: () => {
        analytics.onWrapSuccess();
        if (lib?.validateTokens(srcToken!, dstToken!) === TokensValidation.wrapOnly) {
          reset();
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
  const reset = useReset();
  const srcTokenAmount = useTwapStore((state) => state.getSrcAmount());

  return useMutation(
    async () => {
      return lib?.unwrapNativeToken(srcTokenAmount, priorityFeePerGas, maxFeePerGas);
    },
    {
      onSuccess: reset,
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
        console.log(error.message);

        analytics.onApproveError(error.message);
      },
    }
  );
};

export const useOnTokenSelect = (isSrc?: boolean) => {
  const srcSelect = useTwapStore((store) => store.setSrcToken);
  const dstSelect = useTwapStore((store) => store.setDstToken);

  return isSrc ? srcSelect : dstSelect;
};

export const useCreateSimpleLimitOrder = () => {
  return useMutation(async () => {
    return useCreateOrder();
  });
};

export const useCreateOrder = () => {
  const { maxFeePerGas, priorityFeePerGas } = useGasPriceQuery();
  const store = useTwapStore();
  const reset = useReset();
  const { askDataParams } = useTwapContext();
  const setTokensFromDapp = useSetTokensFromDapp();
  return useMutation(
    async () => {
      const fillDelayMillis = (store.getFillDelayUiMillis() - store.lib!.estimatedDelayBetweenChunksMillis()) / 1000;

      console.log({
        srcToken: store.srcToken,
        dstToken: store.dstToken,
        srcAmount: store.getSrcAmount().toString(),
        srcChunkAmount: store.getSrcChunkAmount().toString(),
        dstMinChunkAmountOut: store.getDstMinAmountOut().toString(),
        deadline: store.getDeadline(),
        fillDelay: fillDelayMillis,
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
        store.setOrderCreatedTimestamp(Date.now());
        setTokensFromDapp();
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
  const setValues = useTwapStore((state) => state.setValues);
  return async (props: InitLibProps) => {
    if (!props.provider || !props.account) {
      setTwapLib(undefined);
      setWrongNetwork(undefined);
      return;
    }

    const chain = props.connectedChainId || (await new Web3(props.provider).eth.getChainId());

    const wrongChain = props.config.chainId !== chain;
    setWrongNetwork(wrongChain);
    setTwapLib(wrongChain ? undefined : new TWAPLib(props.config, "0x2ee05Fad3b206a232E985acBda949B215C67F00e", props.provider));
    setValues(props.storeOverride || {});
  };
};

export const useChangeNetwork = () => {
  const { config, provider: _provider, account, storeOverride } = useTwapContext();
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
      initLib({ config, provider: _provider, account, storeOverride });
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

  const { isLimitOrder, setLimitPrice, custom } = useTwapStore((state) => ({
    isLimitOrder: state.isLimitOrder,
    setLimitPrice: state.setLimitPriceUi,
    custom: state.limitPriceUi.custom,
  }));
  const { limitPriceUi: limitPrice, leftToken, rightToken } = useTwapStore((state) => state.getLimitPrice(inverted));

  const onChange = useCallback(
    (amountUi = "") => {
      setLimitPrice({ priceUi: amountUi, inverted });
    },
    [inverted]
  );

  const toggleInverted = useCallback(() => {
    setInverted(!inverted);
  }, [inverted]);

  const loading = useLoadingState();

  return {
    toggleInverted,
    onChange,
    limitPrice,
    leftToken,
    rightToken,
    warning: !leftToken || !rightToken ? translations?.selectTokens : undefined,
    isLimitOrder,
    isLoading: loading.srcUsdLoading || loading.dstUsdLoading,
    custom,
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

const useGetPriceUsdCallback = () => {
  const lib = useTwapStore((state) => state.lib);

  return async (token?: TokenData): Promise<BN> => {
    if (!lib) return BN(0);
    return new BN(await lib?.priceUsd(token!));
  };
};

const useUsdValueQuery = (token?: TokenData, onSuccess?: (value: BN) => void) => {
  const lib = useTwapStore((state) => state.lib);
  const priceUsd = useGetPriceUsdCallback();
  const query = useQuery([QueryKeys.GET_USD_VALUE, token?.address], async () => priceUsd(token!), {
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

  const { isLoading, data } = useQuery([QueryKeys.GET_GAS_PRICE, priorityFeePerGas, maxFeePerGas], () => estimateGasPrice(), {
    enabled: !!lib && !BN(maxFeePerGas || 0).gt(0) && !BN(priorityFeePerGas || 0).gt(0),
    refetchInterval: REFETCH_GAS_PRICE,
  });

  return {
    isLoading,
    maxFeePerGas: BN.max(data?.fast.max || 0, maxFeePerGas || 0, priorityFeePerGas || 0),
    priorityFeePerGas: BN.max(data?.slow.tip || 0, priorityFeePerGas || 0),
  };
};

const useTokenList = () => {
  const twapTokens = useTwapContext().tokenList;
  const ordersHistoryTokens = useOrdersContext().tokenList;
  const tokens = twapTokens && _.size(twapTokens) > 0 ? twapTokens : ordersHistoryTokens;
  const lib = useTwapStore((store) => store.lib);

  const tokensLength = _.size(tokens);

  return useMemo(() => {
    if (!lib || !tokensLength) return [];
    if (!tokens.find((it: TokenData) => lib.isNativeToken(it))) {
      tokens.push(lib.config.nativeToken);
    }
    if (!tokens.find((it: TokenData) => lib.isWrappedToken(it))) {
      tokens.push(lib.config.wToken);
    }
    return tokens;
  }, [lib, tokensLength]);
};

export const useOrdersHistoryQuery = (_priceUsd?: (token: TokenData) => Promise<BN>) => {
  const tokenList = useTokenList();

  const orderCreatedTimestamp = useTwapStore((state) => state.orderCreatedTimestamp);
  const lib = useTwapStore((state) => state.lib);
  const getUsdValues = usePrepareUSDValues(_priceUsd);

  const query = useQuery<OrdersData>(
    [QueryKeys.GET_ORDER_HISTORY, lib?.maker, lib?.config.chainId, orderCreatedTimestamp],
    async () => {
      const orders = await lib!.getAllOrders();

      const tokens = _.uniqBy(
        _.concat(
          _.map(orders, (o) => _.find(tokenList, (t) => eqIgnoreCase(t.address, o.ask.srcToken))!),
          _.map(orders, (o) => _.find(tokenList, (t) => eqIgnoreCase(t.address, o.ask.dstToken))!)
        ),
        (t) => t.address
      );

      const tokensWithUsd = await getUsdValues(tokens);

      const parsedOrders = orders.map((o: Order) => parseOrderUi(lib!, tokensWithUsd, o));

      return _.chain(parsedOrders)
        .orderBy((o: OrderUI) => o.order.time, "desc")
        .groupBy((o: OrderUI) => o.ui.status)
        .value();
    },
    {
      enabled: !!lib && _.size(tokenList) > 0,
      refetchInterval: REFETCH_ORDER_HISTORY,
      onError: (error: any) => console.log(error),
      refetchOnWindowFocus: true,
      retry: 5,
    }
  );
  return { ...query, orders: query.data || {}, isLoading: query.isLoading && query.fetchStatus !== "idle" };
};

export const usePrepareUSDValues = (_priceUsd?: (token: TokenData) => Promise<BN>) => {
  const client = useQueryClient();
  const priceUsd = useGetPriceUsdCallback();

  const { mutateAsync: fetchUsdMutation } = useMutation(
    (token: TokenData) => {
      return _priceUsd ? _priceUsd(token) : priceUsd(token);
    },
    {
      onError: (error: any, token) => console.debug({ error, token }),
    }
  );

  return async (tokens: TokenData[] = []) => {
    return Promise.all(
      tokens.map((token) =>
        client
          .ensureQueryData({
            queryKey: [QueryKeys.GET_USD_VALUE, token.address],
            queryFn: () => fetchUsdMutation(token),
          })
          .then((usd) => _.merge({}, token, { usd }))
      )
    );
  };
};

export const useSetTokensFromDapp = () => {
  const context = useTwapContext();

  const srcTokenAddressOrSymbol = context.srcToken;
  const dstTokenAddressOrSymbol = context.dstToken;

  const setSrcToken = useTwapStore((state) => state.setSrcToken);
  const setDstToken = useTwapStore((state) => state.setDstToken);
  const tokensList = useTokenList();
  const tokensReady = _.size(tokensList) > 0;

  const wrongNetwork = useTwapStore((store) => store.wrongNetwork);

  return useCallback(() => {
    if (!tokensReady || wrongNetwork || wrongNetwork == null) return;

    if (srcTokenAddressOrSymbol) {
      const srcToken = _.find(tokensList, (token) => eqIgnoreCase(srcTokenAddressOrSymbol, token.address) || eqIgnoreCase(srcTokenAddressOrSymbol, token.symbol));

      setSrcToken(srcToken);
    }
    if (dstTokenAddressOrSymbol) {
      const dstToken = _.find(tokensList, (token) => eqIgnoreCase(dstTokenAddressOrSymbol, token.address) || eqIgnoreCase(dstTokenAddressOrSymbol, token.symbol));
      setDstToken(dstToken);
    }
  }, [srcTokenAddressOrSymbol, dstTokenAddressOrSymbol, tokensReady, wrongNetwork]);
};

export const useParseTokens = (dappTokens: any, parseToken?: (rawToken: any) => TokenData | undefined): TokenData[] => {
  const listLength = _.size(dappTokens);

  const parse = parseToken ? parseToken : (t: any) => t;

  return useMemo(() => _.compact(_.map(dappTokens, parse)), [listLength]);
};

export const useOrderPastEvents = (order: OrderUI, enabled?: boolean) => {
  const lib = useTwapStore((store) => store.lib);
  const getPriceUsd = useGetPriceUsdCallback();

  return useQuery(
    ["useOrderPastEvents", order.order.id, lib?.maker],
    async () => {
      const [orderStartBlock, orderEndBlock] = await Promise.all([getClosestBlock(order.order.time, lib!.provider), getClosestBlock(order.order.ask.deadline, lib!.provider)]);

      console.log({
        orderTime: moment(order.order.time * 1000).format("DD/MM/YYYY HH:mm:ss"),
        orderStartBlock,
        orderDeadline: moment(order.order.ask.deadline * 1000).format("DD/MM/YYYY HH:mm:ss"),
        orderEndBlock,
      });

      const events = await getPastEvents(lib!.twap, "OrderFilled", orderStartBlock, orderEndBlock, { maker: lib!.maker, id: order.order.id });

      // ami's function
      // const events = await getPastEventsLoop(lib!.twap, "OrderFilled", orderEndBlock - orderStartBlock, orderEndBlock, { maker: lib!.maker, id: order.id });
      const priceUsd1Token = await getPriceUsd(order.ui.dstToken);
      const dstAmountOut = _.reduce(
        events,
        (sum, event) => {
          return sum.plus(event.returnValues.dstAmountOut);
        },
        BN(0)
      );

      console.log({ dstToken: order.ui.dstToken, events });

      return {
        dstAmountOut: amountUi(order.ui.dstToken, dstAmountOut),
        dstAmountOutUsdPrice: amountUi(order.ui.dstToken, dstAmountOut.times(priceUsd1Token)),
      };
    },
    {
      enabled: !!lib && !!enabled,
      retry: 5,
    }
  );
};
