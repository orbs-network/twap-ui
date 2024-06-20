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
import { TimeResolution, useOrdersStore, useTwapStore, useWizardStore, WizardAction, WizardActionStatus } from "./store";
import {
  AMOUNT_TO_BORROW,
  feeOnTransferDetectorAddresses,
  MIN_CHUNKS,
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
import { amountBN, amountBNV2, amountUi, amountUiV2, formatDecimals, getTokenFromTokensList, setQueryParam, supportsTheGraphHistory } from "./utils";
import { getOrderFills } from "./helper";
import FEE_ON_TRANSFER_ABI from "./abi/FEE_ON_TRANSFER.json";
/**
 * Actions
 */

const resetQueryParams = () => {
  setQueryParam(QUERY_PARAMS.INPUT_AMOUNT, undefined);
  setQueryParam(QUERY_PARAMS.LIMIT_PRICE, undefined);
  setQueryParam(QUERY_PARAMS.MAX_DURATION, undefined);
  setQueryParam(QUERY_PARAMS.TRADE_INTERVAL, undefined);
  setQueryParam(QUERY_PARAMS.TRADES_AMOUNT, undefined);
};
export const useResetStore = () => {
  const resetTwapStore = useTwapStore((state) => state.reset);
  const storeOverride = useTwapContext().storeOverride || {};

  return (args: Partial<State> = {}) => {
    resetTwapStore({ ...storeOverride, ...args });
    resetQueryParams();
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
      analytics.onWrapClick(srcAmount);
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

      analytics.onApproveClick(srcAmount);
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
  const { outAmountRaw, outAmountUi } = useOutAmount();
  const srcUsd = useSrcUsd().value.toString();
  const totalTrades = useChunks();
  const tradeSize = useSrcChunkAmount();
  const srcChunkAmount = useSrcChunkAmount();
  const deadline = useDeadline();

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
        dstAmount: outAmountUi,
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

      analytics.onConfirmationCreateOrderClick({ minAmountOut: outAmountUi || "", totalTrades, tradeSize, deadline });
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
        dstAmount: outAmountRaw || "",
        txHash: order.txHash,
      });

      await refetch();
      return order;
    },
    {
      onSuccess: async (result) => {
        analytics.onCreateOrderSuccess(result.orderId);
        onSuccess?.();
        !disableWizard && wizardStore.setStatus(WizardActionStatus.SUCCESS);
      },
      onError: (error: Error) => {
        analytics.onCreateOrderError(error.message);
        if ((error as any).code === 4001) {
          analytics.onCreateOrderRejected();
        }
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
  const { error, data } = useFeeOnTransfer(srcToken?.address);
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

  const { srcToken, dstToken, updateState, resetLimit } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
    srcAmountUi: s.srcAmountUi,
    updateState: s.updateState,
    resetLimit: s.resetLimit,
  }));
  resetQueryParams();
  const dstAmount = useOutAmount().outAmountUi;
  return useCallback(() => {
    updateState({
      srcToken: dstToken,
      dstToken: srcToken,
      srcAmountUi: "",
    });
    resetLimit();
    const _srcToken = getTokenFromTokensList(dappTokens, srcToken?.address) || getTokenFromTokensList(dappTokens, srcToken?.symbol);
    const _dstToken = getTokenFromTokensList(dappTokens, dstToken?.address) || getTokenFromTokensList(dappTokens, dstToken?.symbol);
    srcToken && onSrcTokenSelected?.(_dstToken);
    dstToken && onDstTokenSelected?.(_srcToken);
  }, [dstAmount, _.size(dappTokens), srcToken?.address, srcToken?.symbol, dstToken?.address, dstToken?.symbol, onSrcTokenSelected, onDstTokenSelected, resetLimit]);
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
  const outAmountLoading = useOutAmount().isLoading;
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
        analytics.onOpenConfirmationModal();
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
      analytics.onOpenConfirmationModal();
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
        createdAtUi: moment(o.order.time * 1000).format("ll HH:mm"),
        deadlineUi: moment(o.order.ask.deadline * 1000).format("ll HH:mm"),
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

