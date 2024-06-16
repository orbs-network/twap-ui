import { OrderInputValidation, Status, TokenData, TokensValidation, TWAPLib } from "@orbs-network/twap";
import { useTwapContext } from "./context";
import Web3 from "web3";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import BN from "bignumber.js";
import { OrdersData, OrderUI, ParsedOrder, State, SwapState, Translations } from "./types";
import _ from "lodash";
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
import {
  amountBN,
  amountBNV2,
  amountUi,
  amountUiV2,
  devideCurrencyAmounts,
  fillDelayText,
  getTokenFromTokensList,
  safeInteger,
  setQueryParam,
  supportsTheGraphHistory,
} from "./utils";
import { getOrderFills } from "./helper";
import FEE_ON_TRANSFER_ABI from "./abi/FEE_ON_TRANSFER.json";
import { maxUint256, zero, zeroAddress } from "./web3-candies/consts";
import {
  block,
  eqIgnoreCase,
  estimateGasPrice,
  findBlock,
  getPastEvents,
  isNativeAddress,
  parsebn,
  parseEvents,
  sendAndWaitForConfirmations,
  switchMetaMaskNetwork,
} from "./web3-candies";
import { Analytics } from "./analytics";
import { MIN_NATIVE_TOKEN_BALANCE } from "./config";
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

export const useLib = () => {
  return useTwapContext().lib;
};

