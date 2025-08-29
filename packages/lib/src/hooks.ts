import { Config, Configs, OrderInputValidation, Status, TokenData, TokensValidation, TWAPLib } from "@orbs-network/twap";
import { useTwapContext } from "./context";
import Web3 from "web3";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import BN from "bignumber.js";
import { InitLibProps, State, Translations } from "./types";
import _, { result } from "lodash";
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
  erc20abi,
} from "@defi.org/web3-candies";
import { TimeResolution, useLimitPriceStore, useTwapStore, useWizardStore } from "./store";
import { MIN_NATIVE_BALANCE, QUERY_PARAMS, REFETCH_BALANCE, REFETCH_GAS_PRICE, REFETCH_ORDER_HISTORY, REFETCH_USD, STALE_ALLOWANCE, SUGGEST_CHUNK_VALUE } from "./consts";
import { QueryKeys } from "./enums";
import { useNumericFormat } from "react-number-format";
import moment from "moment";
import { ContractCallResults, Multicall } from "ethereum-multicall";

import {
  amountBN,
  amountBNV2,
  amountUi,
  amountUiV2,
  devideCurrencyAmounts,
  getQueryParam,
  getTokenFromTokensList,
  logger,
  removeCommas,
  safeInteger,
  setQueryParam,
} from "./utils";
import { getOrders, groupOrdersByStatus, Order } from "./order";

/**
 * Actions
 */

