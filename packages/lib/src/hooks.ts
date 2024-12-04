import { OrderInputValidation, Status, TokenData, TokensValidation, TWAPLib } from "@orbs-network/twap";
import { useTwapContext } from "./context";
import Web3 from "web3";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import BN from "bignumber.js";
import { InitLibProps, OrdersData, OrderUI, ParsedOrder, State, Translations } from "./types";
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
  web3,
  parseEvents,
  sendAndWaitForConfirmations,
  maxUint256,
  parsebn,
} from "@defi.org/web3-candies";
import { TimeResolution, useLimitPriceStore, useOrdersStore, useTwapStore, useWizardStore, WizardAction, WizardActionStatus } from "./store";
import {
  AMOUNT_TO_BORROW,
  feeOnTransferDetectorAddresses,
  MIN_NATIVE_BALANCE,
  QUERY_PARAMS,
  REFETCH_BALANCE,
  REFETCH_GAS_PRICE,
  REFETCH_ORDER_HISTORY,
  REFETCH_USD,
  STALE_ALLOWANCE,
  SUGGEST_CHUNK_VALUE,
} from "./consts";
import { QueryKeys } from "./enums";
import { useNumericFormat } from "react-number-format";
import moment from "moment";
import { amountBN, amountBNV2, amountUi, amountUiV2, devideCurrencyAmounts, getTokenFromTokensList, safeInteger, setQueryParam, supportsTheGraphHistory } from "./utils";
import { getOrderFills } from "./helper";
import FEE_ON_TRANSFER_ABI from "./abi/FEE_ON_TRANSFER.json";
/**
 * Actions
 */

export const useResetStore = () => {
  const resetTwapStore = useTwapStore((state) => state.reset);
  const storeOverride = useTwapContext().storeOverride || {};

  return (args: Partial<State> = {}) => {
    resetTwapStore({ ...storeOverride, ...args });
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

export const useWrapToken = (disableWizard?: boolean) => {
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
      if (!disableWizard) {
        wizardStore.setAction(WizardAction.WRAP);
        wizardStore.setStatus(WizardActionStatus.PENDING);
      }
      analytics.onWrapRequest();
      return lib!.wrapNativeToken(srcAmount, priorityFeePerGas, maxFeePerGas);
    },
    {
      onSuccess: () => {
        analytics.onWrapSuccess();
        !disableWizard && wizardStore.setStatus(WizardActionStatus.SUCCESS);
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
        !disableWizard && wizardStore.setStatus(WizardActionStatus.ERROR, error.message);
        analytics.onWrapError(error.message);
      },
    }
  );
};

