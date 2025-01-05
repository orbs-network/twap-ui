import { OrderInputValidation, Status, TokenData, TokensValidation, TWAPLib } from "@orbs-network/twap";
import { useTwapContext } from "./context";
import Web3 from "web3";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import BN from "bignumber.js";
import { InitLibProps, State, Translations } from "./types";
import _ from "lodash";
import { analytics } from "./analytics";
import {
  eqIgnoreCase,
  setWeb3Instance,
  switchMetaMaskNetwork,
  zeroAddress,
  estimateGasPrice,
  zero,
  isNativeAddress,
  web3,
  parseEvents,
  sendAndWaitForConfirmations,
  networks,
  maxUint256,
  parsebn,
} from "@defi.org/web3-candies";
import { TimeResolution, useLimitPriceStore, useOrdersStore, useTwapStore, useWizardStore, WizardAction, WizardActionStatus } from "./store";
import { MIN_NATIVE_BALANCE, QUERY_PARAMS, REFETCH_BALANCE, REFETCH_GAS_PRICE, REFETCH_ORDER_HISTORY, REFETCH_USD, STALE_ALLOWANCE, SUGGEST_CHUNK_VALUE } from "./consts";
import { QueryKeys } from "./enums";
import { useNumericFormat } from "react-number-format";
import moment from "moment";
import { amountBN, amountBNV2, amountUi, amountUiV2, devideCurrencyAmounts, getQueryParam, getTokenFromTokensList, logger, safeInteger, setQueryParam } from "./utils";
import { getOrders, groupOrdersByStatus, Order, waitForOrdersCancelled, waitForOrdersUpdate } from "./order";

/**
 * Actions
 */

export const useResetStore = () => {
  const { resetTwapStore, waitingForOrderId } = useTwapStore((state) => ({
    resetTwapStore: state.reset,
    waitingForOrderId: state.waitingForOrderId,
  }));
  const storeOverride = useTwapContext().storeOverride || {};

  return (args: Partial<State> = {}) => {
    resetTwapStore({ ...storeOverride, ...args, waitingForOrderId });
    setQueryParam(QUERY_PARAMS.INPUT_AMOUNT, undefined);
    setQueryParam(QUERY_PARAMS.LIMIT_PRICE, undefined);
    setQueryParam(QUERY_PARAMS.MAX_DURATION, undefined);
    setQueryParam(QUERY_PARAMS.TRADE_INTERVAL, undefined);
    setQueryParam(QUERY_PARAMS.TRADES_AMOUNT, undefined);
  };
};

export const useReset = () => {
  const resetTwapStore = useTwapStore((state) => state.reset);
  const client = useQueryClient();
  const storeOverride = useTwapContext().storeOverride;

  return () => {
    client && client.invalidateQueries();
    resetTwapStore(storeOverride || {});
    setQueryParam(QUERY_PARAMS.INPUT_AMOUNT, undefined);
    setQueryParam(QUERY_PARAMS.LIMIT_PRICE, undefined);
    setQueryParam(QUERY_PARAMS.MAX_DURATION, undefined);
    setQueryParam(QUERY_PARAMS.TRADE_INTERVAL, undefined);
    setQueryParam(QUERY_PARAMS.TRADES_AMOUNT, undefined);
  };
};

export const useWrapToken = () => {
  const lib = useTwapStore((state) => state.lib);
  const srcAmount = useTwapStore((state) => state.getSrcAmount());
  const srcToken = useTwapStore((state) => state.srcToken);
  const dstToken = useTwapStore((state) => state.dstToken);
  const wizardStore = useWizardStore();
  const { onSrcTokenSelected, dappTokens } = useTwapContext();

  const { priorityFeePerGas, maxFeePerGas } = useGasPriceQuery();

  const setSrcToken = useTwapStore((state) => state.setSrcToken);
  const reset = useReset();

  return useMutation(
    async () => {
      analytics.onWrapRequest();
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
        const token = getTokenFromTokensList(dappTokens, lib!.config.wToken.address);
        if (token) {
          onSrcTokenSelected?.(token);
        }
      },
      onError: (error: Error) => {
        console.log(error.message);
        analytics.onWrapError(error.message);
        throw error;
      },
    }
  );
};

export const useUnwrapToken = () => {
  const lib = useTwapStore((state) => state.lib);
  const { priorityFeePerGas, maxFeePerGas } = useGasPriceQuery();
  const reset = useReset();
  const srcTokenAmount = useTwapStore((state) => state.getSrcAmount());
  const wizardStore = useWizardStore();
  return useMutation(
    async () => {
      return lib?.unwrapNativeToken(srcTokenAmount, priorityFeePerGas, maxFeePerGas);
    },
    {
      onSuccess: () => {
        reset();
      },
      onError: (error: Error) => {},
    }
  );
};

export const useApproveToken = (disableWizard?: boolean) => {
  const { lib, setLoading } = useTwapStore((state) => ({
    lib: state.lib,
    setLoading: state.setLoading,
  }));

  const srcAmount = useTwapStore((state) => state.getSrcAmount());
  const { priorityFeePerGas, maxFeePerGas } = useGasPriceQuery();
  const srcToken = useTwapStore((state) => state.srcToken);
  const { refetch } = useHasAllowanceQuery();
  const wizardStore = useWizardStore();
  return useMutation(
    async () => {
      setLoading(true);
      if (!disableWizard) {
        wizardStore.setAction(WizardAction.APPROVE);
        wizardStore.setStatus(WizardActionStatus.PENDING);
      }

      analytics.onApproveRequest();
      await lib?.approve(srcToken!, maxUint256, priorityFeePerGas, maxFeePerGas);
      await refetch();
    },
    {
      onSuccess: async () => {
        analytics.onApproveSuccess();
        !disableWizard && wizardStore.setStatus(WizardActionStatus.SUCCESS);
      },
      onError: (error: Error) => {
        !disableWizard && wizardStore.setStatus(WizardActionStatus.ERROR, error.message);
        analytics.onApproveError(error.message);
        throw error;
      },
      onSettled: () => {
        setLoading(false);
      },
    }
  );
};