export const useResetStore = () => {
  const { resetTwapStore, newOrderLoading } = useTwapStore((state) => ({
    resetTwapStore: state.reset,
    newOrderLoading: state.newOrderLoading,
  }));
  const storeOverride = useTwapContext().storeOverride || {};
  const limitPriceStore = useLimitPriceStore();

  return (args: Partial<State> = {}) => {
    resetTwapStore({ ...storeOverride, ...args, newOrderLoading });
    limitPriceStore.onReset();
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
  const srcAmount = useSrcAmount().amount;
  const { srcToken, dstToken } = useTwapContext();
  const { priorityFeePerGas, maxFeePerGas } = useGasPriceQuery();

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
      },
      onError: (error: Error) => {
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
  const srcTokenAmount = useSrcAmount().amount;
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

  const { priorityFeePerGas, maxFeePerGas } = useGasPriceQuery();
  const srcToken = useTwapContext().srcToken;

  const { refetch } = useHasAllowanceQuery();
  return useMutation(
    async () => {
      const token = isNativeAddress(srcToken?.address || "") ? lib?.config.wToken : srcToken;

      setLoading(true);
      analytics.onApproveRequest();
      await lib?.approve(token!, maxUint256, priorityFeePerGas, maxFeePerGas);
      await refetch();
    },
    {
      onSuccess: async () => {
        analytics.onApproveSuccess();
      },
      onError: (error: Error) => {
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
  const { onSrcTokenSelected, onDstTokenSelected } = useTwapContext();

  return isSrc ? onSrcTokenSelected : onDstTokenSelected;
};

export const useCreateOrder = () => {
  const { maxFeePerGas, priorityFeePerGas } = useGasPriceQuery();
  const store = useTwapStore();
  const srcAmount = useSrcAmount().amount;
  const { onOrderCreated } = useOrdersHistoryQuery();
  const submitOrder = useSubmitOrderCallback();
  const { askDataParams, onTxSubmitted, srcToken: _srcToken, dstToken: _dstToken } = useTwapContext();
  const dstMinAmountOut = useDstMinAmountOut().amount;

  const { amount: dstAmount, usd: dstAmountUsdUi } = useDstAmount();
  const srcUsd = useSrcUsd().value.toString();
  const srcChunkAmount = useSrcChunkAmount();
  const deadline = useDeadline();

  return useMutation(
    async (onTxHash?: (value: string) => void) => {
      const srcToken = isNativeAddress(_srcToken?.address || "") ? store.lib?.config.wToken : _srcToken;

      const dstToken = {
        ..._dstToken!,
        address: store.lib!.validateTokens(srcToken!, _dstToken!) === TokensValidation.dstTokenZero ? zeroAddress : _dstToken!.address,
      };

      if (!srcToken) {
        throw new Error("srcToken is not defined");
      }

      const fillDelaySeconds = (store.getFillDelayUiMillis() - store.lib!.estimatedDelayBetweenChunksMillis()) / 1000;
      store.setLoading(true);
      const validation = store.lib?.validateOrderInputs(srcToken, dstToken, srcAmount, srcChunkAmount, dstMinAmountOut, deadline, fillDelaySeconds, srcUsd);
      if (validation !== OrderInputValidation.valid) throw new Error(`invalid inputs: ${validation}`);

      const order = await submitOrder(
        (txHash) => {
          onTxHash?.(txHash);
          store.updateState({
            txHash,
            newOrderLoading: true,
          });
        },
        srcToken!,
        dstToken,
        srcAmount,
        srcChunkAmount,
        dstMinAmountOut,
        deadline,
        fillDelaySeconds,
        askDataParams,
        priorityFeePerGas || zero,
        maxFeePerGas
      );
      onTxSubmitted?.({
        srcToken: srcToken!,
        dstToken: dstToken!,
        srcAmount,
        dstUSD: dstAmountUsdUi!,
        dstAmount,
        txHash: order.txHash,
      });
      onOrderCreated(order.orderId);
      return order;
    },
    {
      onSuccess: async (result) => {
        analytics.onCreateOrderSuccess(result.txHash, result.orderId);
      },
      onError: (error: Error) => {
        analytics.onCreateOrderError(error.message);
        store.updateState({
          newOrderLoading: false,
        });
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
  const { provider } = useTwapContext();
  const { priorityFeePerGas, maxFeePerGas } = useGasPriceQuery();
  return useMutation(
    async (order: Order) => {
      if (!lib) return;
      // we need to make sure that the twap address is the order created twap address
      const config = {
        ...lib.config,
        twapAddress: order.twapAddress || lib.config.twapAddress,
      } as Config;
      const orderLib = new TWAPLib(config, lib.maker, provider);
      analytics.onCancelOrder(order.id);
      await orderLib.cancelOrder(order.id, priorityFeePerGas, maxFeePerGas);
      await onOrderCancelled(order.id);
    },
    {
      onSuccess: () => {
        analytics.onCancelOrderSuccess();
      },
      onError: (error: Error) => {
        console.log({ error });

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
  const { srcToken, dstToken } = useTwapContext();
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
  const srcToken = useTwapContext().srcToken;
  const value = usePriceUSD(srcToken?.address).value;

  return {
    value,
    isLoading: value.isZero(),
  };
};

export const useDstUsd = () => {
  const { dstToken, marketPriceLoading } = useTwapContext();

  const { value, isLoading } = usePriceUSD(dstToken?.address);

  return {
    value,
    isLoading: marketPriceLoading || isLoading,
  };
};

export const useSrcBalance = () => {
  const srcToken = useTwapContext().srcToken;
  return useBalanceQuery(srcToken);
};

export const useDstBalance = () => {
  const dstToken = useTwapContext().dstToken;

  return useBalanceQuery(dstToken);
};

/**
 * Queries
 */

export const useHasAllowanceQueryKey = (srcAmount?: string) => {
  const { lib } = useTwapStore((state) => ({
    lib: state.lib,
  }));
  const srcToken = useTwapContext().srcToken;
  return useMemo(() => [QueryKeys.GET_ALLOWANCE, lib?.config.chainId, srcToken?.address, srcAmount], [lib, srcToken, srcAmount]);
};

export const useHasAllowanceDebounedQuery = () => {
  const lib = useTwapStore((s) => s.lib);
  const amount = useSrcAmount().amount;
  const srcToken = useTwapContext().srcToken;

  const debouncedValue = useDebounce(amount, 500);
  const querykey = useHasAllowanceQueryKey(debouncedValue);
  const token = isNativeAddress(srcToken?.address || "") ? lib?.config.wToken : srcToken;

  const query = useQuery(querykey, () => lib!.hasAllowance(token!, debouncedValue), {
    enabled: !!lib && !!token && BN(amount || 0).gt(0),
    staleTime: STALE_ALLOWANCE,
    refetchOnWindowFocus: true,
  });
  return { ...query, isLoading: query.isLoading && query.fetchStatus !== "idle" };
};

export const useHasAllowanceQuery = () => {
  const { lib } = useTwapStore((state) => ({
    lib: state.lib,
  }));

  const srcToken = useTwapContext().srcToken;
  const amount = useSrcAmount().amount;
  const querykey = useHasAllowanceQueryKey(amount.toString());

  const token = isNativeAddress(srcToken?.address || "") ? lib?.config.wToken : srcToken;
  const query = useQuery(querykey, () => lib!.hasAllowance(token!, amount), {
    enabled: !!lib && !!token && BN(amount || 0).gt(0),
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
  const { lib } = useTwapStore((state) => ({
    lib: state.lib,
  }));
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

const linea_exchanges = ["0x3A9df3eE209b802D0337383f5abCe3204d623588"];
const base_exchanges = ["0x10ed1F36e4eBE76E161c9AADDa20BE841bc0082c", "0x3A9df3eE209b802D0337383f5abCe3204d623588"];
const arbitrum_exchanges = ["0xE20167871dB616DdfFD0Fd870d9bC068C350DD1F", "0x807488ADAD033e95C438F998277bE654152594dc"];
const bsc_exchanges = ["0xb2BAFe188faD927240038cC4FfF2d771d8A58905", "0xE2a0c3b9aD19A18c4bBa7fffBe5bC1b0E58Db1CE"];

const LEGACY_EXCHANGE_ADDRESSES = {
  [Configs.PancakeSwap.name]: [...bsc_exchanges, ...base_exchanges, ...arbitrum_exchanges, ...linea_exchanges],
};

export const parseOrderStatus = (progress = 0, status?: number) => {
  if (progress === 100) return Status.Completed;
  if (status && status > Date.now() / 1000) return Status.Open;

  switch (status) {
    case 1:
      return Status.Canceled;
    case 2:
      return Status.Completed;
    default:
      return Status.Expired;
  }
};

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function timeoutPromise(ms: number) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), ms));
}

export const useOrdersHistoryQuery = () => {
  const { lib, updateState, loading } = useTwapStore((state) => ({
    lib: state.lib,
    updateState: state.updateState,
    showConfirmation: state.showConfirmation,
    loading: state.loading,
  }));

  const queryKey = useMemo(() => [QueryKeys.GET_ORDER_HISTORY, lib?.maker, lib?.config.chainId], [lib?.maker, lib?.config.chainId]);

  const query = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      if (!lib || !lib.maker) return [];

      const orders = await getOrders({
        account: lib!.maker,
        signal,
        chainId: lib!.config.chainId,
        twapAddress: "",
      });
      const exchangeAddresses = [lib?.config.exchangeAddress, ...(LEGACY_EXCHANGE_ADDRESSES[lib?.config.name] || [])].map((it) => it.toLowerCase());
      // show orders for selected exchange
      const filtered = orders.filter((order) => exchangeAddresses.includes(order.exchange.toLowerCase()));

      async function fetchStatusesWithRetries(retries = 3, delay = 2000) {
        const statuses: { [address: string]: Status } = {};

        for (let attempt = 1; attempt <= retries; attempt++) {
          let provider = lib!.provider;
          if (attempt > 1) {
            provider = new Web3(`https://rpcman.orbs.network/rpc?chainId=${lib!.config.chainId}&appId=twap-ui`);
          }

          const multicall = new Multicall({
            web3Instance: provider,
            tryAggregate: true,
          });

          const context = filtered.map((order) => ({
            reference: order.id.toString(),
            contractAddress: order.twapAddress,
            abi: lib!.config.twapAbi,
            calls: [{ reference: "status", methodName: "status", methodParameters: [order.id] }],
          }));
          try {
            const r = (await await Promise.race([multicall.call(context), timeoutPromise(5_000)])) as ContractCallResults;
            Object.entries(r.results).forEach(([id, result]) => {
              const order = filtered.find((it) => it.id.toString() === id);
              const status = result.callsReturnContext[0].returnValues[0];

              statuses[id] = parseOrderStatus(order?.progress, status);
            });

            return statuses; // success
          } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);
            if (attempt < retries) {
              await sleep(delay); // wait before next retry
            } else {
              throw new Error("All retries failed.");
            }
          }
        }
      }

      const statuses = await fetchStatusesWithRetries();

      const res = filtered.map((it) => ({ ...it, status: statuses?.[it.id.toString()] || Status.Expired }));

      console.log(res.filter((it) => it.status === Status.Completed));

      return res;
    },
    staleTime: Infinity,
    refetchInterval: REFETCH_ORDER_HISTORY,
    enabled: !loading,
  });

  const onOrderCreated = useCallback(
    async (orderId?: number) => {
      updateState({ newOrderLoading: true });
      try {
        if (!orderId) {
          await query.refetch();
        } else {
          const fetchUntilUpdate = async () => {
            // eslint-disable-next-line no-constant-condition
            while (true) {
              const orders = (await query.refetch()).data;
              if (orders?.find((it) => it.id === orderId)) {
                break;
              }

              // Avoid hammering the server: wait a bit
              await new Promise((res) => setTimeout(res, 3_000)); // 1 second delay
            }
          };

          await fetchUntilUpdate();
        }
      } catch (error) {
        console.error(error);
      } finally {
        updateState({ newOrderLoading: false });
      }
    },
    [query]
  );

  const onOrderCancelled = useCallback(
    async (orderId: number) => {
      const fetchUntilUpdate = async () => {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const orders = (await query.refetch()).data;
          if (orders?.find((it) => it.id === orderId)?.status.toLowerCase() === Status.Canceled.toLowerCase()) {
            break;
          }

          // Avoid hammering the server: wait a bit
          await new Promise((res) => setTimeout(res, 3_000)); // 1 second delay
        }
      };

      await fetchUntilUpdate();
    },
    [query]
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

export const useShouldWrap = () => {
  const { srcToken, dstToken, config } = useTwapContext();
  return useMemo(() => {
    if (!srcToken || !dstToken) return false;
    return isNativeAddress(srcToken.address) && eqIgnoreCase(dstToken.address, config.wToken.address);
  }, [srcToken, dstToken, config]);
};

export const useShouldUnwrap = () => {
  const { srcToken, dstToken, config } = useTwapContext();
  return useMemo(() => {
    if (!srcToken || !dstToken) return false;
    return eqIgnoreCase(srcToken.address, config.wToken.address) && isNativeAddress(dstToken.address);
  }, [srcToken, dstToken, config]);
};

export const useSrcAmount = () => {
  const { srcToken } = useTwapContext();
  const amountUI = useTwapStore((s) => s.srcAmountUi);
  const amount = useAmountBN(amountUI, srcToken?.decimals);
  return {
    amount,
    amountUI: useMemo(() => removeCommas(amountUI), [amountUI]),
  };
};

export const useFormatNumber = ({
  value,
  decimalScale,
  prefix,
  suffix,
  disableDynamicDecimals = true,
  thousandSeparator = false,
}: {
  value?: string | number;
  decimalScale?: number;
  prefix?: string;
  suffix?: string;
  disableDynamicDecimals?: boolean;
  thousandSeparator?: boolean;
}) => {
  const result = useNumericFormat({
    allowLeadingZeros: true,
    thousandSeparator: thousandSeparator ? "," : "",
    displayType: "text",
    value: formatDecimalsV2(value?.toString(), decimalScale) || "",
    prefix,
    suffix,
  });

  const val = result.value?.toString();
  return useMemo(() => {
    const numericValue = Number(val || "0");

    if (!val || numericValue === 0) {
      return "0";
    }

    return val;
  }, [val]);
};

export const useSrcAmountNotZero = () => {
  const value = useSrcAmount().amount;

  return BN(value || 0).gt(0);
};

export const useToken = (isSrc?: boolean) => {
  const { srcToken, dstToken } = useTwapContext();

  return isSrc ? srcToken : dstToken;
};

export const useSwitchTokens = () => {
  const { dappTokens, onSrcTokenSelected, onDstTokenSelected } = useTwapContext();
  const { onReset } = useTradePrice();

  const { updateState } = useTwapStore((s) => ({
    updateState: s.updateState,
  }));
  const { srcToken, dstToken } = useTwapContext();
  return useCallback(() => {
    const _dstToken = getTokenFromTokensList(dappTokens, dstToken?.address || dstToken?.symbol);

    onSrcTokenSelected?.(_dstToken);

    updateState({
      srcAmountUi: "",
    });
    onReset();
  }, [dappTokens, srcToken, dstToken, onSrcTokenSelected, onDstTokenSelected, updateState, onReset]);
};

export const useDappRawSelectedTokens = () => {
  const { dappTokens, srcToken, dstToken } = useTwapContext();
  const tokensLength = _.size(dappTokens);

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
  const { maker, wrongNetwork, disclaimerAccepted, setShowConfirmation, showConfirmation, createOrderLoading, isLimitOrder } = useTwapStore((store) => ({
    maker: store.lib?.maker,

    wrongNetwork: store.wrongNetwork,
    disclaimerAccepted: store.disclaimerAccepted,
    setShowConfirmation: store.setShowConfirmation,
    showConfirmation: store.showConfirmation,
    createOrderLoading: store.loading,
    isLimitOrder: store.isLimitOrder,
  }));
  const shouldWrap = useShouldWrap();
  const shouldUnwrap = useShouldUnwrap();
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
  const { parsedTokens } = useTwapContext();

  return useMemo(() => {
    if (!address || !parsedTokens) return;
    return parsedTokens?.find((t) => eqIgnoreCase(t.address, address));
  }, [address, parsedTokens]);
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
    askDataParams: any[] = [],
    maxPriorityFeePerGas?: BN.Value,
    maxFeePerGas?: BN.Value
  ): Promise<{ txHash: string; orderId: number }> => {
    if (!lib) {
      throw new Error("lib is not defined");
    }

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
  const { amountUI: srcAmountUi, amount: srcAmount } = useSrcAmount();
  const shouldWrap = useShouldWrap();
  const { dstToken } = useTwapContext();
  const wrongNetwork = useTwapStore((s) => s.wrongNetwork);
  const shouldUnwrap = useShouldUnwrap();
  const { priceUI: tradePriceUI, isLoading, isCustom, gainPercent } = useTradePrice();
  const marketPriceUI = useMarketPriceV2().priceUI;
  const shouldWrapOrUwrapOnly = shouldWrap || shouldUnwrap;

  const dstUsd = useDstUsd().value.toString();

  const priceUI = useMemo(() => {
    let result = "";
    if (isCustom || gainPercent) {
      result = BN(srcAmountUi || 0)
        .times(tradePriceUI || 0)
        .toFixed();
    } else {
      result = marketPriceUI || "";
    }

    return formatWithDecimals(result);
  }, [tradePriceUI, srcAmountUi, marketPriceUI, isCustom, gainPercent]);

  const price = useAmountBN(priceUI, dstToken?.decimals);

  const amountUI = shouldWrapOrUwrapOnly ? srcAmountUi : priceUI;

  const usd = useMemo(() => {
    return BN(amountUI || "0")
      .times(dstUsd)
      .toFixed();
  }, [amountUI, dstUsd]);

  return {
    amount: isLoading ? "" : !srcAmountUi ? "" : shouldWrapOrUwrapOnly ? srcAmount : price,
    amountUI: wrongNetwork ? "" : isLoading ? "" : !srcAmountUi ? "" : amountUI,
    isLoading: !srcAmountUi ? false : isLoading,
    usd: !srcAmountUi ? "" : usd,
  };
};

export const useMarketPriceV2 = () => {
  const { marketPrice, marketPriceLoading, dstToken } = useTwapContext();
  const shouldWrap = useShouldWrap();
  const shouldUnwrap = useShouldUnwrap();
  const srcAmount = useSrcAmount().amount;
  const price = shouldWrap || shouldUnwrap ? srcAmount : marketPrice;

  return {
    priceUI: useAmountUi(dstToken?.decimals, price),
    price: price,
    isLoading: shouldWrap || shouldUnwrap ? false : marketPriceLoading,
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
  const wrongNetwork = useTwapStore((s) => s.wrongNetwork);
  const { dstToken } = useTwapContext();
  const percent = 1 + (limitPriceStore.gainPercent || 0) / 100;
  const isCustomLimitPrice = limitPriceStore.limitPrice !== undefined;
  const { priceUI: marketPrice, isLoading: marketPriceLoading } = useMarketPriceV2();
  const srcAmountUI = useSrcAmount().amountUI || "1";

  const priceUI = useMemo(() => {
    if (isCustomLimitPrice) {
      return limitPriceStore.limitPrice;
    }
    if (BN(marketPrice || 0).isZero()) return;
    let price = BN(marketPrice || "0")
      .dividedBy(srcAmountUI)
      .times(percent)
      .toString();

    return formatWithDecimals(price);
  }, [limitPriceStore.limitPrice, marketPrice, percent, isCustomLimitPrice, srcAmountUI]);

  const gainPercent = useMemo(() => {
    if (limitPriceStore.gainPercent !== undefined && !_.isNaN(limitPriceStore.gainPercent)) {
      return limitPriceStore.gainPercent;
    }

    if (!isCustomLimitPrice) {
      return 0;
    }

    const market = BN(marketPrice || "0")
      .dividedBy(srcAmountUI)
      .toFixed();
    const result = BN(priceUI || "0")
      .dividedBy(market || "0")
      .minus(1)
      .times(100)
      .decimalPlaces(2)
      .toNumber();
    return isNaN(result) ? 0 : result;
  }, [priceUI, marketPrice, limitPriceStore.gainPercent, srcAmountUI, isCustomLimitPrice]);

  const tokenUsd = useDstUsd().value.toString();

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
    priceUI: removeCommas(priceUI || ""),
    inputValue: wrongNetwork ? "" : priceUI,
    price: useAmountBN(priceUI, dstToken?.decimals),
    onChange: onChangeLimitPrice,
    onReset: limitPriceStore.onReset,
    isLoading: wrongNetwork ? false : marketPriceLoading,
    isCustom: isCustomLimitPrice,
    gainPercent,
    onPercent: onChangeGainPercent,
    usd,
  };
};

export const useDstMinAmountOut = () => {
  const limitPrice = useTradePrice().priceUI || "0";
  const srcChunkAmount = useSrcChunkAmount();
  const { lib, isLimitOrder } = useTwapStore((s) => ({
    lib: s.lib,
    isLimitOrder: s.isLimitOrder,
  }));

  const { srcToken, dstToken } = useTwapContext();

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
  const shouldWrap = useShouldWrap();
  const shouldUnwrap = useShouldUnwrap();

  const chunkSize = useSrcChunkAmount();
  const durationUi = useDurationUi();
  const { lib, isLimitOrder, fillDelayMillis } = useTwapStore((s) => ({
    isLimitOrder: s.isLimitOrder,
    lib: s.lib,
    fillDelayMillis: s.getFillDelayUiMillis() / 1000,
  }));
  const { srcToken, dstToken } = useTwapContext();
  const srcAmount = useSrcAmount().amount;

  const deadline = useDeadline();
  const dstAmountOut = useDstAmount().amountUI;

  const maxSrcInputAmount = useMaxSrcInputAmount();

  const isNativeTokenAndValueBiggerThanMax = maxSrcInputAmount && BN(srcAmount || 0).gt(maxSrcInputAmount);
  return useMemo(() => {
    if (!translation) return;
    if (!srcToken || !dstToken || lib?.validateTokens(srcToken, dstToken) === TokensValidation.invalid) {
      return {
        type: "tokens",
        message: translation.selectTokens,
      };
    }
    if (BN(srcAmount || 0).isZero()) {
      return {
        type: "input-amount",
        message: translation.enterAmount,
      };
    }
    if ((srcBalance && BN(srcAmount || 0).gt(srcBalance)) || isNativeTokenAndValueBiggerThanMax) {
      return {
        type: "balance",
        message: translation.insufficientFunds.replace("{token}", srcToken.symbol),
      };
    }

    if (shouldWrap || shouldUnwrap) return undefined;

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
    shouldWrap,
    shouldUnwrap,
  ]);
};

export const useAmountUi = (decimals?: number, value?: string) => {
  return useMemo(() => {
    if (!decimals || !value) return;
    return amountUiV2(decimals, value);
  }, [decimals, value]);
};

export const useSrcAmountUsdUi = () => {
  const srcAmount = useSrcAmount().amount;
  const srcToken = useTwapContext().srcToken;

  const srcUsd = useSrcUsd().value.toString();

  return useAmountUi(
    srcToken?.decimals,
    BN(srcAmount || 0)
      .times(srcUsd)
      .toString()
  );
};

export const useMaxPossibleChunks = () => {
  const { lib } = useTwapStore((s) => ({
    lib: s.lib,
  }));
  const srcAmount = useSrcAmount().amount;
  const srcToken = useTwapContext().srcToken;

  const srcUsd = useSrcUsd().value.toString();

  return useMemo(() => {
    if (!lib || !srcToken || !srcAmount || !srcUsd) return 1;
    return lib.maxPossibleChunks(srcToken, srcAmount, srcUsd);
  }, [srcAmount, srcToken, srcUsd]);
};

export const useMaxPossibleChunksReady = () => {
  const { lib } = useTwapStore((s) => ({
    lib: s.lib,
  }));

  const srcToken = useTwapContext().srcToken;
  const srcAmount = useSrcAmount().amount;

  const srcUsd = useSrcUsd().value.toString();

  return Boolean(lib && srcToken && srcAmount && srcUsd && BN(srcUsd).gt(0));
};

export const useChunks = () => {
  const srcUsd = useSrcUsd().value.toString();
  const { chunks } = useTwapStore((s) => ({
    chunks: s.chunks,
  }));

  const srcToken = useTwapContext().srcToken;
  const maxPossibleChunks = useMaxPossibleChunks();
  const srcAmountUsd = useSrcAmountUsdUi();
  const shouldWrap = useShouldWrap();
  const shouldUnwrap = useShouldUnwrap();

  return useMemo(() => {
    if (!srcUsd || !srcToken || shouldUnwrap || shouldWrap) return 1;

    if (chunks !== undefined || BN(srcAmountUsd || 0).isZero()) return chunks || 1;
    return Math.min(
      maxPossibleChunks,
      BN(srcAmountUsd || "0")
        .idiv(SUGGEST_CHUNK_VALUE)
        .toNumber() || 1
    );
  }, [srcUsd, srcToken, chunks, maxPossibleChunks, srcAmountUsd, shouldWrap, shouldUnwrap]);
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
  const srcToken = useTwapContext().srcToken;
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
  const srcToken = useTwapContext().srcToken;
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
  const srcToken = useTwapContext().srcToken;
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
  const { lib } = useTwapStore((s) => ({
    lib: s.lib,
  }));
  const chunks = useChunks();
  const srcAmount = useSrcAmount().amount;

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
  const srcToken = useTwapContext().srcToken;
  const srcChunksAmount = useSrcChunkAmount();

  return useAmountUi(srcToken?.decimals, srcChunksAmount.toString());
};

export const useChunksBiggerThanOne = () => {
  const srcToken = useTwapContext().srcToken;
  const srcAmountUi = useSrcAmount().amountUI;
  const maxPossibleChunks = useMaxPossibleChunks();

  return useMemo(() => {
    if (!srcToken || !srcAmountUi) return false;
    return maxPossibleChunks > 1;
  }, [maxPossibleChunks, srcToken, srcAmountUi]);
};

export const useDeadline = () => {
  const currentTime = useTwapStore((s) => s.currentTime);

  const durationUi = useDurationUi();

  // return useMemo(() => {
  //   return moment(currentTime)
  //     .add((durationUi.amount || 0) * durationUi.resolution)
  //     .add(10, "days")
  //     .valueOf();
  // }, [durationUi, currentTime]);

  return useMemo(() => {
    return moment(currentTime)
      .add((durationUi.amount || 0) * durationUi.resolution)
      .add(1, "minute")
      .valueOf();
  }, [durationUi, currentTime]);
};

export const useDeadlineUi = () => {
  const deadline = useDeadline();

  return useMemo(() => moment(deadline).format("ll HH:mm"), [deadline]);
};

export const useSetSrcAmountUi = () => {
  const { updateState, lib } = useTwapStore((s) => ({
    updateState: s.updateState,
    lib: s.lib,
  }));
  const srcToken = useTwapContext().srcToken;
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

export const useIsMobile = (breakpoint: number = 700) => {
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= breakpoint);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    // Attach the resize event listener
    window.addEventListener("resize", handleResize);

    // Run once to ensure the state is correct on mount
    handleResize();

    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [breakpoint]);

  return isMobile;
};

export const getDecimals = (value?: string | number, decimalScale = 0) => {
  const val = BN(value || 0);

  const getDecimalsUnder1 = (value: string): number => {
    if (!value) return 0;

    const numericValue = Number(value); // Ensure the value is treated as a number
    if (isNaN(numericValue)) return 0;

    const [, decimal] = BN(numericValue).toFixed().split(".");
    if (!decimal) return 0; // No decimal part

    const arr = decimal.split("");

    let leadingZerosCount = 0;

    // Count leading zeros in the decimal part
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === "0") {
        leadingZerosCount++;
      } else {
        break;
      }
    }
    // Return the total number of decimals, adding leading zeros count
    return leadingZerosCount + (decimalScale || 5);
  };

  let decimals = Math.min(getDecimalsUnder1(val.toString()), 9);

  if (val.gte(1) && decimalScale) {
    return decimalScale;
  }

  if (val.gte(1)) {
    decimals = 5;
  }
  if (val.gte(10)) {
    decimals = 4;
  }

  if (val.gte(100)) {
    decimals = 3;
  }

  if (val.gte(1000)) {
    decimals = 2;
  }

  if (val.gte(10_000)) {
    decimals = 1;
  }

  if (val.gte(100_000)) {
    decimals = 0;
  }

  return Number(decimals);
};

export function formatDecimalsV2(value?: string, scale = 5, maxDecimals = 18): string {
  if (!value) return "";

  // ─── keep the sign, work with the absolute value ────────────────
  const sign = value.startsWith("-") ? "-" : "";
  const abs = sign ? value.slice(1) : value;

  const [intPart, rawDec = ""] = abs.split(".");

  // Fast-path: decimal part is all zeros (or absent) ───────────────
  if (!rawDec || Number(rawDec) === 0) return sign + intPart;

  /** Case 1 – |value| ≥ 1 *****************************************/
  if (intPart !== "0") {
    const sliced = rawDec.slice(0, scale);
    const cleaned = sliced.replace(/0+$/, ""); // drop trailing zeros
    const trimmed = cleaned ? "." + cleaned : "";
    return sign + intPart + trimmed;
  }

  /** Case 2 – |value| < 1 *****************************************/
  const firstSigIdx = rawDec.search(/[^0]/); // first non-zero position
  if (firstSigIdx === -1) return "0"; // decimal part is all zeros
  if (firstSigIdx + 1 > maxDecimals) return "0"; // too many leading zeros → 0

  const leadingZeros = rawDec.slice(0, firstSigIdx); // keep them
  const significantRaw = rawDec.slice(firstSigIdx).slice(0, scale);
  const significant = significantRaw.replace(/0+$/, ""); // trim trailing zeros

  return significant ? sign + "0." + leadingZeros + significant : "0";
}

export const formatWithDecimals = (value?: string | number, decimalScale?: number) => {
  if (value == null) return ""; // Handle null/undefined inputs

  const [int, dec] = value.toString().split(".");

  // Fallback for decimalsCount
  const decimalsCount = getDecimals(value, decimalScale);

  // No decimal part
  if (!dec) {
    return int;
  }

  // No decimal scale specified or zero decimals
  if (!decimalsCount) {
    return int;
  }

  // Format with the specified number of decimal places
  const result = `${int}.${dec.slice(0, decimalsCount)}`;

  if (Number(result) === 0) return "0";

  return result;
};