export const useWeb3 = () => {
  return useTwapContext().web3;
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

export const useWrapOnly = () => {
  const wrap = useWrapNativeToken();
  const switchAfterWrap = useSwitchToWTokenAfterWrap();

  return useMutation(
    async () => {
      return wrap();
    },
    {
      onSuccess: () => {
        switchAfterWrap();
      },
    }
  );
};

const useWrapNativeToken = () => {
  const { lib, onSrcTokenSelected, dappTokens } = useTwapContext();
  const { priorityFeePerGas, maxFeePerGas } = useGasPriceQuery();
  const srcAmount = useSrcAmount();

  const setSrcToken = useTwapStore((s) => s.setSrcToken);

  return useCallback(async () => {
    try {
      await lib!.wrapNativeToken(srcAmount, priorityFeePerGas, maxFeePerGas);
      setSrcToken(lib!.config.wToken);
      const token = getTokenFromTokensList(dappTokens, lib!.config.wToken.address);
      if (token) {
        onSrcTokenSelected?.(token);
      }
    } catch (error) {}
  }, [srcAmount.toString(), priorityFeePerGas.toString(), maxFeePerGas.toString(), dappTokens]);
};

const useApproveToken = () => {
  const { lib } = useTwapContext();
  const { priorityFeePerGas, maxFeePerGas } = useGasPriceQuery();
  const srcToken = useTwapStore((s) => s.srcToken);

  return useCallback(() => {
    return lib?.approve(srcToken!, maxUint256, priorityFeePerGas, maxFeePerGas);
  }, [lib, srcToken, priorityFeePerGas.toString(), maxFeePerGas.toString()]);
};

const useSwitchToWTokenAfterWrap = () => {
  const setSrcToken = useTwapStore((s) => s.setSrcToken);
  const { lib, dappTokens, onSrcTokenSelected } = useTwapContext();

  return useCallback(() => {
    setSrcToken(lib!.config.wToken);
    const token = getTokenFromTokensList(dappTokens, lib!.config.wToken.address);
    if (token) {
      onSrcTokenSelected?.(token);
    }
  }, [setSrcToken, onSrcTokenSelected, dappTokens, lib]);
};

export const useSubmitOrder = () => {
  const [wrapped, setWrapped] = useState(false);
  const wrap = useWrapNativeToken();
  const approve = useApproveToken();
  const shouldWrap = useShouldWrap();
  const create = useCreateOrderCallback();
  const { data: isApproved, refetch: refetchApproval } = useHasAllowanceQuery();
  const switchAfterWrap = useSwitchToWTokenAfterWrap();
  const analyticSubmitOrder = Analytics.useSubmitOrder();
  const { data: hasNativeBalance } = useHasMinNativeTokenBalance();
  const { lib } = useTwapContext();

  const { updateState, swapState, setTxHash } = useTwapStore((s) => ({
    updateState: s.updateState,
    swapState: s.swapState,
    setTxHash: s.setTxHash,
  }));

  const mutate = useMutation(
    async () => {
      analyticSubmitOrder();
      if (hasNativeBalance) {
        throw new Error(`Insufficient ${lib?.config.nativeToken.symbol} balance, you need at least 0.0035$${lib?.config.nativeToken.symbol} to cover the transaction fees.`);
      }
      updateState({ createOrderLoading: true });
      if (shouldWrap) {
        updateState({ swapState: SwapState.WRAP });
        try {
          await wrap();
          setWrapped(true);
          Analytics.onWrapSucess();
        } catch (error) {
          Analytics.onWrapError(error);
          throw error;
        }
      }

      if (!isApproved) {
        updateState({ swapState: SwapState.APPROVE });
        try {
          await approve();
          const res = await refetchApproval();
          if (!res.data) {
            throw new Error("Insufficient allowance to perform the swap. Please approve the token first.");
          }
          Analytics.onApprovalSucess();
        } catch (error) {
          Analytics.onApprovalError(error);
          throw error;
        }
      }
      updateState({ swapState: SwapState.CREATE });
      try {
        const order = await create({ onTxHash: (txHash) => updateState({ txHash, swapState: SwapState.PENDING_CONFIRMATION }) });
        Analytics.onCreateOrderSuccess(order.orderId, order.txHash);
      } catch (error) {
        Analytics.onCreateOrderFailed(error);
        throw error;
      }
    },
    {
      onSuccess: () => {},
      onSettled: () => updateState({ createOrderLoading: false }),
      onError: (error) => {
        const createOrderError = error instanceof Error ? error.message : "Something went wrong";
        updateState({ swapState: SwapState.ERROR, createOrderError });
        // if tx failes after wrap, we switch to wrapped token so the user can see his funds
        if (wrapped) {
          switchAfterWrap();
        }
      },
    }
  );

  return {
    ...mutate,
    swapState,
  };
};

export const useUnwrapToken = () => {
  const lib = useLib();
  const srcTokenAmount = useSrcAmount();
  const { priorityFeePerGas, maxFeePerGas } = useGasPriceQuery();
  const reset = useReset();
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

export const useOnTokenSelect = (isSrc?: boolean) => {
  const srcSelect = useTwapStore((store) => store.setSrcToken);
  const dstSelect = useTwapStore((store) => store.setDstToken);

  return isSrc ? srcSelect : dstSelect;
};

export const useHasMinNativeTokenBalance = () => {
  const { lib, web3 } = useTwapContext();

  const minTokenAmount = useMemo(() => {
    return MIN_NATIVE_TOKEN_BALANCE[lib?.config.chainId as keyof typeof MIN_NATIVE_TOKEN_BALANCE];
  }, [lib?.config.chainId]);

  return useQuery(
    ["useHasMinNativeTokenBalance", lib?.maker, lib?.config.chainId, minTokenAmount],
    async () => {
      if (!minTokenAmount) {
        return true;
      }
      const balance = await web3!.eth.getBalance(lib!.maker);
      return BN(balance).gte(amountBN(lib?.config.nativeToken, minTokenAmount!));
    },
    {
      enabled: !!lib?.maker && !!web3,
      staleTime: Infinity,
    }
  );
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
  const { config, provider: _provider, web3 } = useTwapContext();

  return useMutation(
    async (props?: { onSuccess: () => void; onError: () => void }) => {
      if (!web3) {
        throw new Error("Connect wallet");
      }
      await switchMetaMaskNetwork(web3, config.chainId);
    },
    {
      onSuccess: (_, args) => {
        args?.onSuccess();
      },
      onError: (_, args) => {
        args?.onError();
      },
    }
  );
};

export const useCustomActions = () => {
  return useSetSrcAmountPercent();
};

export const useCancelOrder = () => {
  const lib = useLib();
  const { refetch } = useOrdersHistoryQuery();
  const { priorityFeePerGas, maxFeePerGas } = useGasPriceQuery();
  return useMutation(
    async (orderId: number) => {
      // analytics.onCancelOrderClick(orderId);
      return lib?.cancelOrder(orderId, priorityFeePerGas, maxFeePerGas);
    },
    {
      onSuccess: (_result, orderId) => {
        // analytics.onCancelOrderSuccess(orderId.toString());
        refetch();
      },
      onError: (error: Error) => {
        // analytics.onCancelOrderError(error.message);
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
  const { value } = useTwapStore((store) => ({
    value: store.srcUsd || zero,
  }));

  const lib = useLib();

  return {
    value,
    isLoading: value.isZero() && !!lib,
  };
};

export const useDstUsd = () => {
  const { value } = useTwapStore((store) => ({
    value: store.dstUsd || zero,
  }));
  const lib = useLib();

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
  const { srcToken } = useTwapStore((state) => ({
    srcToken: state.srcToken,
  }));

  const amount = useSrcAmount();

  const lib = useLib();
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

  const _address = address && isNativeAddress(address) ? context.lib?.config.wToken.address : address;

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
      enabled: !!context.lib && !!_address && !!context.priceUsd,
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
  const lib = useLib();
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
  const { lib, web3 } = useTwapContext();
  const { isLoading, data } = useQuery([QueryKeys.GET_GAS_PRICE, contextTip, contextMax], () => estimateGasPrice(web3!), {
    enabled: !!lib && !!web3,
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
  const { tokenList: tokens = [], lib } = useTwapContext();

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
  const { updateState, showConfirmation, srcToken } = useTwapStore((state) => ({
    updateState: state.updateState,
    showConfirmation: state.showConfirmation,
    srcToken: state.srcToken,
  }));
  const lib = useLib();

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
  const wrongNetwork = context.isWrongChain;

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
  const [haveValue, setHaveValue] = useState(false);

  const _enabled = haveValue ? true : !!enabled;
  const { lib, web3 } = useTwapContext();
  const disableEvents = supportsTheGraphHistory(lib?.config.chainId);

  return useQuery(
    ["useOrderPastEvents", order?.order.id, lib?.maker, order?.ui.progress],
    async () => {
      const orderEndDate = Math.min(order!.order.ask.deadline, (await block(web3!)).timestamp);
      const [orderStartBlock, orderEndBlock] = await Promise.all([findBlock(web3!, order!.order.time * 1000), findBlock(web3!, orderEndDate * 1000)]);
      const events = await getPastEvents({
        web3: web3!,
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
      enabled: !!lib && !!_enabled && !!order && !disableEvents && !!web3,
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
  return useSrcAmount().gt(0);
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

export const useSubmitButtonHandlers = () => {
  const { isWrongChain, lib, translations, connect } = useTwapContext();
  const { isLoading: changeNetworkLoading, mutate: changeNetwork } = useChangeNetwork();
  const srcAmount = useSrcAmount();

  return useMemo(() => {
    if (isWrongChain)
      return {
        text: translations.switchNetwork,
        onClick: changeNetwork,
        loading: changeNetworkLoading,
        disabled: changeNetworkLoading,
      };

    if (!lib?.maker)
      return {
        text: translations.connect,
        onClick: connect ? connect : undefined,
        loading: false,
        disabled: false,
      };
    if (srcAmount.isZero()) {
      return {
        text: translations.enterAmount,
        disabled: true,
      };
    }
  }, [translations, changeNetworkLoading, changeNetwork, connect, lib, srcAmount.toString()]);
};

export const useSubmitSwapButton = () => {
  const { mutate, isLoading: loading } = useSubmitOrder();
  const disclaimerAccepted = useTwapStore((s) => s.disclaimerAccepted);
  const handlers = useSubmitButtonHandlers();

  return useMemo(() => {
    if (handlers) {
      return handlers;
    }
    return {
      text: '',
      disabled: !disclaimerAccepted,
      onClick: mutate,
      loading,
    };
  }, [disclaimerAccepted, mutate, loading, handlers]);
};

export const useShowConfirmationModalButton = (_translations?: Translations) => {
  const context = useTwapContext();
  const translations = context?.translations || _translations;
  const shouldUnwrap = useShouldUnwrap();
  const { setShowConfirmation, createOrderLoading, srcUsd, dstUsd } = useTwapStore((store) => ({
    setShowConfirmation: store.setShowConfirmation,
    createOrderLoading: store.createOrderLoading,
    srcUsd: store.srcUsd,
    dstUsd: store.dstUsd,
  }));
  const outAmountLoading = useDstAmount().isLoading;
  const allowance = useHasAllowanceQuery();
  const { mutate: unwrap, isLoading: unwrapLoading } = useUnwrapToken();
  const fillWarning = useFillWarning();
  const noLiquidity = useNoLiquidity();
  const isWrapOnly = useShouldWrapOnly();
  const { mutate: wrap, isLoading: wrapLoading } = useWrapOnly();
  const handlers = useSubmitButtonHandlers();
  const { data: hasNativeBalance, isLoading: nativeBalanceLoading } = useHasMinNativeTokenBalance();

  const loading = wrapLoading || unwrapLoading || createOrderLoading;

  return useMemo(() => {
    if (handlers) return handlers;

    if (isWrapOnly) {
      return {
        text: translations.wrap,
        loading,
        onClick: wrap,
      };
    }

    if (shouldUnwrap) {
      return {
        text: translations.unwrap,
        onClick: unwrap,
        loading,
      };
    }

    if (outAmountLoading || srcUsd?.isZero() || dstUsd?.isZero() || allowance.isLoading || nativeBalanceLoading) {
      return { text: translations.outAmountLoading, onClick: undefined, disabled: true };
    }

    if (noLiquidity) {
      return {
        text: translations.noLiquidity,
        disabled: true,
        loading: false,
      };
    }

    if (fillWarning)
      return {
        text: fillWarning,
        onClick: undefined,
        disabled: true,
        loading: false,
      };

    return {
      text: translations.placeOrder,
      onClick: () => setShowConfirmation(true),
      loading,
      disabled: false,
    };
  }, [
    handlers,
    isWrapOnly,
    translations,
    loading,
    setShowConfirmation,
    wrap,
    shouldUnwrap,
    unwrap,
    outAmountLoading,
    srcUsd?.toString(),
    dstUsd?.toString(),
    allowance.isLoading,
    noLiquidity,
    fillWarning,
    nativeBalanceLoading,
  ]);
};

export const useParseOrderUi = (o?: ParsedOrder, expanded?: boolean) => {
  const lib = useLib();
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

function useCreateOrderCallback() {
  const { lib, web3, askDataParams = [] } = useTwapContext();

  const { maxFeePerGas, priorityFeePerGas: maxPriorityFeePerGas } = useGasPriceQuery();
  const { srcToken, dstToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));
  const srcAmount = useSrcAmount();
  const deadline = useDeadline();
  const fillDelayUiMillis = useFillDelayUiMillis();
  const dstMinChunkAmountOut = useDstMinAmountOut();
  const srcUsd = useSrcUsd().value.toString();
  const srcChunkAmount = useSrcChunkAmount();

  return useCallback(
    async ({ onTxHash }: { onTxHash: (txHash: string) => void }): Promise<{ txHash: string; orderId: number }> => {
      if (!lib) {
        throw new Error("lib is not defined");
      }
      if (!web3) {
        throw new Error("web3 is not defined");
      }

      if (!srcToken) {
        throw new Error("src token is not defined");
      }
      if (!dstToken) {
        throw new Error("src token is not defined");
      }
      const fillDelaySeconds = (fillDelayUiMillis - lib!.estimatedDelayBetweenChunksMillis()) / 1000;

      const validation = lib?.validateOrderInputs(srcToken, dstToken, srcAmount, srcChunkAmount, dstMinChunkAmountOut, deadline, fillDelaySeconds, srcUsd);
      if (validation !== OrderInputValidation.valid) throw new Error(`invalid inputs: ${validation}`);

      const askData = lib?.config.exchangeType === "PangolinDaasExchange" ? web3.eth.abi.encodeParameters(["address"], askDataParams) : [];

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

      const tx = await sendAndWaitForConfirmations({
        web3,
        chainId: lib.config.chainId,
        tx: ask,
        opts: {
          from: lib.maker,
          maxPriorityFeePerGas,
          maxFeePerGas,
        },
        callback: {
          onTxHash,
        },
      });

      const events = parseEvents(web3, tx, lib.twap.options.jsonInterface);
      return { txHash: tx.transactionHash, orderId: Number(events[0].returnValues.id) };
    },
    [
      lib,
      web3,
      askDataParams,
      srcToken,
      dstToken,
      maxFeePerGas.toString(),
      maxPriorityFeePerGas.toString(),
      srcAmount.toString(),
      deadline,
      fillDelayUiMillis,
      dstMinChunkAmountOut,
      srcUsd,
      srcChunkAmount.toString(),
    ]
  );
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
  const { dstToken, isLimitOrder, srcToken } = useTwapStore((s) => ({
    dstToken: s.dstToken,
    isLimitOrder: s.isLimitOrder,
    srcToken: s.srcToken,
  }));

  const srcAmount = useSrcAmount().toString();

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
  }));
  const srcAmount = useSrcAmount().toString();

  const { dstAmountOut, dstAmountLoading } = useTwapContext();
  const marketPrice = useMemo(() => {
    if (BN(dstAmountOut || "0").isZero() || BN(srcAmount || "0").isZero()) return;

    const original = devideCurrencyAmounts({ srcToken: twapStore.srcToken, dstToken: twapStore.dstToken, dstAmount: dstAmountOut, srcAmount });
    if (!original || BN(original || "0").isZero()) return;

    return {
      original,
      toggled: inverted ? BN(1).div(original).toString() : original,
    };
  }, [dstAmountOut, twapStore.srcToken, twapStore.dstToken, inverted, srcAmount]);

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
  const lib = useLib();
  const { srcToken, dstToken, isLimitOrder } = useTwapStore((s) => ({
    srcToken: s.srcToken,
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
  const { translations: translation, dstAmountOut, lib } = useTwapContext();
  const { limitPrice } = useLimitPriceV2();
  const dstMinAmountOut = useDstMinAmountOut();
  const srcUsd = useSrcUsd().value.toString();
  const srcBalance = useSrcBalance().data?.toString();
  const srcAmount = useSrcAmount();
  const fillDelayMillis = useFillDelayUiMillis() / 1000;
  const fillDelayWarning = useFillDelayWarning();
  const chunkSize = useSrcChunkAmount();
  const durationUi = useDurationUi();
  const { dstToken, srcToken, isLimitOrder } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
    isLimitOrder: s.isLimitOrder,
  }));

  const deadline = useDeadline();

  const maxSrcInputAmount = useMaxSrcInputAmount();
  const { hasFeeOnTransfer } = useFeeOnTranserWarning();

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
    hasFeeOnTransfer,
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
  const { srcToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
  }));

  const srcAmount = useSrcAmount();

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
  const { srcToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
  }));

  const lib = useLib();

  const srcAmount = useSrcAmount();

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
  const fillDelayUiMillis = useFillDelayUiMillis();

  const durationMillis = useDurationMillis();

  return useMemo(() => {
    return chunks * fillDelayUiMillis > durationMillis;
  }, [chunks, fillDelayUiMillis, durationMillis]);
};

export const useSrcChunkAmount = () => {
  const srcAmount = useSrcAmount();
  const lib = useLib();
  const chunks = useChunks();

  return useMemo(() => {
    return lib?.srcChunkAmount(srcAmount, chunks) || BN(0);
  }, [lib, srcAmount, chunks]);
};

export const useDurationUi = () => {
  const fillDelayUiMillis = useFillDelayUiMillis();
  const lib = useTwapContext();
  const { customDuration } = useTwapStore((s) => ({
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
  const { updateState, srcToken } = useTwapStore((s) => ({
    updateState: s.updateState,
    srcToken: s.srcToken,
  }));
  const lib = useLib();
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
  const srcAmount = useSrcAmount().toString();
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
  const srcAmount = useSrcAmount().toString();
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

const useFeeOnTransferContract = () => {
  const { web3, lib } = useTwapContext();

  const address = useMemo(() => {
    const chainId = lib?.config.chainId;
    if (!chainId) return undefined;
    return feeOnTransferDetectorAddresses[chainId as keyof typeof feeOnTransferDetectorAddresses];
  }, [lib?.config.chainId]);

  return useMemo(() => {
    if (!web3 || !address) return;

    return new web3.eth.Contract(FEE_ON_TRANSFER_ABI as any, address);
  }, [web3, address]);
};
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export const useLoopFeeOnTransfer = () => {
  const contract = useFeeOnTransferContract();
  const lib = useLib();

  return useCallback(
    async (addresses: string[]) => {
      return addresses.map(async (tokenAddress) => {
        await delay(1000);
        try {
          if (isNativeAddress(tokenAddress || "")) return;
          const res = await contract?.methods.validate(tokenAddress, lib?.config.wToken.address, AMOUNT_TO_BORROW).call();
          console.log({ res });

          return {
            buyFee: res.buyFeeBps,
            sellFee: res.sellFeeBps,
            hasFeeOnTranfer: BN(res.buyFeeBps).gt(0) || BN(res.sellFeeBps).gt(0),
          };
        } catch (error) {
          console.error("useLoopFeeOnTransfer", error);
        }
      });
    },
    [contract, lib?.config.wToken.address]
  );
};

const useFeeOnTransfer = (tokenAddress?: string) => {
  const lib = useLib();
  const contract = useFeeOnTransferContract();

  return useQuery({
    queryFn: async () => {
      if (isNativeAddress(tokenAddress || "")) return;
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

export const useShouldWrap = () => {
  const { srcToken, dstToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));

  const lib = useLib();

  return useMemo(() => {
    if (!lib || !srcToken || !dstToken) return undefined;
    return [TokensValidation.wrapAndOrder, TokensValidation.wrapOnly].includes(lib!.validateTokens(srcToken!, dstToken!));
  }, [lib, srcToken, dstToken]);
};

export const useShouldWrapOnly = () => {
  const { srcToken, dstToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));

  const lib = useLib();

  return useMemo(() => {
    if (!lib || !srcToken || !dstToken) return undefined;
    return lib?.validateTokens(srcToken!, dstToken!) === TokensValidation.wrapOnly;
  }, [lib, srcToken, dstToken]);
};

export const useShouldUnwrap = () => {
  const lib = useLib();

  const { srcToken, dstToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));
  return useMemo(() => {
    if (!lib || !srcToken || !dstToken) return undefined;

    return lib.validateTokens(srcToken, dstToken) === TokensValidation.unwrapOnly;
  }, [lib, srcToken, dstToken]);
};

export const useFillDelayUiMillis = () => {
  const customFillDelay = useTwapStore((s) => s.customFillDelay);

  return useMemo(() => {
    return customFillDelay.amount! * customFillDelay.resolution;
  }, [customFillDelay]);
};

const useMinimumDelayMinutes = () => {
  const lib = useLib();

  return useMemo(() => {
    return (lib?.estimatedDelayBetweenChunksMillis() || 0) / 1000 / 60;
  }, [lib]);
};

export const useFillDelayWarning = () => {
  const fillDelayUiMillis = useFillDelayUiMillis();
  const minimumDelayMinutes = useMinimumDelayMinutes();

  return useMemo(() => {
    return fillDelayUiMillis < minimumDelayMinutes * 60 * 1000;
  }, [fillDelayUiMillis, minimumDelayMinutes]);
};

export const useFillDelayText = () => {
  const { translations } = useTwapContext();
  const fillDelayUiMillis = useFillDelayUiMillis();

  return useMemo(() => {
    return fillDelayText(fillDelayUiMillis, translations);
  }, [fillDelayUiMillis, translations]);
};

export const useSrcAmount = () => {
  const { srcToken, srcAmountUi } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    srcAmountUi: s.srcAmountUi,
  }));

  const amount = useAmountBN(srcToken?.decimals, srcAmountUi);

  return useMemo(() => {
    if (!amount) return zero;
    return BN.min(amount, maxUint256).decimalPlaces(0);
  }, [amount]);
};