export const useOnTokenSelect = (isSrc?: boolean) => {
  const srcSelect = useTwapStore((store) => store.setSrcToken);
  const dstSelect = useTwapStore((store) => store.setDstToken);

  return isSrc ? srcSelect : dstSelect;
};

export const useHasMinNativeTokenBalance = (minTokenAmount?: string) => {
  const { lib } = useTwapStore((s) => ({
    lib: s.lib,
  }));

  return useQuery(
    ["useHasMinNativeTokenBalance", lib?.maker, lib?.config.chainId, minTokenAmount],
    async () => {
      const balance = await web3().eth.getBalance(lib!.maker);
      return BN(balance).gte(amountBN(lib?.config.nativeToken, minTokenAmount!));
    },
    {
      enabled: !!lib?.maker && !!minTokenAmount,
      staleTime: Infinity,
    }
  );
};

export const useCreateOrder = () => {
  const { maxFeePerGas, priorityFeePerGas } = useGasPriceQuery();
  const store = useTwapStore();
  const { onOrderCreated } = useOrdersHistoryQuery();
  const submitOrder = useSubmitOrderCallback();
  const { setTab } = useOrdersStore();
  const { askDataParams, onTxSubmitted } = useTwapContext();
  const dstMinAmountOut = useDstMinAmountOut().amount;
  const { amount: dstAmount, usd: dstAmountUsdUi } = useDstAmount();
  const srcUsd = useSrcUsd().value.toString();
  const tradeSize = useSrcChunkAmount();
  const srcChunkAmount = useSrcChunkAmount();
  const deadline = useDeadline();
  const onResetLimitPrice = useLimitPriceStore().onReset;
  return useMutation(
    async (onTxHash?: (value: string) => void) => {
      const dstToken = {
        ...store.dstToken!,
        address: store.lib!.validateTokens(store.srcToken!, store.dstToken!) === TokensValidation.dstTokenZero ? zeroAddress : store.dstToken!.address,
      };

      console.log({
        srcToken: store.srcToken!,
        dstToken: dstToken,
        srcAmount: store.getSrcAmount().toString(),
        dstAmount,
        dstUSD: dstAmountUsdUi!,
        getSrcChunkAmount: tradeSize.toString(),
        getDeadline: deadline,
        fillDelayMillis: store.getFillDelayUiMillis(),
        isLimit: store.isLimitOrder,
      });

      const fillDelayMillis = (store.getFillDelayUiMillis() - store.lib!.estimatedDelayBetweenChunksMillis()) / 1000;

      store.setLoading(true);

      const order = await submitOrder(
        (txHash) => {
          onTxHash?.(txHash);
          setTab(0);
          store.updateState({
            txHash,
            waitingForOrderId: true,
          });
        },
        store.srcToken!,
        dstToken,
        store.getSrcAmount(),
        srcChunkAmount,
        dstMinAmountOut,
        deadline,
        fillDelayMillis,
        srcUsd,
        askDataParams,
        priorityFeePerGas || zero,
        maxFeePerGas
      );
      onTxSubmitted?.({
        srcToken: store.srcToken!,
        dstToken: dstToken!,
        srcAmount: store.getSrcAmount().toString(),
        dstUSD: dstAmountUsdUi!,
        dstAmount,
        txHash: order.txHash,
      });

      store.updateState({
        waitingForOrderId: order.orderId,
      });
      onOrderCreated(order.orderId);
      return order;
    },
    {
      onSuccess: async (result) => {
        analytics.onCreateOrderSuccess(result.txHash, result.orderId);
        onResetLimitPrice();
      },
      onError: (error: Error) => {
        analytics.onCreateOrderError(error.message);
        throw error;
      },

      onSettled: () => {
        store.updateState({
          loading: false,
        });
      },
    }
  );
};

export const useInitLib = () => {
  const setTwapLib = useTwapStore((state) => state.setLib);
  const setWrongNetwork = useTwapStore((state) => state.setWrongNetwork);
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
  };
};

