import { Order, Paraswap, TokenData, TokensValidation, TWAPLib } from "@orbs-network/twap";
import { useTwapContext } from "./context";
import Web3 from "web3";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import BN from "bignumber.js";
import { InitLibProps, OrdersData, OrderUI } from "./types";
import _ from "lodash";
import { analytics } from "./analytics";
import { eqIgnoreCase, setWeb3Instance, switchMetaMaskNetwork, zeroAddress } from "@defi.org/web3-candies";
import { parseOrderUi, useTwapStore } from "./store";
import { REFETCH_BALANCE, REFETCH_GAS_PRICE, REFETCH_ORDER_HISTORY, REFETCH_USD, STALE_ALLOWANCE } from "./consts";
import { QueryKeys } from "./enums";

/**
 * Actions
 */

export const useReset = () => {
  const resetTwapStore = useTwapStore((state) => state.reset);
  const client = useQueryClient();
  const storeOverride = useTwapContext().storeOverride;

  return () => {
    client.invalidateQueries();
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
    setTwapLib(wrongChain ? undefined : new TWAPLib(props.config, props.account!, props.provider));
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

  const { isLimitOrder, setLimitPrice } = useTwapStore((state) => ({
    isLimitOrder: state.isLimitOrder,
    setLimitPrice: state.setLimitPriceUi,
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
    warning: !leftToken || !rightToken ? translations.selectTokens : undefined,
    isLimitOrder,
    isLoading: loading.srcUsdLoading || loading.dstUsdLoading,
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
  const tokenList = useTwapStore((store) => store.tokensList);

  const waitingForNewOrder = useTwapStore((state) => state.waitingForNewOrder);
  const setWaitingForNewOrder = useTwapStore((state) => state.setWaitingForNewOrder);
  const lib = useTwapStore((state) => state.lib);

  const fetchUsdValues = (token: TokenData) => {
    return fetcher(lib!.config.chainId, token);
  };
  const prepareOrderUSDValues = usePrepareOrderUSDValues(fetchUsdValues);
  const query = useQuery<OrdersData>(
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
      enabled: !!lib && _.size(tokenList) > 0,
      refetchInterval: REFETCH_ORDER_HISTORY,
      onSettled: () => {
        setWaitingForNewOrder(false);
      },
      onError: console.error,
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

export const useSetTokensFromDapp = (srcTokenAddressOrSymbol?: string, dstTokenAddressOrSymbol?: string) => {
  const setSrcToken = useTwapStore((state) => state.setSrcToken);
  const setDstToken = useTwapStore((state) => state.setDstToken);
  const tokensList = useTwapStore((store) => store.tokensList);
  const tokensReady = _.size(tokensList) > 0;
  const wrongNetwork = useTwapStore((store) => store.wrongNetwork);

  useEffect(() => {
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

export const useParseTokens = (dappTokens: any, parseToken: (rawToken: any) => TokenData | undefined): TokenData[] => {
  const listLength = _.size(dappTokens);
  return useMemo(() => _.compact(_.map(dappTokens, parseToken)), [listLength]);
};