export const useUnwrapToken = (disableWizard?: boolean) => {
  const lib = useTwapStore((state) => state.lib);
  const { priorityFeePerGas, maxFeePerGas } = useGasPriceQuery();
  const reset = useReset();
  const srcTokenAmount = useTwapStore((state) => state.getSrcAmount());
  const wizardStore = useWizardStore();
  return useMutation(
    async () => {
      if (!disableWizard) {
        wizardStore.setAction(WizardAction.UNWRAP);
        wizardStore.setStatus(WizardActionStatus.PENDING);
      }

      return lib?.unwrapNativeToken(srcTokenAmount, priorityFeePerGas, maxFeePerGas);
    },
    {
      onSuccess: () => {
        reset();
        !disableWizard && wizardStore.setStatus(WizardActionStatus.SUCCESS);
      },
      onError: (error: Error) => {
        !disableWizard && wizardStore.setStatus(WizardActionStatus.ERROR, error.message);
      },
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
        console.log(error.message);
        !disableWizard && wizardStore.setStatus(WizardActionStatus.ERROR, error.message);
        analytics.onApproveError(error.message);
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

export const useCreateOrder = (disableWizard?: boolean, onSuccess?: () => void) => {
  const { maxFeePerGas, priorityFeePerGas } = useGasPriceQuery();
  const store = useTwapStore();
  const { refetch } = useOrdersHistoryQuery();
  const submitOrder = useSubmitOrderCallback();
  const { setTab } = useOrdersStore();

  const wizardStore = useWizardStore();
  const { askDataParams, onTxSubmitted } = useTwapContext();
  const dstMinAmountOut = useDstMinAmountOut();
  const dstAmountUsdUi = useDstAmountUsdUi();
  const dstAmount = useDstAmount().outAmount;
  const srcUsd = useSrcUsd().value.toString();
  const totalTrades = useChunks();
  const tradeSize = useSrcChunkAmount();
  const srcChunkAmount = useSrcChunkAmount();
  const deadline = useDeadline();
  const onResetLimitPrice = useLimitPriceStore().onReset;
  return useMutation(
    async () => {
      const dstToken = {
        ...store.dstToken!,
        address: store.lib!.validateTokens(store.srcToken!, store.dstToken!) === TokensValidation.dstTokenZero ? zeroAddress : store.dstToken!.address,
      };

      console.log({
        srcToken: store.srcToken!,
        dstToken: dstToken,
        srcAmount: store.getSrcAmount().toString(),
        dstAmount: dstAmount.raw,
        dstUSD: dstAmountUsdUi!,
        getSrcChunkAmount: tradeSize.toString(),
        getDeadline: deadline,
        fillDelayMillis: store.getFillDelayUiMillis(),
        isLimit: store.isLimitOrder,
      });

      if (!disableWizard) {
        wizardStore.setAction(WizardAction.CREATE_ORDER);
        wizardStore.setStatus(WizardActionStatus.PENDING);
      }

      const fillDelayMillis = (store.getFillDelayUiMillis() - store.lib!.estimatedDelayBetweenChunksMillis()) / 1000;

      store.setLoading(true);

      const onTxHash = (txHash: string) => {
        setTab(0);
        store.updateState({
          waitingForOrdersUpdate: true,
          txHash,
        });
      };

      const order = await submitOrder(
        onTxHash,
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
        dstAmount: dstAmount.raw,
        txHash: order.txHash,
      });

      await refetch();
      return order;
    },
    {
      onSuccess: async (result) => {
        analytics.onCreateOrderSuccess(result.txHash, result.orderId);
        onSuccess?.();
        onResetLimitPrice();
        !disableWizard && wizardStore.setStatus(WizardActionStatus.SUCCESS);
      },
      onError: (error: Error) => {
        analytics.onCreateOrderError(error.message);
        !disableWizard && wizardStore.setStatus(WizardActionStatus.ERROR, error.message);
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
  const { refetch } = useOrdersHistoryQuery();
  const { priorityFeePerGas, maxFeePerGas } = useGasPriceQuery();
  return useMutation(
    async (orderId: number) => {
      analytics.onCancelOrder(orderId);
      return lib?.cancelOrder(orderId, priorityFeePerGas, maxFeePerGas);
    },
    {
      onSuccess: (_result, orderId) => {
        analytics.onCancelOrderSuccess();
        refetch();
      },
      onError: (error: Error) => {
        analytics.onCanelOrderError(error.message);
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
  const srcUSD = useSrcUsd();
  const dstUSD = useDstUsd();
  const srcBalance = useSrcBalance();
  const dstBalance = useDstBalance();

  return {
    srcUsdLoading: srcUSD.isLoading,
    dstUsdLoading: dstUSD.isLoading,
    srcBalanceLoading: srcBalance.isLoading,
    dstBalanceLoading: dstBalance.isLoading,
  };
};

export const useSrcUsd = () => {
  const { value, lib } = useTwapStore((store) => ({
    value: store.srcUsd || zero,
    lib: store.lib,
  }));

  return {
    value,
    isLoading: value.isZero() && !!lib,
  };
};

export const useDstUsd = () => {
  const { value, lib } = useTwapStore((store) => ({
    value: store.dstUsd || zero,
    lib: store.lib,
  }));
  return {
    value,
    isLoading: value.isZero() && !!lib,
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

export const useHasAllowanceQuery = () => {
  const { lib, amount, srcToken } = useTwapStore((state) => ({
    lib: state.lib,
    amount: state.getSrcAmount(),
    srcToken: state.srcToken,
  }));
  const query = useQuery(
    [QueryKeys.GET_ALLOWANCE, lib?.config.chainId, srcToken?.address, amount.toString()],
    async () => {
      const result = await lib!.hasAllowance(srcToken!, amount);
      return result;
    },
    {
      enabled: !!lib && !!srcToken && amount.gt(0),
      staleTime: STALE_ALLOWANCE,
      refetchOnWindowFocus: true,
    }
  );
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
  return { ...query, isLoading: query.isLoading && query.fetchStatus !== "idle" && !!token };
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
  const { lib, updateState, showConfirmation, srcToken } = useTwapStore((state) => ({
    lib: state.lib,
    updateState: state.updateState,
    showConfirmation: state.showConfirmation,
    srcToken: state.srcToken,
  }));
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

export const useSetTokensFromDapp = () => {
  const context = useTwapContext();
  const srcTokenAddressOrSymbol = context.srcToken;
  const dstTokenAddressOrSymbol = context.dstToken;

  const { setSrcToken, setDstToken } = useTwapStore((state) => ({
    setSrcToken: state.setSrcToken,
    setDstToken: state.setDstToken,
  }));
  const tokensList = useTokenList();
  const tokensReady = _.size(tokensList) > 0;
  const wrongNetwork = useTwapStore((store) => store.wrongNetwork);

  return useCallback(() => {
    if (!tokensReady || wrongNetwork || wrongNetwork == null) return;

    if (srcTokenAddressOrSymbol) {
      setSrcToken(getTokenFromTokensList(tokensList, srcTokenAddressOrSymbol));
    }
    if (dstTokenAddressOrSymbol) {
      setDstToken(getTokenFromTokensList(tokensList, dstTokenAddressOrSymbol));
    }
  }, [srcTokenAddressOrSymbol, dstTokenAddressOrSymbol, tokensReady, wrongNetwork]);
};

export const useParseTokens = (dappTokens: any, parseToken?: (rawToken: any) => TokenData | undefined): TokenData[] => {
  const listLength = _.size(dappTokens);

  const parse = parseToken ? parseToken : (t: any) => t;

  return useMemo(() => _.compact(_.map(dappTokens, parse)), [listLength]);
};

export const useOrderPastEvents = (order?: ParsedOrder, enabled?: boolean) => {
  const lib = useTwapStore((store) => store.lib);
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
  const { onReset, onInvert } = useLimitPriceV2();

  const { srcToken, dstToken, updateState } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
    srcAmountUi: s.srcAmountUi,
    updateState: s.updateState,
  }));
  const dstAmount = useDstAmount().outAmount.ui;
  return useCallback(() => {
    updateState({
      srcToken: dstToken,
      dstToken: srcToken,
      srcAmountUi: "",
    });
    onReset();
    const _srcToken = getTokenFromTokensList(dappTokens, srcToken?.address) || getTokenFromTokensList(dappTokens, srcToken?.symbol);
    const _dstToken = getTokenFromTokensList(dappTokens, dstToken?.address) || getTokenFromTokensList(dappTokens, dstToken?.symbol);
    srcToken && onSrcTokenSelected?.(_dstToken);
    dstToken && onDstTokenSelected?.(_srcToken);
  }, [dstAmount, _.size(dappTokens), srcToken?.address, srcToken?.symbol, dstToken?.address, dstToken?.symbol, onSrcTokenSelected, onDstTokenSelected, onReset, onInvert]);
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

export const useSubmitButton = (isMain?: boolean, _translations?: Translations) => {
  const translations = useTwapContext()?.translations || _translations;
  const { maker, shouldWrap, shouldUnwrap, wrongNetwork, disclaimerAccepted, setShowConfirmation, srcToken, showConfirmation, createOrderLoading, srcAmount, srcUsd, dstUsd } =
    useTwapStore((store) => ({
      maker: store.lib?.maker,
      shouldWrap: store.shouldWrap(),
      shouldUnwrap: store.shouldUnwrap(),
      wrongNetwork: store.wrongNetwork,
      disclaimerAccepted: store.disclaimerAccepted,
      setShowConfirmation: store.setShowConfirmation,
      showConfirmation: store.showConfirmation,
      createOrderLoading: store.loading,
      srcAmount: store.getSrcAmount().toString(),
      srcUsd: store.srcUsd?.toString(),
      dstUsd: store.dstUsd?.toString(),
      srcToken: store.srcToken,
    }));
  const reset = useResetStore();
  const outAmountLoading = useDstAmount().isLoading;
  const { mutate: approve, isLoading: approveLoading } = useApproveToken();
  const { mutate: createOrder } = useCreateOrder(false, reset);
  const allowance = useHasAllowanceQuery();
  const { mutate: unwrap, isLoading: unwrapLoading } = useUnwrapToken();
  const { mutate: wrap, isLoading: wrapLoading } = useWrapToken();
  const connect = useTwapContext()?.connect;
  const wizardStore = useWizardStore();
  const { loading: changeNetworkLoading, changeNetwork } = useChangeNetwork();
  const warning = useFillWarning();
  const noLiquidity = useNoLiquidity();

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

  if (!srcAmount || BN(srcAmount || "0").isZero()) {
    return {
      text: translations.enterAmount,
      disabled: true,
    };
  }

  if (outAmountLoading || BN(srcUsd || "0").isZero() || BN(dstUsd || "0").isZero() || allowance.isLoading) {
    return { text: translations.outAmountLoading, onClick: undefined, disabled: true };
  }

  if (noLiquidity) {
    return {
      text: translations.noLiquidity,
      disabled: true,
      loading: false,
    };
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

export const useParseOrderUi = (o?: ParsedOrder, expanded?: boolean) => {
  const lib = useTwapStore((s) => s.lib);
  const { value: srcUsd = zero } = usePriceUSD(o?.order.ask.srcToken);
  const { value: dstUsd = zero } = usePriceUSD(o?.order.ask.dstToken);

  const { data: dstAmountOutFromEvents } = useOrderPastEvents(o, expanded);

  return useMemo(() => {
    if (!lib || !o) return;
    const srcToken = o.ui.srcToken;
    const dstToken = o.ui.dstToken;
    if (!srcToken || !dstToken) return;
    const isTheGrapth = supportsTheGraphHistory(lib.config.chainId);

    const isMarketOrder = lib.isMarketOrder(o.order);
    const dstPriceFor1Src = lib.dstPriceFor1Src(srcToken, dstToken, srcUsd, dstUsd, o.order.ask.srcBidAmount, o.order.ask.dstMinAmount);
    const dstAmount = isTheGrapth ? o.ui.dstAmount : dstAmountOutFromEvents?.toString();
    const srcFilledAmount = isTheGrapth ? o.ui.srcFilledAmount : o.order.srcFilledAmount;

    return {
      order: o.order,
      ui: {
        ...o.ui,
        isMarketOrder,
        dstPriceFor1Src,
        srcUsd,
        dstUsd,
        srcUsdUi: srcUsd.toString(),
        dstUsdUi: dstUsd.toString(),
        srcAmountUi: amountUi(srcToken, o.order.ask.srcAmount),
        srcAmountUsdUi: o.ui.dollarValueIn || amountUi(srcToken, o.order.ask.srcAmount.times(srcUsd)),
        srcChunkAmountUi: amountUi(srcToken, o.order.ask.srcBidAmount),
        srcChunkAmountUsdUi: amountUi(srcToken, o.order.ask.srcBidAmount.times(srcUsd)),
        srcFilledAmountUi: amountUi(srcToken, BN(srcFilledAmount || "0")),
        dstMinAmountOutUi: amountUi(dstToken, o.order.ask.dstMinAmount),
        dstMinAmountOutUsdUi: amountUi(dstToken, o.order.ask.dstMinAmount.times(dstUsd)),
        fillDelay: o.order.ask.fillDelay * 1000 + lib.estimatedDelayBetweenChunksMillis(),
        createdAtUi: moment(o.order.time * 1000)
          .locale("en")
          .format("ll HH:mm"),
        deadlineUi: moment(o.order.ask.deadline * 1000)
          .locale("en")
          .format("ll HH:mm"),
        prefix: isMarketOrder ? "~" : "~",
        dstAmount: !dstAmount ? undefined : amountUi(dstToken, BN(dstAmount || "0")),
        dstAmountUsd: o.ui.dollarValueOut ? o.ui.dollarValueOut : !dstAmount ? undefined : amountUi(dstToken, BN(dstAmount || "0").times(dstUsd)),
        dstUsdLoading: !dstUsd || dstUsd.isZero(),
        progress: o?.ui.progress,
      },
    };
  }, [lib, o, srcUsd, dstUsd, dstAmountOutFromEvents]);
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

export const useDstAmount = () => {
  const { dstAmountOut, dstAmountLoading } = useTwapContext();
  const { dstToken, isLimitOrder, srcToken, srcAmount } = useTwapStore((s) => ({
    dstToken: s.dstToken,
    isLimitOrder: s.isLimitOrder,
    srcToken: s.srcToken,
    srcAmount: s.getSrcAmount().toString(),
  }));

  const limitPrice = useLimitPriceV2().limitPrice?.original;

  return useMemo(() => {
    const dexAmounOut = dstAmountOut;

    let outAmount = dexAmounOut;
    if (isLimitOrder && srcToken) {
      outAmount = amountBN(
        dstToken,
        BN(amountUiV2(srcToken?.decimals, srcAmount))
          .times(limitPrice || "0")
          .toString()
      ).toString();
    }
    return {
      isLoading: dstAmountLoading,
      dexAmounOut: {
        ui: amountUiV2(dstToken?.decimals, dexAmounOut),
        raw: safeInteger(dexAmounOut),
      },
      outAmount: {
        ui: amountUiV2(dstToken?.decimals, outAmount),
        raw: safeInteger(outAmount),
      },
    };
  }, [dstAmountOut, dstAmountLoading, dstToken, limitPrice, isLimitOrder, srcToken, srcAmount]);
};

export const useMarketPriceV2 = (inverted?: boolean) => {
  const twapStore = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
    srcAmount: s.getSrcAmount().toString(),
  }));

  const { dstAmountOut, dstAmountLoading } = useTwapContext();
  const marketPrice = useMemo(() => {
    if (BN(dstAmountOut || "0").isZero() || BN(twapStore.srcAmount || "0").isZero()) return;

    const original = devideCurrencyAmounts({ srcToken: twapStore.srcToken, dstToken: twapStore.dstToken, dstAmount: dstAmountOut, srcAmount: twapStore.srcAmount });
    if (!original || BN(original || "0").isZero()) return;

    return {
      original,
      toggled: inverted ? BN(1).div(original).toString() : original,
    };
  }, [dstAmountOut, twapStore.srcToken, twapStore.dstToken, inverted, twapStore.srcAmount]);

  return {
    marketPrice,
    leftToken: inverted ? twapStore.dstToken : twapStore.srcToken,
    rightToken: inverted ? twapStore.srcToken : twapStore.dstToken,
    loading: dstAmountLoading,
  };
};

export const useLimitPriceV2 = () => {
  const limitPriceStore = useLimitPriceStore();
  const { enableQueryParams, dstAmountLoading, defaultLimitPriceDecreasePercent = 5 } = useTwapContext();
  const marketPrice = useMarketPriceV2().marketPrice?.original;
  const twapStore = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));

  const limitPercent = (100 - defaultLimitPriceDecreasePercent) / 100;

  const getToggled = useCallback(
    (inverted: boolean, invertCustom?: boolean) => {
      if (limitPriceStore.isCustom && invertCustom && inverted && limitPriceStore.limitPrice) {
        return BN(1).dividedBy(limitPriceStore.limitPrice).toString();
      }
      if (limitPriceStore.isCustom) {
        return limitPriceStore.limitPrice;
      }

      if (limitPriceStore.priceFromQueryParams && inverted) {
        return BN(1).dividedBy(limitPriceStore.priceFromQueryParams).toString();
      }

      if (limitPriceStore.priceFromQueryParams) {
        return limitPriceStore.priceFromQueryParams;
      }

      if (!marketPrice || BN(marketPrice).isZero()) return;

      if (inverted) {
        return BN(limitPercent)
          .dividedBy(marketPrice || "0")
          .toString();
      }
      return BN(marketPrice || "0")
        .times(limitPercent)
        .toString();
    },
    [marketPrice, limitPriceStore.priceFromQueryParams, limitPriceStore.isCustom, limitPriceStore.limitPrice]
  );

  const limitPrice = useMemo(() => {
    const getOriginal = (percent: number) => {
      if (limitPriceStore.limitPrice && limitPriceStore.isCustom && limitPriceStore.inverted) {
        return BN(1)
          .dividedBy(limitPriceStore.limitPrice || "")
          .toString();
      }
      if (limitPriceStore.isCustom) {
        return limitPriceStore.limitPrice;
      }
      if (limitPriceStore.priceFromQueryParams) {
        return limitPriceStore.priceFromQueryParams;
      }
      if (!marketPrice || BN(marketPrice).isZero()) return;
      return BN(marketPrice || "0")
        .times(percent)
        .toString();
    };
    const toggled = getToggled(limitPriceStore.inverted);
    const original = getOriginal(limitPercent);
    return {
      toggled: BN(toggled || "0").isZero() ? "" : toggled,
      original: BN(original || "0").isZero() ? "" : original,
    };
  }, [marketPrice, enableQueryParams, limitPriceStore.inverted, limitPriceStore.limitPrice, limitPriceStore.isCustom, limitPriceStore.priceFromQueryParams]);

  const onInvert = useCallback(() => {
    limitPriceStore.toggleInverted();
  }, [limitPriceStore.toggleInverted, limitPrice]);

  const onReset = useCallback(() => {
    limitPriceStore.onReset();
  }, [limitPriceStore.onReset, limitPrice]);

  return {
    limitPrice,
    onInvert,
    onChange: limitPriceStore.onLimitInput,
    onReset,
    leftToken: limitPriceStore.inverted ? twapStore.dstToken : twapStore.srcToken,
    rightToken: limitPriceStore.inverted ? twapStore.srcToken : twapStore.dstToken,
    isLoading: dstAmountLoading,
    inverted: limitPriceStore.inverted,
    isCustom: limitPriceStore.isCustom,
    getToggled,
  };
};

export const useDstMinAmountOut = () => {
  const { limitPrice } = useLimitPriceV2();
  const srcChunkAmount = useSrcChunkAmount();
  const { srcToken, dstToken, lib, isLimitOrder } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    lib: s.lib,
    dstToken: s.dstToken,
    isLimitOrder: s.isLimitOrder,
  }));

  return useMemo(() => {
    if (lib && srcToken && dstToken && limitPrice && BN(limitPrice.original || "0").gt(0)) {
      const res = lib.dstMinAmountOut(srcToken!, dstToken!, srcChunkAmount, parsebn(limitPrice.original || "0"), !isLimitOrder).toString();

      return res;
    }
    return BN(1).toString();
  }, [srcToken, dstToken, lib, srcChunkAmount, limitPrice, isLimitOrder]);
};

export const useFillWarning = () => {
  const { translations: translation, dstAmountOut } = useTwapContext();
  const { limitPrice } = useLimitPriceV2();
  const dstMinAmountOut = useDstMinAmountOut();
  const srcUsd = useSrcUsd().value.toString();
  const srcBalance = useSrcBalance().data?.toString();

  const chunkSize = useSrcChunkAmount();
  const durationUi = useDurationUi();
  const { fillDelayWarning, srcAmount, dstToken, srcToken, lib, isLimitOrder, fillDelayMillis } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
    srcAmount: s.getSrcAmount(),
    isLimitOrder: s.isLimitOrder,
    lib: s.lib,
    fillDelayMillis: s.getFillDelayUiMillis() / 1000,
    fillDelayWarning: s.getFillDelayWarning(),
  }));

  const deadline = useDeadline();

  const maxSrcInputAmount = useMaxSrcInputAmount();

  const isNativeTokenAndValueBiggerThanMax = maxSrcInputAmount && srcAmount?.gt(maxSrcInputAmount);
  return useMemo(() => {
    if (!translation) return;
    if (!srcToken || !dstToken || lib?.validateTokens(srcToken, dstToken) === TokensValidation.invalid) return translation.selectTokens;
    if (srcAmount.isZero()) return translation.enterAmount;
    if ((srcBalance && srcAmount.gt(srcBalance)) || isNativeTokenAndValueBiggerThanMax) return translation.insufficientFunds;
    if (chunkSize.isZero()) return translation.enterTradeSize;
    if (durationUi.amount === 0) return translation.enterMaxDuration;
    if (isLimitOrder && BN(dstAmountOut || "").gt(0) && BN(limitPrice?.original || "0").isZero()) return translation.placeOrder || "Place order";
    const valuesValidation = lib?.validateOrderInputs(srcToken!, dstToken!, srcAmount, chunkSize, dstMinAmountOut, deadline, fillDelayMillis, srcUsd);

    if (valuesValidation === OrderInputValidation.invalidTokens) {
      return translation.selectTokens;
    }

    if (valuesValidation === OrderInputValidation.invalidSmallestSrcChunkUsd && !!lib) {
      return translation.tradeSizeMustBeEqual.replace("{minChunkSizeUsd}", lib.config.minChunkSizeUsd.toString());
    }
    if (fillDelayWarning) {
      return translation.fillDelayWarning;
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
    limitPrice?.original,
    translation,
    isNativeTokenAndValueBiggerThanMax,
    srcUsd,
    fillDelayWarning,
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

export const useAmountBN = (decimals?: number, value?: string) => {
  return useMemo(() => {
    if (!decimals || !value) return;
    return amountBNV2(decimals, value);
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

export const useDstAmountUsdUi = () => {
  const dstAmount = useDstAmount().outAmount.raw;
  const { dstToken } = useTwapStore((s) => ({
    dstToken: s.dstToken,
  }));

  const dstUsd = useDstUsd().value.toString();

  return useAmountUi(
    dstToken?.decimals,
    BN(dstAmount || "0")
      .times(dstUsd)
      .toString()
  );
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
    if (chunks >= 1) return chunks;
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
    (chunks: number) => {
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

  return useMemo(() => moment(deadline).locale("en").format("ll HH:mm"), [deadline]);
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

export const useSrcAmountWaitForDst = () => {
  const srcAmount = useTwapStore((s) => s.getSrcAmount().toString());
  const { dstAmountLoading, dstAmountOut } = useTwapContext();
  const srcAmountRef = useRef("");
  const [value, setValue] = useState("");

  useEffect(() => {
    srcAmountRef.current = srcAmount;
  }, [srcAmount]);

  useEffect(() => {
    if (dstAmountLoading || BN(dstAmountOut || "0").isZero()) return;
    setValue(srcAmountRef.current);
  }, [dstAmountOut, dstAmountLoading]);

  return value;
};

export const useNoLiquidity = () => {
  const { srcAmount } = useTwapStore((s) => ({
    srcAmount: s.getSrcAmount().toString(),
  }));
  const { isLoading: dstAmountLoading, dexAmounOut } = useDstAmount();

  return useMemo(() => {
    if (!srcAmount || BN(srcAmount).isZero() || dstAmountLoading) return false;
    return !dexAmounOut.raw || BN(dexAmounOut.raw).isZero();
  }, [dexAmounOut.raw, dstAmountLoading, srcAmount]);
};

export const usePriceDisplay = () => {
  const [inverted, setInvert] = useState(false);

  const { isLimitOrder, srcToken, dstToken } = useTwapStore((store) => ({
    isLimitOrder: store.isLimitOrder,
    srcToken: store.srcToken,
    dstToken: store.dstToken,
  }));
  const { getToggled, isLoading } = useLimitPriceV2();
  const { marketPrice } = useMarketPriceV2(inverted);
  const price = isLimitOrder ? getToggled(inverted, true) : marketPrice?.original;
  const value = useFormatNumber({ value: price || "", decimalScale: 5 });

  const onInvert = useCallback(() => {
    setInvert((prev) => !prev);
  }, [setInvert]);

  const leftToken = inverted ? dstToken : srcToken;
  const rightToken = inverted ? srcToken : dstToken;

  return {
    price: value,
    leftToken,
    rightToken,
    inverted,
    onInvert,
    isLoading,
  };
};