export const useUpdateStoreOveride = () => {
  const setStoreOverrideValues = useTwapStore((state) => state.setStoreOverrideValues);
  const enableQueryParams = useTwapContext().enableQueryParams;
  return useCallback(
    (values?: Partial<State>) => {
      setStoreOverrideValues(values || {}, enableQueryParams);
    },
    [setStoreOverrideValues, enableQueryParams]
  );
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

export const useCustomActions = () => {
  return useSetSrcAmountPercent();
};

export const useCancelOrder = () => {
  const lib = useTwapStore((state) => state.lib);
  const { onOrderCancelled } = useOrdersHistoryQuery();
  const { priorityFeePerGas, maxFeePerGas } = useGasPriceQuery();
  return useMutation(
    async (orderId: number) => {
      analytics.onCancelOrder(orderId);
      await lib?.cancelOrder(orderId, priorityFeePerGas, maxFeePerGas);
      await onOrderCancelled(orderId);
    },
    {
      onSuccess: (_result) => {
        analytics.onCancelOrderSuccess();
      },
      onError: (error: Error) => {
        analytics.onCanelOrderError(error.message);
      },
    }
  );
};

export const useHistoryPrice = (order: Order) => {
  const [inverted, setInverted] = useState(false);

  const price = "";

  const priceUi = useFormatNumber({ value: price, decimalScale: 4 });
  return {
    inverted,
    toggleInverted: () => setInverted(!inverted),
    price,
    priceUi,
    leftToken: undefined,
    rightToken: undefined,
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
    srcUsdLoading: !srcToken ? false : srcUSD.isLoading || srcUSD.value?.isZero(),
    dstUsdLoading: !dstToken ? false : dstUSD.isLoading || dstUSD.value?.isZero(),
    srcBalanceLoading: srcBalance.isLoading,
    dstBalanceLoading: dstBalance.isLoading,
  };
};

export const useSrcUsd = () => {
  const { value } = useTwapStore((store) => ({
    value: store.srcUsd || zero,
    isLoading: store.srcUsdLoading,
  }));

  return {
    value,
    isLoading: value.isZero(),
  };
};

export const useDstUsd = () => {
  const { value } = useTwapStore((store) => ({
    value: store.dstUsd || zero,
    isLoading: store.dstUsdLoading,
  }));
  return {
    value,
    isLoading: value.isZero(),
  };
};

export const useSrcBalance = () => {
  const srcToken = useTwapStore((store) => store.srcToken);
  return useBalanceQuery(srcToken);
};

export const useDstBalance = () => {
  const dstToken = useTwapStore((store) => store.dstToken);
  return useBalanceQuery(dstToken);
};

/**
 * Queries
 */

export const useHasAllowanceQueryKey = (srcAmount?: string) => {
  const { lib, srcToken } = useTwapStore((state) => ({
    lib: state.lib,
    srcToken: state.srcToken,
  }));
  return useMemo(() => [QueryKeys.GET_ALLOWANCE, lib?.config.chainId, srcToken?.address, srcAmount], [lib, srcToken, srcAmount]);
};

export const useHasAllowanceDebounedQuery = () => {
  const { lib, amount, srcToken } = useTwapStore((state) => ({
    lib: state.lib,
    amount: state.getSrcAmount(),
    srcToken: state.srcToken,
  }));

  const debouncedValue = useDebounce(amount.toString(), 500);
  const querykey = useHasAllowanceQueryKey(debouncedValue);
  const query = useQuery(querykey, () => lib!.hasAllowance(srcToken!, debouncedValue), {
    enabled: !!lib && !!srcToken && amount.gt(0),
    staleTime: STALE_ALLOWANCE,
    refetchOnWindowFocus: true,
  });
  return { ...query, isLoading: query.isLoading && query.fetchStatus !== "idle" };
};

export const useHasAllowanceQuery = () => {
  const { lib, amount, srcToken } = useTwapStore((state) => ({
    lib: state.lib,
    amount: state.getSrcAmount(),
    srcToken: state.srcToken,
  }));
  const querykey = useHasAllowanceQueryKey(amount.toString());

  const query = useQuery(querykey, () => lib!.hasAllowance(srcToken!, amount), {
    enabled: !!lib && !!srcToken && amount.gt(0),
    staleTime: STALE_ALLOWANCE,
    refetchOnWindowFocus: true,
  });
  return { ...query, isLoading: query.isLoading && query.fetchStatus !== "idle" };
};

export const usePriceUSD = (address?: string, onSuccess?: (value: BN, isLoading: boolean) => void) => {
  const context = useTwapContext();
  const lib = useTwapStore((state) => state.lib);
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

export const useBalanceQuery = (token?: TokenData, onSuccess?: (value: BN) => void, staleTime?: number) => {
  const lib = useTwapStore((state) => state.lib);
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
  return { ...query, isLoading: query.isLoading && query.fetchStatus !== "idle" };
};

const useGasPriceQuery = () => {
  const { maxFeePerGas: contextMax, priorityFeePerGas: contextTip } = useTwapContext();
  const lib = useTwapStore((state) => state.lib);
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

const useTokenList = () => {
  const tokens = useTwapContext().tokenList || [];
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

export const useOrdersHistoryQuery = () => {
  const { lib } = useTwapStore((state) => ({
    lib: state.lib,
    updateState: state.updateState,
    showConfirmation: state.showConfirmation,
  }));
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => [QueryKeys.GET_ORDER_HISTORY, lib?.maker, lib?.config.chainId], [lib?.maker, lib?.config.chainId]);

  const query = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      return await getOrders({
        account: lib!.maker,
        signal,
        chainId: lib!.config.chainId,
        exchangeAddress: lib?.config.exchangeAddress,
      });
    },
    enabled: !!lib,
    staleTime: Infinity,
    refetchInterval: REFETCH_ORDER_HISTORY,
  });

  const onOrderCreated = useCallback(
    async (orderId?: number) => {
      if (!orderId || !lib) {
        return query.refetch();
      }

      const orders = await waitForOrdersUpdate(lib?.config, orderId, lib!.maker);
      if (orders?.length) {
        queryClient.setQueriesData(queryKey, orders);
      }
    },
    [lib, query.refetch, queryKey, queryClient]
  );

  const onOrderCancelled = useCallback(
    async (orderId: number) => {
      const orders = await waitForOrdersCancelled(lib!.config, orderId, lib!.maker);
      if (orders?.length) {
        queryClient.setQueriesData(queryKey, orders);
      }
    },
    [lib, queryKey, queryClient]
  );

  return {
    ...query,
    onOrderCreated,
    onOrderCancelled,
  };
};

export const useGroupedOrders = () => {
  const { data } = useOrdersHistoryQuery();

  return useMemo(() => {
    return groupOrdersByStatus(data || []);
  }, [data]);
};

export const useNetwork = () => {
  const { lib } = useTwapStore((state) => ({
    lib: state.lib,
  }));

  return useMemo(() => Object.values(networks).find((it) => it.id === lib?.config.chainId), [lib]);
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
      const srcToken = getTokenFromTokensList(tokensList, srcTokenAddressOrSymbol);
      setSrcToken(srcToken);
    }
    if (dstTokenAddressOrSymbol) {
      const dstToken = getTokenFromTokensList(tokensList, dstTokenAddressOrSymbol);
      setDstToken(dstToken);
    }
  }, [srcTokenAddressOrSymbol, dstTokenAddressOrSymbol, tokensReady, wrongNetwork]);
};

export const useParseTokens = (dappTokens: any, parseToken?: (rawToken: any) => TokenData | undefined): TokenData[] => {
  const listLength = _.size(dappTokens);

  const parse = parseToken ? parseToken : (t: any) => t;

  return useMemo(() => _.compact(_.map(dappTokens, parse)), [listLength]);
};

export const useFormatNumber = ({
  value,
  decimalScale = 3,
  prefix,
  suffix,
  disableDynamicDecimals = true,
}: {
  value?: string | number;
  decimalScale?: number;
  prefix?: string;
  suffix?: string;
  disableDynamicDecimals?: boolean;
}) => {
  const decimals = useMemo(() => {
    if (!value) return 0;
    const [, decimal] = value.toString().split(".");
    if (!decimal) return 0;
    const arr = decimal.split("");
    let count = 0;

    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === "0") {
        count++;
      } else {
        break;
      }
    }

    return !count ? decimalScale : count + decimalScale;
  }, [value, decimalScale]);

  const isBiggerThan1 = useMemo(() => {
    return BN(value || "0").gt(1);
  }, [value]);

  const _disableDynamicDecimals = disableDynamicDecimals || isBiggerThan1;

  const result = useNumericFormat({
    allowLeadingZeros: true,
    thousandSeparator: ",",
    displayType: "text",
    value: value || "",
    decimalScale: _disableDynamicDecimals ? decimalScale : decimals,
    prefix,
    suffix,
  });

  return result.value?.toString();
};