export const useOutAmount = () => {
  const { limitPriceUi: limitPriceV2, isLoading } = useLimitPrice();
  const { srcAmountUi, dstToken } = useTwapStore((s) => ({
    srcAmountUi: s.srcAmountUi,
    dstToken: s.dstToken,
  }));

  const outAmountUi = useMemo(() => {
    if (!srcAmountUi || !limitPriceV2) return;
    return BN(limitPriceV2).multipliedBy(srcAmountUi).toString();
  }, [limitPriceV2, srcAmountUi]);

  return {
    isLoading,
    outAmountUi: outAmountUi || "",
    outAmountRaw: useAmountBN(dstToken?.decimals, outAmountUi) || "",
  };
};

export const useMarketPrice = () => {
  const marketPriceRaw = useTwapContext().marketPrice;
  const dstToken = useTwapStore((s) => s.dstToken);

  return {
    marketPriceRaw: marketPriceRaw,
    marketPriceUi: useAmountUi(dstToken?.decimals, marketPriceRaw),
    isLoading: BN(marketPriceRaw || 0).isZero(),
  };
};

export const useFormatDecimals = (value?: string | BN | number, decimalPlaces?: number) => {
  return useMemo(() => formatDecimals(value, decimalPlaces), [value, decimalPlaces]);
};

export const useLimitPrice = () => {
  const { marketPriceUi, isLoading } = useMarketPrice();
  const { dstToken, isCustom, customLimitPrice, inverted } = useTwapStore((s) => ({
    dstToken: s.dstToken,
    isCustom: s.isCustomLimitPrice,
    customLimitPrice: s.customLimitPrice,
    inverted: s.isInvertedLimitPrice,
  }));
  const marketPrice = useInvertedPrice(marketPriceUi, inverted);
  const limitPriceUi = useInvertedPrice(isCustom ? customLimitPrice : marketPrice, inverted);

  return {
    isLoading,
    limitPriceUi,
    limitPriceRaw: useAmountBN(dstToken?.decimals, limitPriceUi),
  };
};

export const useDstMinAmountOut = () => {
  const { limitPriceUi } = useLimitPrice();
  const srcChunkAmount = useSrcChunkAmount();
  const { srcToken, dstToken, lib, isLimitOrder } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    lib: s.lib,
    dstToken: s.dstToken,
    isLimitOrder: s.isLimitOrder,
  }));

  return useMemo(() => {
    if (lib && srcToken && dstToken && limitPriceUi && BN(limitPriceUi || "0").gt(0)) {
      const res = lib.dstMinAmountOut(srcToken!, dstToken!, srcChunkAmount, parsebn(limitPriceUi || "0"), !isLimitOrder).toString();

      return res;
    }
    return BN(1).toString();
  }, [srcToken, dstToken, lib, srcChunkAmount, limitPriceUi, isLimitOrder]);
};

export const useFillWarning = () => {
  const { translations: translation, dstAmountOut } = useTwapContext();
  const { limitPriceUi } = useLimitPrice();
  const dstMinAmountOut = useDstMinAmountOut();
  const srcUsd = useSrcUsd().value.toString();
  const srcBalance = useSrcBalance().data?.toString();
  const maxChunksWarning = useMaxChunksWarning();

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
  const { isLoading: feeOnTraferLoading, hasFeeOnTransfer } = useFeeOnTranserWarning();

  const isNativeTokenAndValueBiggerThanMax = maxSrcInputAmount && srcAmount?.gt(maxSrcInputAmount);
  return useMemo(() => {
    if (!translation) return;
    if (!srcToken || !dstToken || lib?.validateTokens(srcToken, dstToken) === TokensValidation.invalid) return translation.selectTokens;
    if (hasFeeOnTransfer) {
      return translation.feeOnTranferWarning;
    }
    if (srcAmount.isZero()) return translation.enterAmount;
    if ((srcBalance && srcAmount.gt(srcBalance)) || isNativeTokenAndValueBiggerThanMax) return translation.insufficientFunds;
    if (chunkSize.isZero()) return translation.enterTradeSize;
    if (maxChunksWarning) return maxChunksWarning;
    if (durationUi.amount === 0) return translation.enterMaxDuration;
    if (isLimitOrder && BN(dstAmountOut || "").gt(0) && BN(limitPriceUi || "0").isZero()) return translation.placeOrder || "Place order";
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
    if (feeOnTraferLoading) {
      return translation.loading;
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
    limitPriceUi,
    translation,
    isNativeTokenAndValueBiggerThanMax,
    srcUsd,
    fillDelayWarning,
    maxSrcInputAmount,
    lib,
    dstAmountOut,
    feeOnTraferLoading,
    hasFeeOnTransfer,
    maxChunksWarning,
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
  const dstAmount = useOutAmount().outAmountRaw;
  const dstToken = useTwapStore((s) => s.dstToken);

  const dstUsd = useDstUsd().value.toString();

  const value = useMemo(() => {
    return BN(dstAmount || "0")
      .times(dstUsd)
      .toString();
  }, [dstAmount, dstUsd]);

  return useAmountUi(dstToken?.decimals, value);
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
  const { srcToken, customChunks } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    customChunks: s.customChunks,
  }));
  const maxPossibleChunks = useMaxPossibleChunks();
  const srcAmountUsd = useSrcAmountUsdUi();
  console.log({ customChunks });

  return useMemo(() => {
    if (!srcUsd || !srcToken) return 1;
    if (typeof customChunks === "number") return customChunks;
    return Math.min(
      maxPossibleChunks,
      BN(srcAmountUsd || "0")
        .idiv(SUGGEST_CHUNK_VALUE)
        .toNumber() || 1
    );
  }, [srcUsd, srcToken, customChunks, maxPossibleChunks, srcAmountUsd]);
};

