import { Order, Status, TokenData, TokensValidation, TWAPLib } from "@orbs-network/twap";
import { useTwapContext } from "./context";
import Web3 from "web3";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import BN from "bignumber.js";
import { InitLibProps, OrdersData, OrderUI, ParsedOrder, State } from "./types";
import _ from "lodash";
import { analytics } from "./analytics";
import {
  eqIgnoreCase,
  setWeb3Instance,
  switchMetaMaskNetwork,
  zeroAddress,
  estimateGasPrice,
  getPastEvents,
  findBlock,
  block,
  zero,
  isNativeAddress,
} from "@defi.org/web3-candies";
import { getTokenFromTokensList, useTwapStore, useWizardStore, WizardAction, WizardActionStatus } from "./store";
import { REFETCH_BALANCE, REFETCH_GAS_PRICE, REFETCH_ORDER_HISTORY, REFETCH_USD, STALE_ALLOWANCE } from "./consts";
import { QueryKeys } from "./enums";
import { useNumericFormat } from "react-number-format";
import moment from "moment";
import { amountUi } from "./utils";

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
  const wizardStore = useWizardStore();
  const { onSrcTokenSelected, dappTokens } = useTwapContext();

  const { priorityFeePerGas, maxFeePerGas } = useGasPriceQuery();

  const setSrcToken = useTwapStore((state) => state.setSrcToken);
  const reset = useReset();

  return useMutation(
    async () => {
      wizardStore.setAction(WizardAction.WRAP);
      wizardStore.setStatus(WizardActionStatus.PENDING);
      analytics.onWrapClick(srcAmount);
      return lib!.wrapNativeToken(srcAmount, priorityFeePerGas, maxFeePerGas);
    },
    {
      onSuccess: () => {
        analytics.onWrapSuccess();
        wizardStore.setStatus(WizardActionStatus.SUCCESS);
        if (lib?.validateTokens(srcToken!, dstToken!) === TokensValidation.wrapOnly) {
          reset();
          return;
        }
        setSrcToken(lib!.config.wToken);
        const token = getTokenFromTokensList(dappTokens, lib!.config.wToken.address);
        if (token) {
          console.log({ token });

          onSrcTokenSelected?.(token);
        }
      },
      onError: (error: Error) => {
        console.log(error.message);
        wizardStore.setStatus(WizardActionStatus.ERROR, error.message);
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
  const wizardStore = useWizardStore();
  return useMutation(
    async () => {
      wizardStore.setAction(WizardAction.UNWRAP);
      wizardStore.setStatus(WizardActionStatus.PENDING);
      return lib?.unwrapNativeToken(srcTokenAmount, priorityFeePerGas, maxFeePerGas);
    },
    {
      onSuccess: () => {
        reset();
        wizardStore.setStatus(WizardActionStatus.SUCCESS);
      },
      onError: (error: Error) => {
        wizardStore.setStatus(WizardActionStatus.ERROR, error.message);
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
  const wizardStore = useWizardStore();
  return useMutation(
    async () => {
      wizardStore.setAction(WizardAction.APPROVE);
      wizardStore.setStatus(WizardActionStatus.PENDING);
      analytics.onApproveClick(srcAmount);
      await lib?.approve(srcToken!, srcAmount, priorityFeePerGas, maxFeePerGas);
      await refetch();
    },
    {
      onSuccess: async () => {
        analytics.onApproveSuccess();
        wizardStore.setStatus(WizardActionStatus.SUCCESS);
      },
      onError: (error: Error) => {
        console.log(error.message);
        wizardStore.setStatus(WizardActionStatus.ERROR, error.message);
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

  const wizardStore = useWizardStore();
  const reset = useReset();
  const { askDataParams, onTxSubmitted } = useTwapContext();
  const setTokensFromDapp = useSetTokensFromDapp();

  return useMutation(
    async () => {
      const dstToken = {
        ...store.dstToken!,
        address: store.lib!.validateTokens(store.srcToken!, store.dstToken!) === TokensValidation.dstTokenZero ? zeroAddress : store.dstToken!.address,
      };

      onTxSubmitted?.({
        srcToken: store.srcToken!,
        dstToken: dstToken!,
        srcAmount: store.getSrcAmount().toString(),
        dstUSD: store.getDstAmountUsdUi()!,
        dstAmount: store.dstAmount!,
      });
      wizardStore.setAction(WizardAction.CREATE_ORDER);
      wizardStore.setStatus(WizardActionStatus.PENDING);
      const fillDelayMillis = (store.getFillDelayUiMillis() - store.lib!.estimatedDelayBetweenChunksMillis()) / 1000;

      analytics.onConfirmationCreateOrderClick();
      store.setLoading(true);

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
        priorityFeePerGas || zero,
        maxFeePerGas
      );
    },
    {
      onSuccess: async (id) => {
        analytics.onCreateOrderSuccess(id);
        reset();
        store.setOrderCreatedTimestamp(Date.now());
        setTokensFromDapp();
        wizardStore.setStatus(WizardActionStatus.SUCCESS);
      },
      onError: (error: Error) => {
        analytics.onCreateOrderError(error.message);
        if ((error as any).code === 4001) {
          analytics.onCreateOrderRejected();
        }
        wizardStore.setStatus(WizardActionStatus.ERROR, error.message);
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

  return useCallback(
    (values?: Partial<State>) => {
      setStoreOverrideValues(values || {});
    },
    [setStoreOverrideValues]
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
        analytics.onCancelOrderSuccess(orderId.toString());
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

  const price = inverted ? BN(1).div(order?.ui.dstPriceFor1Src || "0") : order?.ui.dstPriceFor1Src;
  return {
    inverted,
    toggleInverted: () => setInverted(!inverted),
    price,
    priceUi: price?.toFormat(),
    leftToken: inverted ? order?.ui.dstToken : order?.ui.srcToken,
    rightToken: !inverted ? order?.ui.dstToken : order?.ui.srcToken,
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
    srcUsdLoading: (!srcToken && false) || srcUSD.isLoading || srcUSD.value?.isZero(),
    dstUsdLoading: (dstToken && !dstUSD.value) || dstUSD.isLoading || dstUSD.value?.isZero(),
    srcBalanceLoading: srcBalance.isLoading,
    dstBalanceLoading: dstBalance.isLoading,
  };
};

export const useSrcUsd = () => {
  const srcToken = useTwapStore((store) => store.srcToken);
  const setSrcUsd = useTwapStore((store) => store.setSrcUsd);
  return usePriceUSD(srcToken?.address, setSrcUsd);
};

export const useDstUsd = () => {
  const dstToken = useTwapStore((store) => store.dstToken);
  const setDstUsd = useTwapStore((store) => store.setDstUsd);
  return usePriceUSD(dstToken?.address, setDstUsd);
};

export const useSrcBalance = () => {
  const srcToken = useTwapStore((store) => store.srcToken);
  const setSrcBalance = useTwapStore((store) => store.setSrcBalance);

  return useBalanceQuery(srcToken, setSrcBalance);
};

export const useDstBalance = () => {
  const dstToken = useTwapStore((store) => store.dstToken);
  const setDstBalance = useTwapStore((store) => store.setDstBalance);
  return useBalanceQuery(dstToken, setDstBalance);
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

export const usePriceUSD = (address?: string, onSuccess?: (value: BN) => void) => {
  const context = useTwapContext();
  const lib = useTwapStore((state) => state.lib);
  const _address = address && isNativeAddress(address) ? lib?.config.wToken.address : address;
  const usd = context.usePriceUSD?.(_address);

  const query = useQuery(
    [QueryKeys.GET_USD_VALUE, _address],
    async () => {
      const res = await context.priceUsd!(_address!);

      return new BN(res);
    },
    {
      enabled: !!lib && !!_address && !!context.priceUsd,
      onSuccess,
      refetchInterval: REFETCH_USD,
    }
  );

  useEffect(() => {
    if (context.usePriceUSD && onSuccess) {
      onSuccess?.(new BN(usd || 0));
    }
  }, [onSuccess, usd]);

  return {
    value: new BN(query.data || usd || 0),
    isLoading: context.priceUsd ? query.isLoading && query.fetchStatus !== "idle" : !usd,
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
  const tokenList = useTokenList();

  const orderCreatedTimestamp = useTwapStore((state) => state.orderCreatedTimestamp);
  const lib = useTwapStore((state) => state.lib);

  const query = useQuery<OrdersData>(
    [QueryKeys.GET_ORDER_HISTORY, lib?.maker, lib?.config.chainId, orderCreatedTimestamp],
    async () => {
      const orders = await lib!.getAllOrders();

      const parsedOrders = _.map(orders, (o): ParsedOrder => {
        const progress = lib!.orderProgress(o) < 0.99 ? lib!.orderProgress(o) * 100 : 100;
        const status = progress === 100 ? Status.Completed : lib!.status(o);
        return {
          order: o,
          ui: {
            totalChunks: o.ask.srcAmount.div(o.ask.srcBidAmount).integerValue(BN.ROUND_CEIL).toNumber(),
            status: status,
            srcToken: tokenList.find((t) => eqIgnoreCase(o.ask.srcToken, t.address)),
            dstToken: tokenList.find((t) => eqIgnoreCase(o.ask.dstToken, t.address)),
          },
        };
      }).filter((o) => o.ui.srcToken && o.ui.dstToken);

      return _.chain(_.compact(parsedOrders))
        .orderBy((o: ParsedOrder) => o.order.time, "desc")
        .groupBy((o: ParsedOrder) => o.ui.status)
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

export const useOrderPastEvents = (order: OrderUI, enabled?: boolean) => {
  const lib = useTwapStore((store) => store.lib);
  const [haveValue, setHaveValue] = useState(false);

  const _enabled = haveValue ? true : !!enabled;

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

      return {
        dstAmountOut: amountUi(order!.ui.dstToken, dstAmountOut),
        dstAmountOutUsdPrice: amountUi(order!.ui.dstToken, dstAmountOut.times(order!.ui.dstUsd)),
      };
    },
    {
      enabled: !!lib && !!_enabled && !!order,
      retry: 5,
      staleTime: Infinity,
      onSuccess: () => setHaveValue(true),
    }
  );
};

export const useFormatNumber = ({ value, decimalScale = 3, prefix, suffix }: { value?: string | number; decimalScale?: number; prefix?: string; suffix?: string }) => {
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

  const result = useNumericFormat({
    allowLeadingZeros: true,
    thousandSeparator: ",",
    displayType: "text",
    value: value || "",
    decimalScale: decimals,
    prefix,
    suffix,
  });

  return result.value?.toString();
};

export const useSrcAmountNotZero = () => {
  const value = useTwapStore((store) => store.getSrcAmount());

  return value.gt(0);
};

export const useResetLimitPrice = () => {
  return useTwapStore((store) => store.setLimitOrderPriceUi);
};

const useTokenSelect = (parseTokenProps?: (token: any) => any) => {
  const { onSrcTokenSelected, onDstTokenSelected, parseToken } = useTwapContext();
  return useCallback(
    ({ isSrc, token }: { isSrc: boolean; token: any }) => {
      const _parsedToken = parseToken || parseTokenProps;
      const parsedToken = _parsedToken ? _parsedToken(token) : token;
      if (isSrc) {
        analytics.onSrcTokenClick(parsedToken?.symbol);
        useTwapStore.getState().setSrcToken(parsedToken);
        onSrcTokenSelected?.(token);
      } else {
        analytics.onDstTokenClick(parsedToken?.symbol);
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
  const switchTokens = useTwapStore((s) => s.switchTokens);
  const srcToken = useTwapStore((s) => s.srcToken);
  const dstToken = useTwapStore((s) => s.dstToken);
  return useCallback(() => {
    switchTokens();
    const _srcToken = getTokenFromTokensList(dappTokens, srcToken?.address || srcToken?.symbol);
    const _dstToken = getTokenFromTokensList(dappTokens, dstToken?.address || dstToken?.symbol);
    srcToken && onSrcTokenSelected?.(_dstToken);
    dstToken && onDstTokenSelected?.(_srcToken);
  }, [_.size(dappTokens), srcToken?.address, srcToken?.symbol, dstToken?.address, dstToken?.symbol, onSrcTokenSelected, onDstTokenSelected]);
};

export const useOrdersTabs = () => {
  const { data: orders } = useOrdersHistoryQuery();

  const _orders = orders || {};

  const {
    uiPreferences: { orderTabsToExclude = ["All"] },
  } = useTwapContext();

  return useMemo(() => {
    const keys = ["All", ..._.keys(Status)];

    const res = _.filter(keys, (it) => !orderTabsToExclude?.includes(it));
    const mapped = _.map(res, (it) => {
      if (it === "All") {
        return { All: _.size(_.flatMap(_orders)) || 0 };
      }
      return { [it]: _.size(_orders[it as Status]) || 0 };
    });

    return _.reduce(mapped, (acc, it) => ({ ...acc, ...it }), {});
  }, [orders]);
};

export const useSelectTokenCallback = (parseTokenProps?: (token: any) => any) => {
  const srcTokenAddress = useTwapStore((s) => s.srcToken)?.address;
  const dstTokenAddress = useTwapStore((s) => s.dstToken)?.address;
  const { parseToken } = useTwapContext();

  const onTokenSelect = useTokenSelect(parseTokenProps);

  const switchTokens = useSwitchTokens();
  return useCallback(
    (args: { isSrc: boolean; token: any }) => {
      const _parseToken = parseToken || parseTokenProps;
      const parsedToken = _parseToken ? _parseToken(args.token) : args.token;
      if (eqIgnoreCase(parsedToken?.address || "", srcTokenAddress || "") || eqIgnoreCase(parsedToken?.address || "", dstTokenAddress || "")) {
        switchTokens();
        return;
      }
      onTokenSelect(args);
    },
    [srcTokenAddress, dstTokenAddress, switchTokens, parseToken, onTokenSelect, parseTokenProps]
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

export const useSubmitButton = (isMain?: boolean) => {
  const translations = useTwapContext().translations;
  const { maker, shouldWrap, shouldUnwrap, wrongNetwork, disclaimerAccepted, setShowConfirmation, showConfirmation, warning, createOrderLoading } = useTwapStore((store) => ({
    maker: store.lib?.maker,
    shouldWrap: store.shouldWrap(),
    shouldUnwrap: store.shouldUnwrap(),
    wrongNetwork: store.wrongNetwork,
    disclaimerAccepted: store.disclaimerAccepted,
    setShowConfirmation: store.setShowConfirmation,
    showConfirmation: store.showConfirmation,
    warning: store.getFillWarning(translations),
    createOrderLoading: store.loading,
  }));
  const outAmountLoading = useOutAmountLoading();
  const { srcUsdLoading, dstUsdLoading } = useLoadingState();
  const { mutate: approve, isLoading: approveLoading } = useApproveToken();
  const { mutate: createOrder } = useCreateOrder();
  const allowance = useHasAllowanceQuery();
  const { mutate: unwrap, isLoading: unwrapLoading } = useUnwrapToken();
  const { mutate: wrap, isLoading: wrapLoading } = useWrapToken();
  const connect = useTwapContext().connect;
  const wizardStore = useWizardStore();
  const { loading: changeNetworkLoading, changeNetwork } = useChangeNetwork();

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
  if (outAmountLoading) {
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
      text: "",
      onClick: () => {
        if (!showConfirmation) {
          setShowConfirmation(true);
        } else {
          wizardStore.setOpen(true);
        }
        analytics.onOpenConfirmationModal();
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
      analytics.onOpenConfirmationModal();
    },
    loading: false,
    disabled: false,
  };
};

export const useParseOrderUi = (o?: ParsedOrder) => {
  const lib = useTwapStore((s) => s.lib);
  const { value: srcUsd = zero } = usePriceUSD(o?.order.ask.srcToken);
  const { value: dstUsd = zero } = usePriceUSD(o?.order.ask.dstToken);

  return useMemo(() => {
    if (!lib || !o) return;
    const srcToken = o.ui.srcToken;
    const dstToken = o.ui.dstToken;
    if (!srcToken || !dstToken) return;

    const isMarketOrder = lib.isMarketOrder(o.order);
    const dstPriceFor1Src = lib.dstPriceFor1Src(srcToken, dstToken, srcUsd, dstUsd, o.order.ask.srcBidAmount, o.order.ask.dstMinAmount);
    const srcRemainingAmount = o.order.ask.srcAmount.minus(o.order.srcFilledAmount);
    const progress = lib.orderProgress(o.order) < 0.99 ? lib.orderProgress(o.order) * 100 : 100;

    return {
      order: o.order,
      ui: {
        ...o.ui,
        progress,
        isMarketOrder,
        dstPriceFor1Src,
        srcUsd,
        dstUsd,
        srcUsdUi: srcUsd.toString(),
        dstUsdUi: dstUsd.toString(),
        srcAmountUi: amountUi(srcToken, o.order.ask.srcAmount),
        srcAmountUsdUi: amountUi(srcToken, o.order.ask.srcAmount.times(srcUsd)),
        srcChunkAmountUi: amountUi(srcToken, o.order.ask.srcBidAmount),
        srcChunkAmountUsdUi: amountUi(srcToken, o.order.ask.srcBidAmount.times(srcUsd)),
        srcFilledAmountUi: amountUi(srcToken, o.order.srcFilledAmount),
        srcFilledAmountUsdUi: amountUi(srcToken, o.order.srcFilledAmount.times(srcUsd)),
        srcRemainingAmountUi: amountUi(srcToken, srcRemainingAmount),
        srcRemainingAmountUsdUi: amountUi(srcToken, srcRemainingAmount.times(srcUsd)),
        dstMinAmountOutUi: amountUi(dstToken, o.order.ask.dstMinAmount),
        dstMinAmountOutUsdUi: amountUi(dstToken, o.order.ask.dstMinAmount.times(dstUsd)),
        fillDelay: o.order.ask.fillDelay * 1000 + lib.estimatedDelayBetweenChunksMillis(),
        createdAtUi: moment(o.order.time * 1000).format("ll HH:mm"),
        deadlineUi: moment(o.order.ask.deadline * 1000).format("ll HH:mm"),
        prefix: isMarketOrder ? "~" : "≥",
      },
    };
  }, [lib, o, srcUsd, dstUsd]);
};

export const useOutAmountLoading = () => {
  const { dstAmountLoading, srcAmount } = useTwapStore((s) => ({
    dstAmountLoading: s.dstAmountLoading,
    srcAmount: s.getSrcAmount(),
  }));

  return useMemo(() => {
    if (srcAmount.isZero()) return false;
    return dstAmountLoading;
  }, [dstAmountLoading, srcAmount]);
};