export const useSrcAmountNotZero = () => {
  const value = useTwapStore((store) => store.getSrcAmount());

  return value.gt(0);
};

const useTokenSelect = (parseTokenProps?: (token: any) => any) => {
  const { onSrcTokenSelected, onDstTokenSelected, parseToken } = useTwapContext();
  return useCallback(
    ({ isSrc, token }: { isSrc: boolean; token: any }) => {
      const _parsedToken = parseToken || parseTokenProps;
      const parsedToken = _parsedToken ? _parsedToken(token) : token;
      if (isSrc) {
        useTwapStore.getState().setSrcToken(parsedToken);
        onSrcTokenSelected?.(token);
      } else {
        useTwapStore.getState().setDstToken(parsedToken);
        onDstTokenSelected?.(token);
      }
    },
    [onSrcTokenSelected, onDstTokenSelected, parseToken, parseTokenProps]
  );
};

export const useToken = (isSrc?: boolean) => {
  const srcTokenLogo = useTwapStore((store) => store.srcToken);
  const dstTokenLogo = useTwapStore((store) => store.dstToken);

  return isSrc ? srcTokenLogo : dstTokenLogo;
};

export const useSwitchTokens = () => {
  const { dappTokens, onSrcTokenSelected, onDstTokenSelected } = useTwapContext();
  const { onReset } = useTradePrice();

  const { srcToken, dstToken, updateState } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
    srcAmountUi: s.srcAmountUi,
    updateState: s.updateState,
  }));
  const dstAmount = useDstAmount().amountUI;
  return useCallback(() => {
    updateState({
      srcToken: dstToken,
      dstToken: srcToken,
      srcAmountUi: "",
    });
    onReset();
    const _srcToken = getTokenFromTokensList(dappTokens, srcToken?.address || srcToken?.symbol);
    const _dstToken = getTokenFromTokensList(dappTokens, dstToken?.address || dstToken?.symbol);
    srcToken && onSrcTokenSelected?.(_dstToken);
    dstToken && onDstTokenSelected?.(_srcToken);
  }, [dstAmount, _.size(dappTokens), srcToken?.address, srcToken?.symbol, dstToken?.address, dstToken?.symbol, onSrcTokenSelected, onDstTokenSelected, onReset]);
};

export const useSelectTokenCallback = (parseTokenProps?: (token: any) => any) => {
  const srcTokenAddress = useTwapStore((s) => s.srcToken)?.address;
  const dstTokenAddress = useTwapStore((s) => s.dstToken)?.address;
  const { parseToken } = useTwapContext();
  const setChunks = useSetChunks();
  const onTokenSelect = useTokenSelect(parseTokenProps);

  const switchTokens = useSwitchTokens();
  return useCallback(
    (args: { isSrc: boolean; token: any }) => {
      const _parseToken = parseToken || parseTokenProps;
      const parsedToken = _parseToken ? _parseToken(args.token) : args.token;
      setChunks(undefined);
      if (eqIgnoreCase(parsedToken?.address || "", srcTokenAddress || "") || eqIgnoreCase(parsedToken?.address || "", dstTokenAddress || "")) {
        switchTokens();
        return;
      }
      onTokenSelect(args);
    },
    [srcTokenAddress, dstTokenAddress, switchTokens, parseToken, onTokenSelect, parseTokenProps, setChunks]
  );
};

export const useDappRawSelectedTokens = () => {
  const { dappTokens } = useTwapContext();
  const tokensLength = _.size(dappTokens);

  const srcToken = useTwapStore((s) => s.srcToken);
  const dstToken = useTwapStore((s) => s.dstToken);

  const _srcToken = useMemo(() => {
    return getTokenFromTokensList(dappTokens, srcToken?.address || srcToken?.symbol);
  }, [srcToken?.address, srcToken?.symbol, tokensLength]);

  const _dstToken = useMemo(() => {
    return getTokenFromTokensList(dappTokens, dstToken?.address || dstToken?.symbol);
  }, [dstToken?.address, dstToken?.symbol, tokensLength]);

  return {
    srcToken: _srcToken,
    dstToken: _dstToken,
  };
};