export const useMaxChunksWarning = () => {
  const maxPossibleChunks = useMaxPossibleChunks();
  const translations = useTwapContext().translations;
  const chunks = useChunks();

  const warning = useMemo(() => {
    if (chunks < MIN_CHUNKS) return;
    return chunks > maxPossibleChunks ? translations.maxChunksWarning.replace("{maxChunks}", maxPossibleChunks.toString()) : undefined;
  }, [chunks, maxPossibleChunks]);



  return warning
};


export const useSetChunks = () => {
  const updateState = useTwapStore((s) => s.updateState);
  const maxPossibleChunks = useMaxPossibleChunks();
  return useCallback(
    (chunks: number) => {
      if (chunks > 0 && chunks <= maxPossibleChunks) {
        setQueryParam(QUERY_PARAMS.TRADES_AMOUNT, chunks.toString());
      }
      updateState({ customChunks: chunks });
    },
    [updateState]
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
    return chunks === 0 ? BN(0) : lib?.srcChunkAmount(srcAmount, chunks) || BN(0);
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

  return useFormatDecimals(useAmountUi(srcToken?.decimals, srcChunksAmount.toString()), 2);
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
      setQueryParam(QUERY_PARAMS.INPUT_AMOUNT, !srcAmountUi ? undefined : srcAmountUi);
      if (!srcAmountUi) {
        setQueryParam(QUERY_PARAMS.LIMIT_PRICE, undefined);
        setQueryParam(QUERY_PARAMS.TRADES_AMOUNT, undefined);
        setQueryParam(QUERY_PARAMS.TRADE_INTERVAL, undefined);
      }

      updateState({
        srcAmountUi,
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
  const srcAmount = useTwapStore((s) => s.getSrcAmount().toString());
  const { isLoading: dstAmountLoading, outAmountRaw } = useOutAmount();
  const limitPrice = useLimitPrice().limitPriceRaw;

  return useMemo(() => {
    if (BN(limitPrice || 0).isZero() || BN(srcAmount || 0).isZero() || dstAmountLoading) return false;
    return BN(outAmountRaw || 0).isZero();
  }, [outAmountRaw, dstAmountLoading, srcAmount, limitPrice]);
};

export const useInvertedPrice = (price?: string, inverted?: boolean) => {
  return useMemo(() => {
    if (!price) return "";
    return inverted ? BN(1).div(price).toString() : price;
  }, [price, inverted]);
};

export const useInvertPrice = (price?: string) => {
  const [inverted, setInvert] = useState(false);

  const { srcToken, dstToken } = useTwapStore((store) => ({
    srcToken: store.srcToken,
    dstToken: store.dstToken,
  }));
  const invertedPrice = useInvertedPrice(price, inverted);
  const value = useFormatNumber({ value: invertedPrice || "", decimalScale: 5 });

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
  };
};

const useFeeOnTransferContract = () => {
  const provider = useTwapContext().provider;
  const lib = useTwapStore((s) => s.lib);

  const address = useMemo(() => {
    const chainId = lib?.config.chainId;
    if (!chainId) return undefined;
    return feeOnTransferDetectorAddresses[chainId as keyof typeof feeOnTransferDetectorAddresses];
  }, [lib?.config.chainId]);

  return useMemo(() => {
    if (!provider || !address) return;

    const web3 = new Web3(provider);

    return new web3.eth.Contract(FEE_ON_TRANSFER_ABI as any, address);
  }, [provider, address]);
};

const useFeeOnTransfer = (tokenAddress?: string) => {
  const lib = useTwapStore((s) => s.lib);
  const contract = useFeeOnTransferContract();

  return useQuery({
    queryFn: async () => {
      const res = await contract?.methods.validate(tokenAddress, lib?.config.wToken.address, AMOUNT_TO_BORROW).call();
      return {
        buyFee: res.buyFeeBps,
        sellFee: res.sellFeeBps,
        hasFeeOnTranfer: BN(res.buyFeeBps).gt(0) || BN(res.sellFeeBps).gt(0),
      };
    },
    queryKey: ["useFeeOnTransfer", tokenAddress, lib?.config.chainId],
    enabled: !!contract && !!tokenAddress && !!lib,
  });
};

export const useFeeOnTranserWarning = () => {
  const { srcToken, dstToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));

  const srcTokenFeeOnTranfer = useFeeOnTransfer(srcToken?.address);
  const dstTokenFeeOnTranfer = useFeeOnTransfer(dstToken?.address);

  return {
    isLoading: srcTokenFeeOnTranfer.isLoading || dstTokenFeeOnTranfer.isLoading,
    hasFeeOnTransfer: srcTokenFeeOnTranfer.data?.hasFeeOnTranfer || dstTokenFeeOnTranfer.data?.hasFeeOnTranfer,
  };
};

export const useLimitPricePanel = () => {
  const { marketPriceUi, isLoading } = useMarketPrice();
  const { isCustom, onChange, inverted, onResetCustom, invert, customPrice, setLimitPricePercent, limitPercent } = useTwapStore((s) => ({
    isCustom: s.isCustomLimitPrice,
    onChange: s.onLimitChange,
    inverted: s.isInvertedLimitPrice,
    onResetCustom: s.onResetCustomLimit,
    invert: s.invertLimit,
    customPrice: s.customLimitPrice,
    setLimitPricePercent: s.setLimitPricePercent,
    limitPercent: s.limitPricePercent,
  }));
  const marketPrice = useFormatDecimals(useInvertedPrice(marketPriceUi, inverted));

  const onChangeCallback = useCallback(
    (customPrice: string) => {
      onChange(customPrice);
      setLimitPricePercent(undefined);
    },
    [onChange, setLimitPricePercent]
  );

  const onMarket = useCallback(() => {
    onResetCustom();
    setLimitPricePercent("0");
  }, [onResetCustom, setLimitPricePercent]);

  const onPercentChange = useCallback(
    (percent: string) => {
      setLimitPricePercent(percent);
      const p = BN(percent || 0)
        .div(100)
        .plus(1)
        .toString();

      const value = BN(marketPrice || "0")
        .times(p)
        .toString();
      onChange(formatDecimals(value));
    },
    [marketPrice, onChange, setLimitPricePercent]
  );
  const limitPriceUi = isCustom ? customPrice : marketPrice;

  const priceDeltaPercentage = useMemo(() => {
    if (limitPercent) {
      return limitPercent;
    }
    if (!limitPriceUi || !marketPrice || BN(limitPriceUi).isZero() || BN(marketPrice).isZero()) return "0";
    const diff = BN(limitPriceUi || 0)
      .div(marketPrice || "0")
      .minus(1)
      .times(100)
      .decimalPlaces(0)
      .toString();

    return diff;
  }, [limitPriceUi, marketPrice, limitPercent]);

  const onInvert = useCallback(() => {
    invert();
    setLimitPricePercent("0");
  }, [invert, setLimitPricePercent]);

  return {
    priceDeltaPercentage,
    onPercentChange,
    onMarket,
    onChange: onChangeCallback,
    inverted,
    isLoading,
    limitPriceUi,
    onInvert,
  };
};