export const useSubmitButton = (isMain?: boolean, _translations?: Translations) => {
  const translations = useTwapContext()?.translations || _translations;
  const { maker, shouldWrap, shouldUnwrap, wrongNetwork, disclaimerAccepted, setShowConfirmation, showConfirmation, createOrderLoading, isLimitOrder } = useTwapStore((store) => ({
    maker: store.lib?.maker,
    shouldWrap: store.shouldWrap(),
    shouldUnwrap: store.shouldUnwrap(),
    wrongNetwork: store.wrongNetwork,
    disclaimerAccepted: store.disclaimerAccepted,
    setShowConfirmation: store.setShowConfirmation,
    showConfirmation: store.showConfirmation,
    createOrderLoading: store.loading,
    isLimitOrder: store.isLimitOrder,
  }));
  const outAmountLoading = useDstAmount().isLoading;
  const { srcUsdLoading, dstUsdLoading } = useLoadingState();
  const { mutate: approve, isLoading: approveLoading } = useApproveToken();
  const { mutate: createOrder } = useCreateOrder();
  const allowance = useHasAllowanceQuery();
  const { mutate: unwrap, isLoading: unwrapLoading } = useUnwrapToken();
  const { mutate: wrap, isLoading: wrapLoading } = useWrapToken();
  const connect = useTwapContext()?.connect;
  const wizardStore = useWizardStore();
  const { loading: changeNetworkLoading, changeNetwork } = useChangeNetwork();
  const { priceUI } = useTradePrice();
  const waitForLimitPrice = !priceUI && isLimitOrder;
  const warning = useFillWarning()?.message;

  if (wrongNetwork)
    return {
      text: translations.switchNetwork,
      onClick: changeNetwork,
      loading: changeNetworkLoading,
      disabled: changeNetworkLoading,
    };
  if (!maker)
    return {
      text: translations.connect,
      onClick: connect ? connect : undefined,
      loading: false,
      disabled: false,
    };
  if (outAmountLoading || waitForLimitPrice) {
    return { text: "", onClick: undefined, loading: true, disabled: true };
  }
  if (warning)
    return {
      text: warning,
      onClick: undefined,
      disabled: true,
      loading: false,
    };
  if (shouldUnwrap)
    return {
      text: translations.unwrap,
      onClick: unwrap,
      loading: unwrapLoading,
      disabled: unwrapLoading,
    };
  if (shouldWrap)
    return {
      text: translations.wrap,
      onClick: wrap,
      loading: wrapLoading,
      disabled: wrapLoading,
    };
  if (createOrderLoading) {
    return {
      text: translations.confirmOrder,
      onClick: () => {
        if (!showConfirmation) {
          setShowConfirmation(true);
        } else {
          wizardStore.setOpen(true);
        }
      },
      loading: true,
      disabled: false,
    };
  }

  if (allowance.isLoading || srcUsdLoading || dstUsdLoading) {
    return { text: "", onClick: undefined, loading: true, disabled: true };
  }
  if (allowance.data === false)
    return {
      text: translations.approve,
      onClick: approve,
      loading: approveLoading,
      disabled: approveLoading,
    };
  if (showConfirmation)
    return {
      text: translations.confirmOrder,
      onClick: createOrder,
      loading: createOrderLoading,
      disabled: isMain ? true : !disclaimerAccepted || createOrderLoading,
    };
  return {
    text: translations.placeOrder,
    onClick: () => {
      setShowConfirmation(true);
    },
    loading: false,
    disabled: false,
  };
};

export const useGetToken = (address?: string) => {
  const { tokenList } = useTwapContext();

  return useMemo(() => {
    if (!address) return;
    return tokenList?.find((t) => eqIgnoreCase(t.address, address));
  }, [address, tokenList]);
};

function useSubmitOrderCallback() {
  const lib = useTwapStore((s) => s.lib);
  const account = useTwapContext().account;
  return async (
    onTxHash: (txHash: string) => void,
    srcToken: TokenData,
    dstToken: TokenData,
    srcAmount: BN.Value,
    srcChunkAmount: BN.Value,
    dstMinChunkAmountOut: BN.Value,
    deadline: number,
    fillDelaySeconds: number,
    srcUsd: BN.Value,
    askDataParams: any[] = [],
    maxPriorityFeePerGas?: BN.Value,
    maxFeePerGas?: BN.Value
  ): Promise<{ txHash: string; orderId: number }> => {
    if (!lib) {
      throw new Error("lib is not defined");
    }

    const validation = lib?.validateOrderInputs(srcToken, dstToken, srcAmount, srcChunkAmount, dstMinChunkAmountOut, deadline, fillDelaySeconds, srcUsd);
    if (validation !== OrderInputValidation.valid) throw new Error(`invalid inputs: ${validation}`);

    const askData = lib?.config.exchangeType === "PangolinDaasExchange" ? web3().eth.abi.encodeParameters(["address"], askDataParams) : [];

    const askParams = [
      lib.config.exchangeAddress,
      srcToken.address,
      dstToken.address,
      BN(srcAmount).toFixed(0),
      BN(srcChunkAmount).toFixed(0),
      BN(dstMinChunkAmountOut).toFixed(0),
      BN(deadline).div(1000).toFixed(0),
      BN(lib.config.bidDelaySeconds).toFixed(0),
      BN(fillDelaySeconds).toFixed(0),
    ];

    analytics.onCreateOrderRequest(askParams, account);

    let ask: any;
    if (lib.config.twapVersion > 3) {
      askParams.push(askData as any);
      ask = lib.twap.methods.ask(askParams as any);
    } else {
      ask = (lib.twap.methods as any).ask(...askParams);
    }

    const tx = await sendAndWaitForConfirmations(
      ask,
      {
        from: lib.maker,
        maxPriorityFeePerGas,
        maxFeePerGas,
      },
      undefined,
      undefined,
      {
        onTxHash,
      }
    );

    const events = parseEvents(tx, lib.twap.options.jsonInterface);
    return { txHash: tx.transactionHash, orderId: Number(events[0].returnValues.id) };
  };
}

export const usePagination = <T>(list: T[] = [], chunkSize = 5) => {
  const [page, setPage] = useState(0);

  const chunks = useMemo(() => {
    return _.chunk(list, chunkSize);
  }, [list, chunkSize]);

  const pageList = useMemo(() => {
    return chunks[page] || [];
  }, [chunks, page]);

  return {
    list: pageList,
    page: page + 1,
    prevPage: () => setPage((p) => Math.max(p - 1, 0)),
    nextPage: () => setPage((p) => Math.min(p + 1, chunks.length - 1)),
    hasPrevPage: page > 0,
    hasNextPage: page < chunks.length - 1,
    text: `Page ${page + 1} of ${chunks.length}`,
  };
};

const useGetFillsCallback = () => {
  const lib = useTwapStore((s) => s.lib);
  return useCallback(
    async (signal?: AbortSignal) => {
      if (!lib) return {};
      const LIMIT = 1_000;
      let page = 0;
      let fills: any = [];
      const API_URL = "https://hub.orbs.network/api/apikey/subgraphs/id/4NfXEi8rreQsnAr4aJ45RLCKgnjcWX46Lbt9SadiCcz6";

      const fetchFills = async () => {
        const query = `
    {
      orderFilleds(first: ${LIMIT}, orderBy: timestamp, skip: ${page * LIMIT}, where: { userAddress: "${lib.maker}" }) {
        id
        dstAmountOut
        dstFee
        srcFilledAmount
        TWAP_id
        srcAmountIn
        timestamp
        dollarValueIn
        dollarValueOut
      }
    }
  `;

        const payload = await fetch(API_URL, {
          method: "POST",
          body: JSON.stringify({ query }),
          signal,
        });
        const response = await payload.json();
        const orderFilleds = response.data.orderFilleds;

        const grouped = _.map(_.groupBy(orderFilleds, "TWAP_id"), (fills, orderId) => ({
          TWAP_id: Number(orderId),
          dstAmountOut: fills.reduce((acc, it) => acc.plus(BN(it.dstAmountOut)), BN(0)).toString(),
          srcAmountIn: fills.reduce((acc, it) => acc.plus(BN(it.srcAmountIn)), BN(0)).toString(),
          dollarValueIn: fills.reduce((acc, it) => acc.plus(BN(it.dollarValueIn)), BN(0)).toString(),
          dollarValueOut: fills.reduce((acc, it) => acc.plus(BN(it.dollarValueOut)), BN(0)).toString(),
        }));

        fills.push(...grouped);

        if (orderFilleds.length >= LIMIT) {
          page++;
          await fetchFills();
        } else {
          return fills;
        }
      };

      await fetchFills();

      const res = _.mapValues(_.keyBy(fills, "TWAP_id"));
      return res;
    },
    [lib]
  );
};

export const useDstAmount = () => {
  const { dstToken, srcAmount } = useTwapStore((s) => ({
    dstToken: s.dstToken,
    isLimitOrder: s.isLimitOrder,
    srcToken: s.srcToken,
    srcAmount: s.srcAmountUi,
  }));

  const { priceUI, isLoading } = useTradePrice();

  const amount = useMemo(() => {
    return amountBNV2(
      dstToken?.decimals,
      BN(srcAmount)
        .times(priceUI || "0")
        .toFixed()
    );
  }, [dstToken, priceUI, srcAmount]);

  const dstUsd = useDstUsd().value.toString();

  const amountUI = amountUiV2(dstToken?.decimals, amount);

  const usd = useMemo(() => {
    return BN(amountUI || "0")
      .times(dstUsd)
      .toFixed();
  }, [amountUI, dstUsd]);

  return {
    amount,
    amountUI,
    isLoading,
    usd,
  };
};

export const useMarketPriceV2 = (inverted?: boolean) => {
  const twapStore = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));

  const { marketPrice, marketPriceLoading } = useTwapContext();

  return {
    priceUI: useAmountUi(twapStore.dstToken?.decimals, marketPrice),
    price: marketPrice,
    isLoading: marketPriceLoading,
  };
};

export const usePriceDisplay = (price?: string | number) => {
  const [inverted, setInverted] = useState(false);

  const invert = useCallback(() => {
    setInverted((prev) => !prev);
  }, [price]);

  const _price = useMemo(() => {
    if (!price) return;
    return inverted ? BN(1).div(price).toString() : price;
  }, [inverted, price]);

  return {
    invert,
    price: _price,
  };
};

export const useTradePrice = () => {
  const limitPriceStore = useLimitPriceStore();
  const { marketPriceLoading, usePriceUSD } = useTwapContext();
  const percent = 1 + (limitPriceStore.gainPercent || 0) / 100;
  const isCustomLimitPrice = limitPriceStore.limitPrice !== undefined;
  const marketPrice = useMarketPriceV2().priceUI;

  const twapStore = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));

  const priceUI = useMemo(() => {
    if (isCustomLimitPrice) {
      return limitPriceStore.limitPrice;
    }

    if (!marketPrice || BN(marketPrice).isZero()) return;
    return BN(marketPrice || "0")
      .times(percent)
      .toString();
  }, [limitPriceStore.limitPrice, marketPrice, percent, isCustomLimitPrice]);

  const gainPercent = useMemo(() => {
    if (limitPriceStore.gainPercent !== undefined) {
      return limitPriceStore.gainPercent;
    }
    const result = BN(priceUI || "0")
      .dividedBy(marketPrice || "0")
      .minus(1)
      .times(100)
      .decimalPlaces(2)
      .toNumber();
    return isNaN(result) ? 0 : result;
  }, [priceUI, marketPrice, limitPriceStore.gainPercent]);

  const tokenUsd = usePriceUSD?.(twapStore.dstToken?.address);

  const usd = useMemo(() => {
    if (!tokenUsd) return;
    return BN(tokenUsd)
      .times(priceUI || "0")
      .toNumber();
  }, [tokenUsd, priceUI]);

  const onChangeGainPercent = useCallback(
    (value?: number) => {
      limitPriceStore.setGainPercent(value);
      limitPriceStore.onLimitInput(undefined);
    },
    [limitPriceStore.onLimitInput, limitPriceStore.setGainPercent]
  );

  const onChangeLimitPrice = useCallback(
    (value?: string) => {
      limitPriceStore.onLimitInput(value);
      limitPriceStore.setGainPercent(undefined);
    },
    [limitPriceStore.onReset, limitPriceStore.setGainPercent]
  );

  return {
    priceUI,
    price: useAmountBN(priceUI, twapStore.dstToken?.decimals),
    onChange: onChangeLimitPrice,
    onReset: limitPriceStore.onReset,
    isLoading: marketPriceLoading,
    isCustom: isCustomLimitPrice,
    gainPercent,
    onPercent: onChangeGainPercent,
    usd,
  };
};

export const useDstMinAmountOut = () => {
  const limitPrice = useTradePrice().priceUI || "0";
  const srcChunkAmount = useSrcChunkAmount();
  const { srcToken, dstToken, lib, isLimitOrder } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    lib: s.lib,
    dstToken: s.dstToken,
    isLimitOrder: s.isLimitOrder,
  }));

  const amount = useMemo(() => {
    if (lib && srcToken && dstToken && limitPrice && BN(limitPrice).gt(0)) {
      const res = lib.dstMinAmountOut(srcToken!, dstToken!, srcChunkAmount, parsebn(limitPrice), !isLimitOrder).toString();

      return res;
    }
    return BN(1).toString();
  }, [srcToken, dstToken, lib, srcChunkAmount, limitPrice, isLimitOrder]);

  return {
    amount,
    amountUI: useAmountUi(dstToken?.decimals, amount),
  };
};

export const useFillWarning = () => {
  const { translations: translation } = useTwapContext();
  const limitPrice = useTradePrice().priceUI;
  const dstMinAmountOut = useDstMinAmountOut().amount;
  const srcUsd = useSrcUsd().value.toString();
  const srcBalance = useSrcBalance().data?.toString();

  const chunkSize = useSrcChunkAmount();
  const durationUi = useDurationUi();
  const { srcAmount, dstToken, srcToken, lib, isLimitOrder, fillDelayMillis } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
    srcAmount: s.getSrcAmount(),
    isLimitOrder: s.isLimitOrder,
    lib: s.lib,
    fillDelayMillis: s.getFillDelayUiMillis() / 1000,
  }));

  const deadline = useDeadline();
  const dstAmountOut = useDstAmount().amountUI;

  const maxSrcInputAmount = useMaxSrcInputAmount();

  const isNativeTokenAndValueBiggerThanMax = maxSrcInputAmount && srcAmount?.gt(maxSrcInputAmount);
  return useMemo(() => {
    if (!translation) return;
    if (!srcToken || !dstToken || lib?.validateTokens(srcToken, dstToken) === TokensValidation.invalid) {
      return {
        type: "tokens",
        message: translation.selectTokens,
      };
    }
    if (srcAmount.isZero()) {
      return {
        type: "input-amount",
        message: translation.enterAmount,
      };
    }
    if ((srcBalance && srcAmount.gt(srcBalance)) || isNativeTokenAndValueBiggerThanMax) {
      return {
        type: "balance",
        message: `Insufficient ${srcToken.symbol} balance`,
      };
    }
    if (chunkSize.isZero()) {
      return {
        type: "chunk-size",
        message: translation.enterTradeSize,
      };
    }
    if (durationUi.amount === 0) {
      return {
        type: "duration",
        message: translation.enterMaxDuration,
      };
    }
    if (isLimitOrder && BN(dstAmountOut || "").gt(0) && BN(limitPrice || "0").isZero()) {
      return {
        type: "limit-price",
        message: translation.placeOrder || "Place order",
      };
    }
    const valuesValidation = lib?.validateOrderInputs(srcToken!, dstToken!, srcAmount, chunkSize, dstMinAmountOut, deadline, fillDelayMillis, srcUsd);

    if (valuesValidation === OrderInputValidation.invalidSmallestSrcChunkUsd) {
      return {
        type: "min-chunk-size",
        message: translation.tradeSizeMustBeEqual.replace("{usd}", lib?.config.minChunkSizeUsd.toString() || ""),
      };
    }
  }, [
    srcToken,
    dstToken,
    srcAmount,
    srcBalance,
    chunkSize,
    dstMinAmountOut,
    deadline,
    fillDelayMillis,
    durationUi,
    isLimitOrder,
    limitPrice,
    translation,
    isNativeTokenAndValueBiggerThanMax,
    srcUsd,
    maxSrcInputAmount,
    lib,
    dstAmountOut,
  ]);
};

export const useAmountUi = (decimals?: number, value?: string) => {
  return useMemo(() => {
    if (!decimals || !value) return;
    return amountUiV2(decimals, value);
  }, [decimals, value]);
};

export const useSrcAmountUsdUi = () => {
  const { srcToken, srcAmount } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    srcAmount: s.getSrcAmount(),
  }));

  const srcUsd = useSrcUsd().value.toString();

  return useAmountUi(srcToken?.decimals, srcAmount.times(srcUsd).toString());
};

export const useMaxPossibleChunks = () => {
  const { lib, srcAmount, srcToken } = useTwapStore((s) => ({
    srcAmount: s.getSrcAmount().toString(),
    lib: s.lib,
    srcToken: s.srcToken,
  }));

  const srcUsd = useSrcUsd().value.toString();

  return useMemo(() => {
    if (!lib || !srcToken || !srcAmount || !srcUsd) return 1;
    return lib.maxPossibleChunks(srcToken, srcAmount, srcUsd);
  }, [srcAmount, srcToken, srcUsd]);
};

export const useMaxPossibleChunksReady = () => {
  const { lib, srcAmount, srcToken } = useTwapStore((s) => ({
    srcAmount: s.getSrcAmount().toString(),
    lib: s.lib,
    srcToken: s.srcToken,
  }));

  const srcUsd = useSrcUsd().value.toString();

  return Boolean(lib && srcToken && srcAmount && srcUsd && BN(srcUsd).gt(0));
};

export const useChunks = () => {
  const srcUsd = useSrcUsd().value.toString();
  const { srcToken, chunks } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    chunks: s.chunks,
  }));
  const maxPossibleChunks = useMaxPossibleChunks();
  const srcAmountUsd = useSrcAmountUsdUi();

  return useMemo(() => {
    if (!srcUsd || !srcToken) return 1;

    if (chunks !== undefined) return chunks;
    return Math.min(
      maxPossibleChunks,
      BN(srcAmountUsd || "0")
        .idiv(SUGGEST_CHUNK_VALUE)
        .toNumber() || 1
    );
  }, [srcUsd, srcToken, chunks, maxPossibleChunks, srcAmountUsd]);
};

export const useSetChunks = () => {
  const maxPossibleChunks = useMaxPossibleChunks();
  const updateState = useTwapStore((s) => s.updateState);
  return useCallback(
    (chunks = 0) => {
      const _chunks = Math.min(chunks, maxPossibleChunks);
      setQueryParam(QUERY_PARAMS.TRADES_AMOUNT, _chunks > 0 ? _chunks.toString() : undefined);
      updateState({ chunks: _chunks });
    },
    [maxPossibleChunks, updateState]
  );
};

export const useMaxSrcInputAmount = () => {
  const { srcToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
  }));
  const srcBalance = useSrcBalance().data?.toString();

  return useMemo(() => {
    if (srcBalance && isNativeAddress(srcToken?.address || "")) {
      const srcTokenMinimum = amountBN(srcToken, MIN_NATIVE_BALANCE.toString());
      return BN.max(0, BN.min(BN(srcBalance).minus(srcTokenMinimum)));
    }
  }, [srcToken, srcBalance]);
};

export const useAmountBN = (value: string | undefined, decimals: number | undefined) => {
  return useMemo(() => amountBNV2(decimals, value), [value, decimals]);
};

export const useSetSrcAmountPercent = () => {
  const { srcToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
  }));

  const setSrcAmountUi = useSetSrcAmountUi();
  const maxAmount = useMaxSrcInputAmount();
  const srcBalance = useSrcBalance().data?.toString();

  return useCallback(
    (percent: number) => {
      if (!srcToken || !srcBalance) {
        return;
      }

      //max amount will be greater than zero only if the src token is native token
      const _maxAmount = maxAmount && percent === 1 && maxAmount.gt(0) ? maxAmount : undefined;
      const value = amountUi(srcToken, _maxAmount || BN(srcBalance).times(percent));
      setQueryParam(QUERY_PARAMS.INPUT_AMOUNT, value);
      setSrcAmountUi(value);
    },
    [srcToken, maxAmount, srcBalance, setSrcAmountUi]
  );
};

export const useSrcChunkAmountUsdUi = () => {
  const { srcToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
  }));
  const srcChunksAmount = useSrcChunkAmount();
  const srcUsd = useSrcUsd().value.toString();

  const result = useMemo(() => {
    return srcChunksAmount.times(srcUsd).toString();
  }, [srcChunksAmount, srcUsd]);

  return useAmountUi(srcToken?.decimals, result);
};

export const useIsPartialFillWarning = () => {
  const chunks = useChunks();

  const { fillDelayUiMillis } = useTwapStore((s) => ({
    fillDelayUiMillis: s.getFillDelayUiMillis(),
  }));
  const durationMillis = useDurationMillis();

  return useMemo(() => {
    if (!durationMillis) return false;

    return chunks * fillDelayUiMillis > durationMillis;
  }, [chunks, fillDelayUiMillis, durationMillis]);
};

export const useSrcChunkAmount = () => {
  const { lib, srcAmount } = useTwapStore((s) => ({
    lib: s.lib,
    srcAmount: s.getSrcAmount(),
  }));
  const chunks = useChunks();

  return useMemo(() => {
    return lib?.srcChunkAmount(srcAmount, chunks) || BN(0);
  }, [lib, srcAmount, chunks]);
};

export const useDurationUi = () => {
  const { lib, fillDelayUiMillis, customDuration } = useTwapStore((s) => ({
    lib: s.lib,
    fillDelayUiMillis: s.getFillDelayUiMillis(),
    customDuration: s.customDuration,
  }));
  const chunks = useChunks();
  return useMemo(() => {
    if (!lib) {
      return { resolution: TimeResolution.Minutes, amount: 0 };
    }
    if (customDuration.amount !== undefined) return customDuration;

    const _millis = fillDelayUiMillis * 2 * chunks;
    const resolution = _.find([TimeResolution.Days, TimeResolution.Hours, TimeResolution.Minutes], (r) => r <= _millis) || TimeResolution.Minutes;
    return { resolution, amount: Number(BN(_millis / resolution).toFixed(2)) };
  }, [lib, chunks, fillDelayUiMillis, customDuration]);
};

export const useDurationMillis = () => {
  const durationUi = useDurationUi();

  return useMemo(() => {
    return (durationUi.amount || 0) * durationUi.resolution;
  }, [durationUi]);
};

export const useSrcChunkAmountUi = () => {
  const srcToken = useTwapStore((s) => s.srcToken);
  const srcChunksAmount = useSrcChunkAmount();

  return useAmountUi(srcToken?.decimals, srcChunksAmount.toString());
};

export const useChunksBiggerThanOne = () => {
  const { srcToken, srcAmountUi } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    srcAmountUi: s.srcAmountUi,
  }));

  const maxPossibleChunks = useMaxPossibleChunks();

  return useMemo(() => {
    if (!srcToken || !srcAmountUi) return false;
    return maxPossibleChunks > 1;
  }, [maxPossibleChunks, srcToken, srcAmountUi]);
};

export const useDeadline = () => {
  const { confirmationClickTimestamp } = useTwapStore((s) => ({
    confirmationClickTimestamp: s.confirmationClickTimestamp,
  }));

  const durationUi = useDurationUi();

  return useMemo(() => {
    return moment(confirmationClickTimestamp)
      .add((durationUi.amount || 0) * durationUi.resolution)
      .add(1, "minute")
      .valueOf();
  }, [durationUi, confirmationClickTimestamp]);
};

export const useDeadlineUi = () => {
  const deadline = useDeadline();

  return useMemo(() => moment(deadline).format("ll HH:mm"), [deadline]);
};

export const useSetSrcAmountUi = () => {
  const { updateState, lib, srcToken } = useTwapStore((s) => ({
    updateState: s.updateState,
    lib: s.lib,
    srcToken: s.srcToken,
  }));
  const srcUsd = useSrcUsd().value.toString();

  return useCallback(
    (srcAmountUi: string) => {
      const srcAmount = amountBN(srcToken, srcAmountUi);
      const srcAmountUsd = amountUiV2(srcToken?.decimals, srcAmount.times(srcUsd).toString());
      const maxPossibleChunks = (srcToken && lib?.maxPossibleChunks(srcToken, srcAmount, srcUsd)) || 1;
      setQueryParam(QUERY_PARAMS.INPUT_AMOUNT, !srcAmountUi ? undefined : srcAmountUi);
      if (!srcAmountUi) {
        setQueryParam(QUERY_PARAMS.LIMIT_PRICE, undefined);
        setQueryParam(QUERY_PARAMS.TRADES_AMOUNT, undefined);
        setQueryParam(QUERY_PARAMS.TRADE_INTERVAL, undefined);
      }

      updateState({
        srcAmountUi,
        chunks: Math.min(
          maxPossibleChunks,
          BN(srcAmountUsd || "0")
            .idiv(SUGGEST_CHUNK_VALUE)
            .toNumber() || 1
        ),
      });
    },
    [updateState, srcToken, srcUsd, lib]
  );
};

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const usePriceInvert = (_price?: string, srcToken?: TokenData, dstToken?: TokenData) => {
  const [inverted, setInverted] = useState(false);

  const price = useMemo(() => {
    if (!_price) return;
    return inverted ? BN(1).dividedBy(_price).toString() : _price;
  }, [_price, inverted]);

  const leftToken = inverted ? dstToken : srcToken;
  const rightToken = inverted ? srcToken : dstToken;

  const onInvert = useCallback(() => {
    setInverted((prev) => !prev);
  }, []);

  return { price, leftToken, rightToken, onInvert, inverted };
};
